const express = require('express');
const { getAllStudents, editStudent, deleteStudent } = require('../controllers/adminStudentController');
const {
  getAllInstructors,
  addInstructor,
  editInstructor,
  resetInstructorPassword,
  deleteInstructor
} = require('../controllers/adminInstructorController');
const adminCourseController = require('../controllers/adminCourseController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Student routes
router.get('/students', getAllStudents);
router.put('/students/:user_id', editStudent);
router.delete('/students/:user_id', deleteStudent);

// Instructor routes
router.get('/instructors', getAllInstructors);
router.post('/instructors', addInstructor);
router.put('/instructors/:user_id', editInstructor);
router.put('/instructors/:user_id/reset-password', resetInstructorPassword); // New endpoint for password reset
router.delete('/instructors/:user_id', deleteInstructor);

// Routes for course management
router.get('/courses', adminCourseController.getAllCourses); // Get all courses
router.post('/courses', adminCourseController.addCourse); // Add a new course
router.post('/courses/upload-image', upload.single('image'), adminCourseController.uploadCourseImage); // Upload course image
router.put('/courses/:course_id', adminCourseController.editCourse); // Edit course details
router.put('/courses/:course_id/price', adminCourseController.resetCoursePrice); // Reset course price
router.put('/courses/:course_id/status', adminCourseController.toggleCourseStatus); // Toggle course status

module.exports = router;
