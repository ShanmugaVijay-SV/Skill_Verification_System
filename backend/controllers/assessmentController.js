const db = require("../config/db");


const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


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

            if (percentage < 40) {
                resultStatus = "Fail";
            } else {
                resultStatus = "Pass";

                if (percentage < 60) {
                    level = "Beginner";
                } else if (percentage < 80) {
                    level = "Intermediate";
                } else {
                    level = "Expert";
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

    if (percentage >= 40) {

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

            if (percentage < 40) {
                resultStatus = "Fail";
            } else {
                resultStatus = "Pass";

                if (percentage < 60) {
                    level = "Beginner";
                } else if (percentage < 80) {
                    level = "Intermediate";
                } else {
                    level = "Expert";
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


