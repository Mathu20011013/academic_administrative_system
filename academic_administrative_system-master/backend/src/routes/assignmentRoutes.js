// src/routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// Get assignment details
router.get('/:assignmentId', assignmentController.getAssignment);

// Create assignment
router.post('/create', assignmentController.createAssignment);

// Update assignment
router.put('/:assignmentId', assignmentController.updateAssignment);

// Get all submissions for an assignment
router.get('/:assignmentId/submissions', assignmentController.getSubmissions);

// Grade a submission
router.put('/submission/:submissionId/grade', assignmentController.gradeSubmission);

module.exports = router;
