const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    const errors = [];
    
    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    }
    
    if (!email || !isValidEmail(email)) {
      errors.push("Valid email is required");
    }
    
    if (!password || !isValidPassword(password)) {
      errors.push("Password must be at least 6 characters");
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        status: "error",
        message: "Validation failed",
        errors 
      });
    }

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkUserQuery, [email.toLowerCase()], async (err, results) => {
      if (err) {
        return res.status(500).json({ 
          status: "error",
          message: "Database error" 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          status: "error",
          message: "User with this email already exists" 
        });
      }

      // 🔐 Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, 'student')
      `;

      db.query(insertQuery, [name.trim(), email.toLowerCase(), hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ 
            status: "error",
            message: "Registration failed" 
          });
        }

        // 🔥 CREATE TOKEN
        const token = jwt.sign(
          { id: result.insertId, role: "student" },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        // 🔥 SEND TOKEN + USER
        res.status(201).json({
          status: "success",
          message: "Student registered successfully",
          token,
          user: {
            id: result.insertId,
            name,
            email,
            role: "student"
          }
        });
      });
    });

  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
};


// Student Login
exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
          return res.status(400).json({ 
            status: "error",
            message: "Email and password are required" 
          });
        }

        // 1️⃣ Check if user exists
        const query = "SELECT * FROM users WHERE email = ? AND role = 'student'";

        db.query(query, [email.toLowerCase()], async (err, results) => {
            if (err) {
                return res.status(500).json({ 
                  status: "error",
                  message: "Database error" 
                });
            }

            if (results.length === 0) {
                return res.status(400).json({ 
                  status: "error",
                  message: "Invalid email or password" 
                });
            }

            const user = results[0];

            // 2️⃣ Compare password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ 
                  status: "error",
                  message: "Invalid email or password" 
                });
            }

            // 3️⃣ Generate JWT Token
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // 4️⃣ Send response
            res.status(200).json({
              status: "success",
              message: "Login successful",
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            });

        });

    } catch (error) {
        res.status(500).json({ 
          status: "error",
          message: "Server error" 
        });
    }
};


exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
          return res.status(400).json({ 
            status: "error",
            message: "Email and password are required" 
          });
        }

        const query = "SELECT * FROM users WHERE email = ? AND role = 'admin'";

        db.query(query, [email.toLowerCase()], async (err, results) => {
            if (err) {
                console.error("loginAdmin db error", err);
                return res.status(500).json({ 
                  status: "error",
                  message: "Database error" 
                });
            }

            console.log("loginAdmin query results", results);
            if (results.length === 0) {
                return res.status(400).json({ 
                  status: "error",
                  message: "Invalid email or password" 
                });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ 
                  status: "error",
                  message: "Invalid email or password" 
                });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.status(200).json({
              status: "success",
              message: "Admin login successful",
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            });
        });

    } catch (error) {
        res.status(500).json({ 
          status: "error",
          message: "Server error" 
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    const errors = [];
    
    if (!currentPassword) {
      errors.push("Current password is required");
    }
    
    if (!newPassword || newPassword.length < 6) {
      errors.push("New password must be at least 6 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        status: "error",
        message: "Validation failed",
        errors 
      });
    }

    // Get user from database
    const getUserQuery = "SELECT * FROM users WHERE id = ?";

    db.query(getUserQuery, [userId], async (err, results) => {
      if (err) {
        return res.status(500).json({ 
          status: "error",
          message: "Database error" 
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          status: "error",
          message: "User not found" 
        });
      }

      const user = results[0];

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ 
          status: "error",
          message: "Current password is incorrect" 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      const updateQuery = "UPDATE users SET password = ? WHERE id = ?";

      db.query(updateQuery, [hashedPassword, userId], (err) => {
        if (err) {
          return res.status(500).json({ 
            status: "error",
            message: "Failed to update password" 
          });
        }

        res.status(200).json({
          status: "success",
          message: "Password changed successfully"
        });
      });
    });

  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "Server error" 
    });
  }
};
