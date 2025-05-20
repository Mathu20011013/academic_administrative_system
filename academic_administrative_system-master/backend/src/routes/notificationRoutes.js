const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
// Change this line in notificationRoutes.js
const { authenticate } = require('../middleware/authmiddleware');



// Get user notifications
router.get('/', authenticate, notificationController.getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', authenticate, notificationController.markAsRead);

// Get unread notification count
router.get('/unread/count', authenticate, notificationController.getUnreadCount);

module.exports = router;
