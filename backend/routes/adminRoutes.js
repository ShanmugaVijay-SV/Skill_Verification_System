const express = require("express");
const router = express.Router();
const {
	getDashboardStats,
	getAllStudents,
	getReportsByDomain,
	getStudentResults,
	getQuestionIssueReports,
	replyToQuestionIssue,
} = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// Get dashboard statistics
router.get("/stats", verifyToken, verifyAdmin, getDashboardStats);

// Get all students with their stats
router.get("/students", verifyToken, verifyAdmin, getAllStudents);

// Get detailed reports by domain
router.get("/reports/domains", verifyToken, verifyAdmin, getReportsByDomain);

// Get detailed results for a specific student
router.get("/students/:studentId/results", verifyToken, verifyAdmin, getStudentResults);

// Get all reported question issues (notification-like feed)
router.get("/question-issues", verifyToken, verifyAdmin, getQuestionIssueReports);

// Reply/update issue status (resolved/open) with custom admin message
router.put("/question-issues/:reportId/reply", verifyToken, verifyAdmin, replyToQuestionIssue);

module.exports = router;