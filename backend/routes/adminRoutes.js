const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllStudents, getReportsByDomain, getStudentResults } = require("../controllers/adminController");
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

module.exports = router;