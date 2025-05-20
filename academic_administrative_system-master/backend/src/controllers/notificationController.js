const Notification = require('../models/notificationModel');

// Get notifications for the logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.getUserNotifications(userId);
    res.status(200).json({ notifications });
  } catch (error) {const Notification = require('../models/notificationModel');

// Get notifications for the logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.getUserNotifications(userId);
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.markAsRead(notificationId);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ message: "Failed to update notification", error });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting notifications:", error);
    res.status(500).json({ message: "Failed to count notifications", error });
  }
};

    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    await Notification.markAsRead(notificationId);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ message: "Failed to update notification", error });
  }
};
// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting notifications:", error);
    res.status(500).json({ message: "Failed to count notifications", error });
  }
};
// Add to notificationController.js
exports.createTestNotification = async (req, res) => {
  try {
    const { user_id, message, type, related_id } = req.body;
    
    if (!user_id || !message || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const result = await Notification.create(user_id, message, type, related_id);
    res.status(201).json({ message: "Test notification created", result });
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({ message: "Failed to create notification", error });
  }
};
