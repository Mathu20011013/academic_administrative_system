// src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, getInstructorCourses, toggleCourseStatus } = require('../controllers/courseController');
const { check } = require('express-validator'); // Input validation
const authenticate = require('../middleware/authmiddleware').authenticate; // Import the authenticate middleware

// Route to create a course (admin only)
router.post('/create',
  [
    check('course_name').notEmpty().withMessage('Course name is required'),
    check('price').isNumeric().withMessage('Price must be a number')
  ],
  createCourse
);

// Route to get all courses (for students)
router.get('/', getAllCourses);

// Route to get courses assigned to a specific instructor (based on login credentials)
// This route requires authentication
router.get('/instructor/courses', authenticate, getInstructorCourses); // Fetch courses assigned to the logged-in instructor

// Route to get a specific course by ID
router.get('/:courseId', getCourseById);

// Route to update course details (admin only)
router.put('/:courseId', updateCourse);

// Route to delete a course (admin only)
//router.delete('/:courseId', deleteCourse);
router.put('/:courseId/status', toggleCourseStatus);

module.exports = router;
