// src/models/materialModel.js
const db = require('../config/db');

const Material = {
  // Add material file
  addFile: (contentId, courseId, fileName, fileUrl) => {
    return new Promise((resolve, reject) => {
      // Extract file extension to determine material type
      const fileExt = fileName.split('.').pop().toLowerCase();
      const materialType = fileExt === 'pdf' ? 'pdf' : 
                         (fileExt === 'mp4' || fileExt === 'avi' || fileExt === 'mov') ? 'video' : 'link';
  
      const query = 'INSERT INTO course_materials (content_id, course_id, material_title, material_url, material_type) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [contentId, courseId, fileName, fileUrl, materialType], (err, result) => {
        if (err) {
          console.error('Error adding material file:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get files for a content
  getFilesByContentId: (contentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM course_materials WHERE content_id = ?';
      db.query(query, [contentId], (err, results) => {
        if (err) {
          console.error('Error fetching material files:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Delete file
  deleteFile: (fileId) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM course_materials WHERE material_id = ?';
      db.query(query, [fileId], (err, result) => {
        if (err) {
          console.error('Error deleting material file:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};

module.exports = Material;
