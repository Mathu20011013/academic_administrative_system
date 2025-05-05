// src/routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const { enrollStudent, getEnrolledCourses } = require('../controllers/enrollmentController');

// POST: Enroll a student in a course
router.post('/enroll', enrollStudent);

// GET: Get all enrolled courses for a student
router.get('/my-courses/:student_id', getEnrolledCourses);

module.exports = router;
