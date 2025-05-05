// src/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // File upload middleware
const { submitAssignment } = require('../controllers/submissionController'); // Controller function for submitting assignments

// Endpoint to submit assignment (student)
router.post('/submit-assignment', upload.single('file'), submitAssignment);  // Use upload middleware and controller

module.exports = router;
