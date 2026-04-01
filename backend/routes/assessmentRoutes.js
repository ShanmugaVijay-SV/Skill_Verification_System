const express = require("express");
const router = express.Router();
const {
	submitAssessment,
	getMyResults,
	getLeaderboard,
	checkCooldown,
	submitAssessmentFeedback,
	reportQuestionIssue,
	getMyQuestionReports,
} = require("../controllers/assessmentController");
const { verifyToken } = require("../middleware/authMiddleware");

// Check cooldown status before attempting
router.get("/cooldown/:domainId", verifyToken, checkCooldown);

// Submit assessment
router.post("/submit", verifyToken, submitAssessment);

// Get my assessment results
router.get("/my-results", verifyToken, getMyResults);

// Get leaderboard for domain
router.get("/leaderboard/:domainId", verifyToken, getLeaderboard);

// Submit feedback after assessment
router.post("/feedback", verifyToken, submitAssessmentFeedback);

// Report incorrect/buggy question during assessment
router.post("/question-report", verifyToken, reportQuestionIssue);

// Get current student's question issue reports and admin replies
router.get("/my-question-reports", verifyToken, getMyQuestionReports);

module.exports = router;
