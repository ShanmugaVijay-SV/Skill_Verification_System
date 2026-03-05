require("dotenv").config();
const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const domainRoutes = require("./routes/domainRoutes");

const { verifyToken } = require("./middleware/authMiddleware");
const { verifyAdmin } = require("./middleware/adminMiddleware");
const questionRoutes = require("./routes/questionRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const adminRoutes = require("./routes/adminRoutes");



const app = express();

app.use(cors());
app.use(express.json());

// ensure default admin account exists
const bcrypt = require("bcrypt");
const ensureAdmin = () => {
    const email = "admin@example.com";
    const name = "Administrator";
    const defaultPassword = "admin123";

    const checkQuery = "SELECT * FROM users WHERE email = ? AND role = 'admin'";
    db.query(checkQuery, [email.toLowerCase()], async (err, results) => {
        if (err) {
            console.error("Error checking for default admin", err);
            return;
        }
        if (results.length === 0) {
            const hashed = await bcrypt.hash(defaultPassword, 10);
            const insertQuery = "INSERT INTO users (name,email,password,role) VALUES (?,?,?,'admin')";
            db.query(insertQuery, [name, email.toLowerCase(), hashed], (err) => {
                if (err) {
                    console.error("Failed to create default admin", err);
                } else {
                    console.log("Default admin user created: admin@example.com / admin123");
                }
            });
        } else {
            console.log("Default admin already exists");
        }
    });
};

enable = ensureAdmin();

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/assessment", assessmentRoutes);


app.use("/certificates", express.static("certificates"));


app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("Skill Verification System API Running...");
});

app.get("/api/protected", verifyToken, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user
    });
});


app.get(
    "/api/admin/test",
    verifyToken,
    verifyAdmin,
    (req, res) => {
        res.json({ message: "Welcome Admin!" });
    }
);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
