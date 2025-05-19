// src/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const upload = require('../middleware/upload'); // For file uploads

router.post('/create', upload.single('file'), submissionController.submitAssignment);
router.get('/assignment/:assignmentId/submissions', submissionController.getSubmissionsByAssignment);
router.put('/:submissionId/grade', submissionController.gradeSubmission);
// Add these routes to your existing routes
router.get('/file/:submissionId', submissionController.viewSubmissionFile);
router.get('/download/:submissionId', submissionController.downloadSubmissionFile);

module.exports = router;
