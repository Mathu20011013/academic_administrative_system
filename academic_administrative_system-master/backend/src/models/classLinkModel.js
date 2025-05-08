// src/models/classLinkModel.js
const db = require('../config/db');

const ClassLink = {
  // Get class link by content ID
  getByContentId: (contentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM class_links WHERE content_id = ?';
      db.query(query, [contentId], (err, results) => {
        if (err) {
          console.error('Error fetching class link:', err);
          reject(err);
        } else if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      });
    });
  
  },
  
  // Create new class link
  create: (linkData) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO class_links (content_id, meeting_url, meeting_time) VALUES (?, ?, ?)';
      db.query(
        query, 
        [linkData.content_id, linkData.meeting_url, linkData.meeting_time],
        (err, result) => {
          if (err) {
            console.error('Error creating class link:', err);
            reject(err);
          } else {
            resolve(result.insertId);
          }
        }
      );
    });
  },
  
  // Update class link
  update: (linkId, linkData) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE class_links SET meeting_url = ?, meeting_time = ? WHERE link_id = ?';
      db.query(
        query,
        [linkData.meeting_url, linkData.meeting_time, linkId],
        (err, result) => {
          if (err) {
            console.error('Error updating class link:', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
};

module.exports = ClassLink;
