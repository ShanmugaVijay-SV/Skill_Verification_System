const express = require("express");
const router = express.Router();

const { createDomain, getAllDomains, getDomainById, updateDomain, deleteDomain } = require("../controllers/domainController");
const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// Admin only - Create domain
router.post("/", verifyToken, verifyAdmin, createDomain);

// Public - Get all domains
router.get("/", getAllDomains);

// Public - Get single domain
router.get("/:id", getDomainById);

// Admin only - Update domain
router.put("/:id", verifyToken, verifyAdmin, updateDomain);

// Admin only - Delete domain
router.delete("/:id", verifyToken, verifyAdmin, deleteDomain);

module.exports = router;
