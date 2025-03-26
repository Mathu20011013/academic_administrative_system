const express = require('express');
const { getAllStudents, editStudent, deleteStudent } = require('../controllers/adminStudentController');  // Ensure the import is correct

const router = express.Router();

// Get all students route
router.get('/students', getAllStudents);

// Edit student details
router.put('/students/:user_id', editStudent);  // Make sure the PUT request is mapped correctly

// Delete student
router.delete('/students/:user_id', deleteStudent);

module.exports = router;
