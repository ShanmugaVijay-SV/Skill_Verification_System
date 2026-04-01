const db = require("../config/db");


const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const ensureFeedbackTables = (callback) => {
    const createFeedbackTable = `
        CREATE TABLE IF NOT EXISTS assessment_feedback (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            domain_id INT NOT NULL,
            rating TINYINT NOT NULL,
            comment TEXT NULL,
            result_status VARCHAR(20) NULL,
            percentage DECIMAL(5,2) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_feedback_student (student_id),
            INDEX idx_feedback_domain (domain_id)
        )
    `;

    const createQuestionReportTable = `
        CREATE TABLE IF NOT EXISTS question_issue_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            domain_id INT NOT NULL,
            question_id INT NOT NULL,
            issue_type VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_issue_student (student_id),
            INDEX idx_issue_question (question_id),
            INDEX idx_issue_status (status)
        )
    `;

    const alterAdminReply = `ALTER TABLE question_issue_reports ADD COLUMN admin_reply TEXT NULL`;
    const alterResolvedAt = `ALTER TABLE question_issue_reports ADD COLUMN resolved_at TIMESTAMP NULL`;
    const alterResolvedBy = `ALTER TABLE question_issue_reports ADD COLUMN resolved_by INT NULL`;

    db.query(createFeedbackTable, (feedbackErr) => {
        if (feedbackErr) return callback(feedbackErr);

        db.query(createQuestionReportTable, (issueErr) => {
            if (issueErr) return callback(issueErr);

            db.query(alterAdminReply, (replyErr) => {
                if (replyErr && replyErr.code !== "ER_DUP_FIELDNAME") return callback(replyErr);

                db.query(alterResolvedAt, (resolvedAtErr) => {
                    if (resolvedAtErr && resolvedAtErr.code !== "ER_DUP_FIELDNAME") return callback(resolvedAtErr);

                    db.query(alterResolvedBy, (resolvedByErr) => {
                        if (resolvedByErr && resolvedByErr.code !== "ER_DUP_FIELDNAME") return callback(resolvedByErr);
                        callback(null);
                    });
                });
            });
        });
    });
};


// Check Cooldown Status
exports.checkCooldown = (req, res) => {
    const studentId = req.user.id;
    const { domainId } = req.params;

    const checkAttemptQuery = `
        SELECT * FROM attempts
        WHERE student_id = ? AND domain_id = ?
        ORDER BY attempt_date DESC
        LIMIT 1
    `;

    db.query(checkAttemptQuery, [studentId, domainId], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                status: "error",
                message: "Database error" 
            });
        }

        if (results.length === 0) {
            return res.status(200).json({
                status: "success",
                message: "No previous attempts",
                canAttempt: true
            });
        }

        const lastAttempt = new Date(results[0].attempt_date);
        const now = new Date();
        const diffHours = (now - lastAttempt) / (1000 * 60 * 60);

        if (diffHours < 72) {
            const nextAvailableDate = new Date(lastAttempt.getTime() + 72 * 60 * 60 * 1000);
            return res.status(200).json({
                status: "error",
                message: "Cooldown period active",
                canAttempt: false,
                nextAttemptDate: nextAvailableDate,
                hoursRemaining: (72 - diffHours).toFixed(2)
            });
        }

        res.status(200).json({
            status: "success",
            message: "Cooldown period completed",
            canAttempt: true,
            lastAttempt: results[0].attempt_date
        });
    });
};

// Submit Assessment
exports.submitAssessment = (req, res) => {
    const studentId = req.user.id;
    const { domainId, answers } = req.body;

    if (!answers || answers.length === 0) {
        return res.status(400).json({ 
            status: "error",
            message: "No answers submitted" 
        });
    }

    // 1️⃣ Check 72-hour restriction
    const checkAttemptQuery = `
        SELECT * FROM attempts
        WHERE student_id = ? AND domain_id = ?
        ORDER BY attempt_date DESC
        LIMIT 1
    `;

    db.query(checkAttemptQuery, [studentId, domainId], (err, results) => {
        if (err) return res.status(500).json({ 
          status: "error",
          message: "Database error" 
        });

        if (results.length > 0) {
            const lastAttempt = new Date(results[0].attempt_date);
            const now = new Date();
            const diffHours = (now - lastAttempt) / (1000 * 60 * 60);

            if (diffHours < 72) {
                const nextAvailableDate = new Date(lastAttempt.getTime() + 72 * 60 * 60 * 1000);
                return res.status(400).json({
                    status: "error",
                    message: "Cooldown period active. Please wait before reattempting.",
                    nextAttemptDate: nextAvailableDate,
                    hoursRemaining: (72 - diffHours).toFixed(2)
                });
            }
        }

        // 2️⃣ Get correct answers
        const questionIds = answers.map(a => a.questionId);

        const getAnswersQuery = `
            SELECT id, correct_answer
            FROM questions
            WHERE id IN (?)
        `;

        db.query(getAnswersQuery, [questionIds], (err, correctResults) => {
            if (err) return res.status(500).json({ 
              status: "error",
              message: "Error fetching answers" 
            });

            let score = 0;

            // Debug: log submitted answers and correct answers
            console.log("submitAssessment - received answers:", answers);
            console.log("submitAssessment - correctResults:", correctResults);

            correctResults.forEach(question => {
                // Match numeric/string IDs safely
                const studentAnswer = answers.find(a => Number(a.questionId) === Number(question.id));

                const selected = studentAnswer ? String(studentAnswer.selectedAnswer).toLowerCase() : null;
                const correct = question.correct_answer ? String(question.correct_answer).toLowerCase() : null;

                console.log(`Question ${question.id} -> selected: ${selected}, correct: ${correct}`);

                if (selected && correct && selected === correct) {
                    score++;
                }
            });

            // 3️⃣ Calculate Result
            let percentage = (score / answers.length) * 100;
            let resultStatus;
            let level = null;

            if (percentage < 50) {
                resultStatus = "Fail";
                level = "Fail";
            } else {
                resultStatus = "Pass";

                if (percentage >= 90) {
                    level = "Expert";
                } else if (percentage >= 70) {
                    level = "Intermediate";
                } else {
                    level = "Beginner";
                }
            }

            const getDomainQuery = `SELECT name FROM domains WHERE id = ?`;

db.query(getDomainQuery, [domainId], (err, domainResult) => {

    if (err || domainResult.length === 0) {
        return res.status(500).json({ 
          status: "error",
          message: "Domain not found" 
        });
    }

    const domainName = domainResult[0].name;

    let certificatePath = null;

    if (percentage >= 50) {

        const doc = new PDFDocument({ size: "A4", layout: "landscape" });

        const fileName = `certificate_${studentId}_${Date.now()}.pdf`;
        const folderPath = path.join(__dirname, "../certificates");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        const filePath = path.join(folderPath, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // 🔥 Border
        doc
            .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
            .stroke();

        doc.moveDown(3);

        // Title
        doc
            .fontSize(32)
            .text("CERTIFICATE OF ACHIEVEMENT", { align: "center" });

        doc.moveDown(2);

        doc
            .fontSize(20)
            .text("This is proudly presented to", { align: "center" });

        doc.moveDown();

        doc
            .fontSize(28)
            .text(req.user.name || "Student", { align: "center" });

        doc.moveDown(1.5);

        doc
            .fontSize(18)
            .text(
                `For successfully completing the ${domainName} Assessment`,
                { align: "center" }
            );

        doc.moveDown();

        doc
            .fontSize(16)
            .text(`Score: ${percentage.toFixed(2)}%`, { align: "center" });

        doc.text(`Level Achieved: ${level}`, { align: "center" });

        doc.moveDown(2);

        doc
            .fontSize(14)
            .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

        doc.moveDown(3);

        doc
            .fontSize(16)
            .text("Skill Verification System", { align: "center" });

        doc.end();

        certificatePath = `/certificates/${fileName}`;
    }

    // Save attempt AFTER certificate generation
    const insertAttemptQuery = `
        INSERT INTO attempts 
        (student_id, domain_id, score, total_questions)
        VALUES (?, ?, ?, ?)
    `;

            db.query(
            insertAttemptQuery,
            [studentId, domainId, score, answers.length],
            (err) => {
                if (err) return res.status(500).json({ 
                  status: "error",
                  message: "Failed to save attempt" 
                });

                res.status(200).json({
                    status: "success",
                    message: "Assessment submitted successfully",
                    data: {
                      score,
                      total: answers.length,
                      percentage: percentage.toFixed(2),
                      result: resultStatus,
                      level,
                      certificate: certificatePath
                    }
                });
                });
            }
        );

    }); // close getDomainQuery

        }); // close getAnswersQuery

    }; // close checkAttemptQuery

; // close submitAssessment




// Get My Results (Dashboard)
exports.getMyResults = (req, res) => {
    const studentId = req.user.id; // from verifyToken middleware

    const query = `
        SELECT 
            d.name AS domain_name,
            a.score,
            a.total_questions,
            a.attempt_date
        FROM attempts a
        JOIN domains d ON a.domain_id = d.id
        WHERE a.student_id = ?
        ORDER BY a.attempt_date DESC
    `;

    db.query(query, [studentId], (err, results) => {
        if (err) {
            return res.status(500).json({ 
              status: "error",
              message: "Database error" 
            });
        }

        // Add percentage, result, level dynamically
        const formattedResults = results.map(attempt => {
            let percentage = (attempt.score / attempt.total_questions) * 100;

            let resultStatus;
            let level = null;

            if (percentage < 50) {
                resultStatus = "Fail";
                level = "Fail";
            } else {
                resultStatus = "Pass";

                if (percentage >= 90) {
                    level = "Expert";
                } else if (percentage >= 70) {
                    level = "Intermediate";
                } else {
                    level = "Beginner";
                }
            }

            return {
                domain: attempt.domain_name,
                score: attempt.score,
                total: attempt.total_questions,
                percentage: percentage.toFixed(2),
                result: resultStatus,
                level,
                attemptDate: attempt.attempt_date
            };
        });

        res.status(200).json({
            status: "success",
            message: "Results fetched successfully",
            data: formattedResults
        });
    });
};

exports.getLeaderboard = (req, res) => {
    const { domainId } = req.params;

    const query = `
        SELECT 
            u.name AS student_name,
            MAX((a.score / a.total_questions) * 100) AS percentage
        FROM attempts a
        JOIN users u ON a.student_id = u.id
        WHERE a.domain_id = ?
        GROUP BY a.student_id
        ORDER BY percentage DESC
        LIMIT 10
    `;

    db.query(query, [domainId], (err, results) => {
        if (err) {
            return res.status(500).json({ 
              status: "error",
              message: "Database error" 
            });
        }

        res.status(200).json({
            status: "success",
            message: "Leaderboard fetched successfully",
            data: results
        });
    });
};

exports.submitAssessmentFeedback = (req, res) => {
    const studentId = req.user.id;
    const { domainId, rating, comment, result, percentage } = req.body;

    const parsedDomainId = parseInt(domainId, 10);
    const parsedRating = parseInt(rating, 10);
    const parsedPercentage = percentage != null ? parseFloat(percentage) : null;

    if (!parsedDomainId || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({
            status: "error",
            message: "Valid domain and rating (1 to 5) are required"
        });
    }

    ensureFeedbackTables((tableErr) => {
        if (tableErr) {
            return res.status(500).json({
                status: "error",
                message: "Failed to prepare feedback storage"
            });
        }

        const insertQuery = `
            INSERT INTO assessment_feedback
            (student_id, domain_id, rating, comment, result_status, percentage)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertQuery,
            [
                studentId,
                parsedDomainId,
                parsedRating,
                comment ? String(comment).trim() : null,
                result ? String(result).trim() : null,
                Number.isNaN(parsedPercentage) ? null : parsedPercentage,
            ],
            (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({
                        status: "error",
                        message: "Failed to submit feedback"
                    });
                }

                res.status(201).json({
                    status: "success",
                    message: "Feedback submitted successfully"
                });
            }
        );
    });
};

exports.reportQuestionIssue = (req, res) => {
    const studentId = req.user.id;
    const { domainId, questionId, issueType, description } = req.body;

    const parsedDomainId = parseInt(domainId, 10);
    const parsedQuestionId = parseInt(questionId, 10);
    const normalizedIssueType = issueType ? String(issueType).trim() : "";
    const normalizedDescription = description ? String(description).trim() : "";

    if (!parsedDomainId || !parsedQuestionId || !normalizedIssueType || normalizedDescription.length < 10) {
        return res.status(400).json({
            status: "error",
            message: "Domain, question, issue type and detailed description are required"
        });
    }

    ensureFeedbackTables((tableErr) => {
        if (tableErr) {
            return res.status(500).json({
                status: "error",
                message: "Failed to prepare report storage"
            });
        }

        const insertQuery = `
            INSERT INTO question_issue_reports
            (student_id, domain_id, question_id, issue_type, description)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            insertQuery,
            [studentId, parsedDomainId, parsedQuestionId, normalizedIssueType, normalizedDescription],
            (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({
                        status: "error",
                        message: "Failed to submit question report"
                    });
                }

                res.status(201).json({
                    status: "success",
                    message: "Question issue reported successfully"
                });
            }
        );
    });
};

exports.getMyQuestionReports = (req, res) => {
    const studentId = req.user.id;

    ensureFeedbackTables((tableErr) => {
        if (tableErr) {
            return res.status(500).json({
                status: "error",
                message: "Failed to prepare report storage"
            });
        }

        const query = `
            SELECT
                qir.id,
                qir.issue_type,
                qir.description,
                qir.status,
                qir.admin_reply,
                qir.created_at,
                qir.resolved_at,
                d.name AS domain_name,
                q.question_text
            FROM question_issue_reports qir
            JOIN domains d ON d.id = qir.domain_id
            LEFT JOIN questions q ON q.id = qir.question_id
            WHERE qir.student_id = ?
            ORDER BY qir.created_at DESC
        `;

        db.query(query, [studentId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to fetch your issue reports"
                });
            }

            res.status(200).json({
                status: "success",
                message: "Issue reports fetched successfully",
                data: results,
            });
        });
    });
};


