// src/models/courseContentModel.js
const db = require('../config/db');

const CourseContent = {
  // Create new course content (announcement, material, assignment, class link)
  create: (contentData) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO course_content (course_id, content_type, title, description) VALUES (?, ?, ?, ?)';
      db.query(
        query, 
        [contentData.course_id, contentData.content_type, contentData.title, contentData.description],
        (err, result) => {
          if (err) {
            console.error('Error creating course content:', err);
            reject(err);
          } else {
            resolve(result.insertId);
          }
        }
      );
    });
  },

  // Get all content for a specific course
  getByCourseId: (courseId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM course_content 
        WHERE course_id = ? 
        ORDER BY created_at DESC`;
      db.query(query, [courseId], (err, results) => {
        if (err) {
          console.error('Error fetching course content:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Get content by ID
  getById: (contentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM course_content WHERE content_id = ?';
      db.query(query, [contentId], (err, results) => {
        if (err) {
          console.error('Error fetching content by ID:', err);
          reject(err);
        } else if (results.length === 0) {
          reject(new Error('Content not found'));
        } else {
          resolve(results[0]);
        }
      });
    });
  },

  // Update content
  update: (contentId, contentData) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE course_content SET title = ?, description = ? WHERE content_id = ?';
      db.query(
        query,
        [contentData.title, contentData.description, contentId],
        (err, result) => {
          if (err) {
            console.error('Error updating course content:', err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  // Delete content
  delete: (contentId) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM course_content WHERE content_id = ?';
      db.query(query, [contentId], (err, result) => {
        if (err) {
          console.error('Error deleting course content:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

module.exports = CourseContent;
