const db = require("../config/db");

// Get Dashboard Statistics
const getDashboardStats = (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS totalStudents,
        (SELECT COUNT(*) FROM attempts) AS totalAssessments,
        (SELECT COUNT(*) FROM domains) AS totalDomains,
        (SELECT COUNT(*) FROM questions) AS totalQuestions,
        (SELECT AVG((score / total_questions) * 100) FROM attempts) AS averageScore,
        (SELECT COUNT(DISTINCT student_id) FROM attempts WHERE (score / total_questions) * 100 >= 60) AS passCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts) AS totalAttemptedStudents,
        (SELECT COUNT(*) FROM domains) AS domainCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts 
         WHERE (score / total_questions) * 100 >= 80) AS expertCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts 
         WHERE (score / total_questions) * 100 >= 60 AND (score / total_questions) * 100 < 80) AS intermediateCount,
        (SELECT COUNT(DISTINCT student_id) FROM attempts 
         WHERE (score / total_questions) * 100 < 60) AS beginnerCount
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
      
      // Calculate pass rate
      const passRate = data.totalAttemptedStudents > 0 
        ? (data.passCount / data.totalAttemptedStudents * 100) 
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

module.exports = { 
  getDashboardStats, 
  getAllStudents,
  getReportsByDomain,
  getStudentResults
};