const db = require("../config/db");

// Validate domain name and description
const validateDomain = (name, description) => {
  const errors = [];
  
  if (!name || name.trim().length === 0) {
    errors.push("Domain name is required");
  }
  
  if (name && name.trim().length < 2) {
    errors.push("Domain name must be at least 2 characters");
  }
  
  if (name && name.trim().length > 100) {
    errors.push("Domain name cannot exceed 100 characters");
  }
  
  if (description && description.trim().length > 500) {
    errors.push("Description cannot exceed 500 characters");
  }
  
  return errors;
};

// Create Domain (Admin Only)
exports.createDomain = (req, res) => {
  const { name, description } = req.body;

  // Validate input
  const errors = validateDomain(name, description);
  if (errors.length > 0) {
    return res.status(400).json({ 
      status: "error",
      message: "Validation failed",
      errors 
    });
  }

  const query = "INSERT INTO domains (name, description) VALUES (?, ?)";

  db.query(query, [name.trim(), description?.trim() || null], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ 
          status: "error",
          message: "Domain with this name already exists" 
        });
      }
      return res.status(500).json({ 
        status: "error",
        message: "Failed to create domain" 
      });
    }

    res.status(201).json({
      status: "success",
      message: "Domain created successfully",
      data: {
        id: result.insertId,
        name: name.trim(),
        description: description?.trim() || null
      }
    });
  });
};

// Get All Domains (Public - for student selection)
exports.getAllDomains = (req, res) => {
  const query = `
    SELECT 
      d.id,
      d.name,
      d.description,
      COUNT(q.id) AS question_count
    FROM domains d
    LEFT JOIN questions q ON d.id = q.domain_id
    GROUP BY d.id
    ORDER BY d.name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Failed to fetch domains" 
      });
    }

    res.status(200).json({
      status: "success",
      message: "Domains fetched successfully",
      data: results
    });
  });
};

// Get Single Domain
exports.getDomainById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      d.id,
      d.name,
      d.description,
      COUNT(q.id) AS question_count
    FROM domains d
    LEFT JOIN questions q ON d.id = q.domain_id
    WHERE d.id = ?
    GROUP BY d.id
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Failed to fetch domain" 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        status: "error",
        message: "Domain not found" 
      });
    }

    res.status(200).json({
      status: "success",
      message: "Domain fetched successfully",
      data: results[0]
    });
  });
};

// Update Domain (Admin Only)
exports.updateDomain = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // Validate input
  const errors = validateDomain(name, description);
  if (errors.length > 0) {
    return res.status(400).json({ 
      status: "error",
      message: "Validation failed",
      errors 
    });
  }

  // Check if domain exists
  const checkQuery = "SELECT id FROM domains WHERE id = ?";
  
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
        message: "Domain not found" 
      });
    }

    const updateQuery = "UPDATE domains SET name = ?, description = ? WHERE id = ?";
    
    db.query(updateQuery, [name.trim(), description?.trim() || null, id], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ 
            status: "error",
            message: "Domain with this name already exists" 
          });
        }
        return res.status(500).json({ 
          status: "error",
          message: "Failed to update domain" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Domain updated successfully",
        data: {
          id,
          name: name.trim(),
          description: description?.trim() || null
        }
      });
    });
  });
};

// Delete Domain (Admin Only)
exports.deleteDomain = (req, res) => {
  const { id } = req.params;

  // Check if domain exists and has questions
  const checkQuery = "SELECT COUNT(*) AS question_count FROM questions WHERE domain_id = ?";
  
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: "error",
        message: "Database error" 
      });
    }

    if (results[0].question_count > 0) {
      return res.status(400).json({ 
        status: "error",
        message: "Cannot delete domain with existing questions. Delete all questions first." 
      });
    }

    const deleteQuery = "DELETE FROM domains WHERE id = ?";
    
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          status: "error",
          message: "Failed to delete domain" 
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          status: "error",
          message: "Domain not found" 
        });
      }

      res.status(200).json({
        status: "success",
        message: "Domain deleted successfully"
      });
    });
  });
};
