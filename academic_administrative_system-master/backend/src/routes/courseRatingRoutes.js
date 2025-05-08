// src/routes/courseRatingRoutes.js
const express = require('express');
const router = express.Router();
const courseRatingController = require('../controllers/courseRatingController');

// Submit a course rating
router.post('/submit', courseRatingController.submitRating);

// Get course ratings
router.get('/course/:courseId', courseRatingController.getCourseRatings);

module.exports = router;
