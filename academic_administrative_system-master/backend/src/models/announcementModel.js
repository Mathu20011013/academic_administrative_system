// src/models/announcementModel.js
const db = require('../config/db');

const Announcement = {
  // Get announcement by content ID
  getByContentId: (contentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM announcements WHERE content_id = ?';
      db.query(query, [contentId], (err, results) => {
        if (err) {
          console.error('Error fetching announcement:', err);
          reject(err);
        } else if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      });
    });
  },

  // Create new announcement
  create: (announcementData) => {
    return new Promise((resolve, reject) => {
      // Convert boolean to integer (0 or 1)
      const isPinned = announcementData.is_pinned ? 1 : 0;
      const query = 'INSERT INTO announcements (content_id, is_pinned) VALUES (?, ?)';
      db.query(
        query,
        [announcementData.content_id, isPinned],
        (err, result) => {
          if (err) {
            console.error('Error creating announcement:', err);
            reject(err);
          } else {
            resolve(result.insertId);
          }
        }
      );
    });
  },
  
  // Get announcements by course ID
  getByCourseId: (courseId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, c.title, c.description, c.created_at
        FROM announcements a
        JOIN course_content c ON a.content_id = c.content_id
        WHERE c.course_id = ? AND c.content_type = 'announcement'
        ORDER BY a.is_pinned DESC, c.created_at DESC`;
      db.query(query, [courseId], (err, results) => {
        if (err) {
          console.error('Error fetching course announcements:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
  
  // Update pin status
  updatePinStatus: (announcementId, isPinned) => {
    return new Promise((resolve, reject) => {
      // Convert boolean to integer for update as well
      const isPinnedValue = isPinned ? 1 : 0;
      const query = 'UPDATE announcements SET is_pinned = ? WHERE announcement_id = ?';
      db.query(query, [isPinnedValue, announcementId], (err, result) => {
        if (err) {
          console.error('Error updating pin status:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

module.exports = Announcement;
