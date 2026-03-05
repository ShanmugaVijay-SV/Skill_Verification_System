const express = require("express");
const router = express.Router();

const { addQuestion, getQuestionsByDomain, getQuestionsByDomainAdmin, getQuestionById, updateQuestion, deleteQuestion } = require("../controllers/questionController");
const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// Admin - Add question
router.post("/add", verifyToken, verifyAdmin, addQuestion);

// Admin - Get all questions by domain (with pagination & answers visible)
router.get("/admin/:domainId", verifyToken, verifyAdmin, getQuestionsByDomainAdmin);

// Admin - Get single question
router.get("/admin/detail/:id", verifyToken, verifyAdmin, getQuestionById);

// Admin - Update question
router.put("/:id", verifyToken, verifyAdmin, updateQuestion);

// Admin - Delete question
router.delete("/:id", verifyToken, verifyAdmin, deleteQuestion);

// Student - Get questions by domain (for assessment, hidden correct answers)
router.get("/:domainId", verifyToken, getQuestionsByDomain);

module.exports = router;
