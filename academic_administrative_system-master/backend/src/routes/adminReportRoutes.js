const express = require('express');
const router = express.Router();
const reportController = require('../controllers/adminReportController');

// Revenue report
router.get('/revenue', reportController.getRevenueReport);

// Instructor performance report
router.get('/instructor-performance', reportController.getInstructorPerformance);

// Enrollment trends report
router.get('/enrollment-trends', reportController.getEnrollmentTrends);

// User base overview
router.get('/user-base', reportController.getUserBaseOverview);

module.exports = router;