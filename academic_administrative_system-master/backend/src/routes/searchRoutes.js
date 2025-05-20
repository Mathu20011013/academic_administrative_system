const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search courses
router.get('/courses', searchController.searchCourses);
// Search courses - no authentication required
router.get('/courses', searchController.searchCourses);

module.exports = router;
