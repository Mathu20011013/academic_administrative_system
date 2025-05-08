// src/models/assignmentModel.js
const db = require('../config/db');

const Assignment = {
  // Get assignment details by content ID
  getByContentId: (contentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM assignments WHERE content_id = ?';
      db.query(query, [contentId], (err, results) => {
        if (err) {
          console.error('Error fetching assignment:', err);
          reject(err);
        } else if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      });
    });
  },
  
  // Create new assignment
  create: (assignmentData) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO assignments (course_id, title, description, due_date) VALUES (?, ?, ?, ?)';
      db.query(
        query,
        [assignmentData.course_id, assignmentData.title, assignmentData.description, assignmentData.due_date],
        (err, result) => {
          if (err) {
            console.error('Error creating assignment:', err);
            reject(err);
          } else {
            resolve(result.insertId);
          }
        }
      );
    });
  },
  
  // Create assignment from content
  createForContent: (contentId, dueDate, maxScore) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO assignments (content_id, due_date, max_score) VALUES (?, ?, ?)';
      db.query(query, [contentId, dueDate, maxScore], (err, result) => {
        if (err) {
          console.error('Error creating assignment:', err);
          reject(err);
        } else {
          resolve(result.insertId);
        }
      });
    });
  },
  
  // Update assignment
  update: (assignmentId, assignmentData) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE assignments SET due_date = ?, max_score = ?, title = ?, description = ? WHERE assignment_id = ?';

      db.query(
        query,
        [assignmentData.due_date, assignmentData.max_score, assignmentData.file_url, assignmentId],
        (err, result) => {
          if (err) {
            console.error('Error updating assignment:', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }
};

module.exports = Assignment;
