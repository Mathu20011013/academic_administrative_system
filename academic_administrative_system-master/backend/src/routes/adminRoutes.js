const express = require('express');
const { getAllStudents } = require('../controllers/adminController'); // Ensure the filename matches exactly

const router = express.Router();

// Get all students route
router.get('/students', getAllStudents);

module.exports = router;