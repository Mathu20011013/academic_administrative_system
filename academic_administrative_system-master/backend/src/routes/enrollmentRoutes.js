// src/routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

// Check if a student is enrolled in a course
router.get('/check/:studentId/:courseId', enrollmentController.checkEnrollment);

// Enroll a student in a course
router.post('/enroll', enrollmentController.enrollStudent);

// Get all enrolled courses for a student
router.get('/student/:student_id', enrollmentController.getEnrolledCourses);

//new route to match your frontend request
router.get('/my-courses/:student_id', enrollmentController.getEnrolledCourses);

module.exports = router;
