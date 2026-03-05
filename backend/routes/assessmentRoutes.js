const express = require("express");
const router = express.Router();
const { submitAssessment, getMyResults, getLeaderboard, checkCooldown } = require("../controllers/assessmentController");
const { verifyToken } = require("../middleware/authMiddleware");

// Check cooldown status before attempting
router.get("/cooldown/:domainId", verifyToken, checkCooldown);

// Submit assessment
router.post("/submit", verifyToken, submitAssessment);

// Get my assessment results
router.get("/my-results", verifyToken, getMyResults);

// Get leaderboard for domain
router.get("/leaderboard/:domainId", verifyToken, getLeaderboard);

module.exports = router;
