const express = require("express");
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin, changePassword, logout } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/admin/login", loginAdmin);
router.post("/change-password", verifyToken, changePassword);
router.post("/logout", verifyToken, logout);

module.exports = router;
