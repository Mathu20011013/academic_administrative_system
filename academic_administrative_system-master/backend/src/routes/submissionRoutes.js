// src/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const upload = require('../middleware/upload'); // For file uploads

router.post('/create', upload.single('file'), submissionController.submitAssignment);
router.put('/:submissionId/grade', submissionController.gradeSubmission);

module.exports = router;
