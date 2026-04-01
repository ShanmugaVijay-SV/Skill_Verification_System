const db = require("../config/db");

const ensureIssueReportTableAndColumns = (callback) => {
  const createIssueReportTable = `
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

  db.query(createIssueReportTable, (createErr) => {
    if (createErr) return callback(createErr);

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
};

// Get Dashboard Statistics
const getDashboardStats = (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS totalStudents,
        (SELECT COUNT(*) FROM attempts) AS totalAssessments,
        (SELECT COUNT(*) FROM domains) AS totalDomains,
        (SELECT COUNT(*) FROM questions) AS totalQuestions,
        (SELECT AVG((CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100) FROM attempts) AS averageScore,
        (SELECT COUNT(*) FROM attempts WHERE (CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100 >= 50) AS passedAttemptCount,
        (SELECT COUNT(*) FROM domains) AS domainCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts 
           WHERE (CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100 >= 90) AS expertCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts 
           WHERE (CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100 >= 70 AND (CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100 < 90) AS intermediateCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts 
           WHERE (CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100 >= 50 AND (CAST(score AS DECIMAL(10,2)) / CAST(total_questions AS DECIMAL(10,2))) * 100 < 70) AS beginnerCount
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Dashboard stats error:", err);
        return res.status(500).json({ 
          status: "error",
          message: "Failed to fetch dashboard stats" 
        });
      }

      const data = results[0];
      
      // Attempt-based pass rate: passed attempts / total attempts
      const passRate = data.totalAssessments > 0 
        ? (data.passedAttemptCount / data.totalAssessments * 100) 
        : 0;
      
      // Calculate average questions per domain
      const avgQuestionsPerDomain = data.domainCount > 0 
        ? (data.totalQuestions / data.domainCount) 
        : 0;

      res.status(200).json({
        status: "success",
        message: "Dashboard stats fetched successfully",
        data: {
          totalStudents: data.totalStudents || 0,
          totalAssessments: data.totalAssessments || 0,
          totalDomains: data.totalDomains || 0,
          totalQuestions: data.totalQuestions || 0,
          averageScore: data.averageScore ? parseFloat(data.averageScore).toFixed(2) : 0,
          passRate: parseFloat(passRate).toFixed(2),
          avgQuestionsPerDomain: avgQuestionsPerDomain.toFixed(2),
          expertCount: data.expertCount || 0,
          intermediateCount: data.intermediateCount || 0,
          beginnerCount: data.beginnerCount || 0
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
};

// Get All Students
const getAllStudents = (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        COUNT(a.id) AS total_attempts,
        AVG((a.score / a.total_questions) * 100) AS avg_score
      FROM users u
      LEFT JOIN attempts a ON u.id = a.student_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.name ASC
    `;

    db.query(query, (err, students) => {
      if (err) {
        console.error("getAllStudents db error:", err);
        return res.status(500).json({ 
          status: "error",
          message: "Failed to fetch students" 
        });
      }

      console.log("getAllStudents result:", students);
      res.status(200).json({
        status: "success",
        message: "Students fetched successfully",
        data: students
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
};

// Get Detailed Reports by Domain
const getReportsByDomain = (req, res) => {
  try {
    const query = `
      SELECT 
        d.id AS domain_id,
        d.name AS domain_name,
        COUNT(a.id) AS total_attempts,
        AVG((a.score / a.total_questions) * 100) AS average_score,
        COUNT(DISTINCT a.student_id) AS unique_students,
        SUM(CASE WHEN (a.score / a.total_questions) * 100 >= 60 THEN 1 ELSE 0 END) AS pass_count,
        COUNT(a.id) AS total_attempts_calc,
        MAX((a.score / a.total_questions) * 100) AS highest_score,
        (SUM(CASE WHEN (a.score / a.total_questions) * 100 >= 60 THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0)) * 100 AS pass_rate
      FROM domains d
      LEFT JOIN attempts a ON d.id = a.domain_id
      GROUP BY d.id, d.name
      ORDER BY d.name ASC
    `;

    db.query(query, (err, reports) => {
      if (err) {
        console.error("getReportsByDomain error:", err);
        return res.status(500).json({ 
          status: "error",
          message: "Failed to fetch reports" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Reports fetched successfully",
        data: reports.map(report => ({
          domain_id: report.domain_id,
          domain_name: report.domain_name,
          total_attempts: report.total_attempts || 0,
          average_score: report.average_score ? parseFloat(report.average_score).toFixed(2) : 0,
          unique_students: report.unique_students || 0,
          pass_rate: report.pass_rate ? parseFloat(report.pass_rate).toFixed(2) : 0,
          highest_score: report.highest_score ? parseFloat(report.highest_score).toFixed(2) : 0
        }))
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
};

// Get Student Detailed Results
const getStudentResults = (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT 
        a.id,
        d.name AS domain_name,
        a.score,
        a.total_questions,
        (a.score / a.total_questions) * 100 AS percentage,
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
          message: "Failed to fetch student results" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Student results fetched successfully",
        data: results
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
};

const getQuestionIssueReports = (req, res) => {
  ensureIssueReportTableAndColumns((tableErr) => {
    if (tableErr) {
      return res.status(500).json({
        status: "error",
        message: "Failed to prepare issue report notifications"
      });
    }

    const { status } = req.query;
    let query = `
      SELECT
        qir.id,
        qir.student_id,
        qir.domain_id,
        qir.question_id,
        qir.issue_type,
        qir.description,
        qir.status,
        qir.admin_reply,
        qir.created_at,
        qir.resolved_at,
        qir.resolved_by,
        u.name AS student_name,
        u.email AS student_email,
        d.name AS domain_name,
        q.question_text,
        admin_user.name AS resolved_by_name
      FROM question_issue_reports qir
      LEFT JOIN users u ON qir.student_id = u.id
      LEFT JOIN domains d ON qir.domain_id = d.id
      LEFT JOIN questions q ON qir.question_id = q.id
      LEFT JOIN users admin_user ON qir.resolved_by = admin_user.id
    `;

    let queryParams = [];

    if (status && (status === "open" || status === "resolved")) {
      query += ` WHERE qir.status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY
        CASE WHEN qir.status = 'open' THEN 0 ELSE 1 END,
        qir.created_at DESC
    `;

    db.query(query, queryParams, (err, reports) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Failed to fetch issue reports"
        });
      }

      res.status(200).json({
        status: "success",
        message: "Issue reports fetched successfully",
        data: reports
      });
    });
  });
};

const replyToQuestionIssue = (req, res) => {
  const adminId = req.user.id;
  const { reportId } = req.params;
  const { status, adminReply } = req.body;

  const validStatus = ["open", "resolved"];
  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";
  const normalizedReply = typeof adminReply === "string" ? adminReply.trim() : "";

  if (!reportId || !validStatus.includes(normalizedStatus)) {
    return res.status(400).json({
      status: "error",
      message: "Valid reportId and status are required"
    });
  }

  if (normalizedReply.length < 3) {
    return res.status(400).json({
      status: "error",
      message: "Reply must be at least 3 characters"
    });
  }

  ensureIssueReportTableAndColumns((tableErr) => {
    if (tableErr) {
      return res.status(500).json({
        status: "error",
        message: "Failed to prepare issue report notifications"
      });
    }

    const updateQuery = `
      UPDATE question_issue_reports
      SET status = ?,
          admin_reply = ?,
          resolved_by = ?,
          resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE NULL END
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [normalizedStatus, normalizedReply, adminId, normalizedStatus, reportId],
      (updateErr, result) => {
        if (updateErr) {
          return res.status(500).json({
            status: "error",
            message: "Failed to update issue report"
          });
        }

        if (!result.affectedRows) {
          return res.status(404).json({
            status: "error",
            message: "Issue report not found"
          });
        }

        res.status(200).json({
          status: "success",
          message: "Issue report updated successfully"
        });
      }
    );
  });
};

module.exports = { 
  getDashboardStats, 
  getAllStudents,
  getReportsByDomain,
  getStudentResults,
  getQuestionIssueReports,
  replyToQuestionIssue
};