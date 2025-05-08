// src/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// Create announcement
router.post('/create', announcementController.createAnnouncement);

// Get course announcements
router.get('/course/:courseId', announcementController.getCourseAnnouncements);

// Toggle pin status
router.put('/:announcementId/pin', announcementController.togglePin);

module.exports = router;
