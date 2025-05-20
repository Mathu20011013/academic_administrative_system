const db = require('../config/db');

module.exports = {
  // Get notifications for a specific user
  getUserNotifications: (userId, limit = 10) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?`;
      
      db.query(query, [userId, limit], (err, results) => {
        if (err) {
          console.error("Error fetching notifications:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
  
  // Mark notification as read
  markAsRead: (notificationId) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE notifications SET is_read = 1 WHERE notification_id = ?';
      
      db.query(query, [notificationId], (err, result) => {
        if (err) {
          console.error("Error marking notification as read:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  
  // Create a new notification
  create: (userId, message, type, relatedId = null) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications
        (user_id, message, type, related_id, is_read, created_at)
        VALUES (?, ?, ?, ?, 0, NOW())`;
      
      db.query(query, [userId, message, type, relatedId], (err, result) => {
        if (err) {
          console.error("Error creating notification:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  
  // Get unread notification count
  getUnreadCount: (userId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';
      
      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error("Error counting notifications:", err);
          reject(err);
        } else {
          resolve(results[0].count);
        }
      });
    });
  }
};
