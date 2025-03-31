const express = require('express');
const { getAllStudents, editStudent, deleteStudent } = require('../controllers/adminStudentController');
const { 
  getAllInstructors, 
  addInstructor, 
  editInstructor, 
  resetInstructorPassword,
  deleteInstructor 
} = require('../controllers/adminInstructorController');

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

module.exports = router;