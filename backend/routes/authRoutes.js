const express = require("express");
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin, changePassword } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/admin/login", loginAdmin);
router.post("/change-password", verifyToken, changePassword);


module.exports = router;
