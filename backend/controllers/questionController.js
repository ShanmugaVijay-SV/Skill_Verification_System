const db = require("../config/db");

// Validate question data
const validateQuestion = (data) => {
  const errors = [];
  
  if (!data.domain_id) {
    errors.push("Domain ID is required");
  }
  
  if (!data.question_text || data.question_text.trim().length === 0) {
    errors.push("Question text is required");
  }
  
  if (!data.option_a || !data.option_b || !data.option_c || !data.option_d) {
    errors.push("All four options are required");
  }
  
  if (!data.correct_answer || !["a", "b", "c", "d"].includes(data.correct_answer.toLowerCase())) {
    errors.push("Correct answer must be a, b, c, or d");
  }
  
  return errors;
};

// Add Question (Admin only)
exports.addQuestion = (req, res) => {
  const {
    domain_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer
  } = req.body;

  // Validate input
  const errors = validateQuestion(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ 
      status: "error",
      message: "Validation failed",
      errors 
    });
  }

  // Check if domain exists
  const checkDomainQuery = "SELECT id FROM domains WHERE id = ?";
  
  db.query(checkDomainQuery, [domain_id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Database error" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        status: "error",
        message: "Domain not found" 
      });
    }

    const query = `
      INSERT INTO questions 
      (domain_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [domain_id, question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_answer.toLowerCase()],
      (err, result) => {
        if (err) {
          return res.status(500).json({ 
            status: "error",
            message: "Failed to add question" 
          });
        }

        res.status(201).json({ 
          status: "success",
          message: "Question added successfully",
          data: {
            id: result.insertId
          }
        });
      }
    );
  });
};

// Get Questions By Domain (For Student - taking assessment)
exports.getQuestionsByDomain = (req, res) => {
  const studentId = req.user.id; // from JWT
  const { domainId } = req.params;

  // 1️⃣ Check last attempt
  const checkAttemptQuery = `
    SELECT * FROM attempts
    WHERE student_id = ? AND domain_id = ?
    ORDER BY attempt_date DESC
    LIMIT 1
  `;

  db.query(checkAttemptQuery, [studentId, domainId], (err, results) => {
    if (err) return res.status(500).json({ 
      status: "error",
      message: "Database error" 
    });

    if (results.length > 0) {
      const lastAttempt = new Date(results[0].attempt_date);
      const now = new Date();
      const diffHours = (now - lastAttempt) / (1000 * 60 * 60);

      if (diffHours < 72) {
        const nextAvailableDate = new Date(lastAttempt.getTime() + 72 * 60 * 60 * 1000);
        return res.status(400).json({
          status: "error",
          message: "Cooldown period active",
          nextAttemptDate: nextAvailableDate,
          hoursRemaining: (72 - diffHours).toFixed(2)
        });
      }
    }

    // 2️⃣ Fetch random 20-30 questions
    const questionQuery = `
      SELECT id, question_text, option_a, option_b, option_c, option_d
      FROM questions
      WHERE domain_id = ?
      ORDER BY RAND()
      LIMIT 30
    `;

    db.query(questionQuery, [domainId], (err, questions) => {
      if (err) return res.status(500).json({ 
        status: "error",
        message: "Failed to fetch questions" 
      });

      if (questions.length === 0) {
        return res.status(404).json({ 
          status: "error",
          message: "No questions available for this domain" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Questions fetched successfully",
        data: questions
      });
    });
  });
};

// Get All Questions by Domain (Admin - for editing)
exports.getQuestionsByDomainAdmin = (req, res) => {
  const { domainId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const offset = (page - 1) * limit;

  // Get total count
  const countQuery = "SELECT COUNT(*) AS total FROM questions WHERE domain_id = ?";
  
  db.query(countQuery, [domainId], (err, countResults) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Database error" 
      });
    }

    const total = countResults[0].total;

    // Get paginated questions
    const query = `
      SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer
      FROM questions
      WHERE domain_id = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [domainId, parseInt(limit), offset], (err, questions) => {
      if (err) {
        return res.status(500).json({ 
          status: "error",
          message: "Failed to fetch questions" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Questions fetched successfully",
        data: questions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
};

// Get Single Question (Admin - for editing)
exports.getQuestionById = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM questions WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Database error" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        status: "error",
        message: "Question not found" 
      });
    }

    res.status(200).json({
      status: "success",
      message: "Question fetched successfully",
      data: results[0]
    });
  });
};

// Update Question (Admin only)
exports.updateQuestion = (req, res) => {
  const { id } = req.params;
  const {
    domain_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer
  } = req.body;

  // Validate input
  const errors = validateQuestion(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ 
      status: "error",
      message: "Validation failed",
      errors 
    });
  }

  // Check if question exists
  const checkQuery = "SELECT id FROM questions WHERE id = ?";
  
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Database error" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        status: "error",
        message: "Question not found" 
      });
    }

    const updateQuery = `
      UPDATE questions 
      SET domain_id = ?, question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [domain_id, question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_answer.toLowerCase(), id],
      (err) => {
        if (err) {
          return res.status(500).json({ 
            status: "error",
            message: "Failed to update question" 
          });
        }

        res.status(200).json({
          status: "success",
          message: "Question updated successfully",
          data: { id }
        });
      }
    );
  });
};

// Delete Question (Admin only)
exports.deleteQuestion = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM questions WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Failed to delete question" 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        status: "error",
        message: "Question not found" 
      });
    }

    res.status(200).json({
      status: "success",
      message: "Question deleted successfully"
    });
  });
};
