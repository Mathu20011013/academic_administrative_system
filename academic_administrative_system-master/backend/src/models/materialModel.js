// src/models/materialModel.js
const db = require('../config/db');

class Material {
  // Add material file with cloudinary_id
  static addFile(contentId, courseId, fileName, fileUrl, cloudinaryId = null) {
    return new Promise((resolve, reject) => {
      // Extract file extension to determine material type
      const fileExt = fileName.split('.').pop().toLowerCase();
      const materialType = fileExt === 'pdf' ? 'pdf' : 
                         (fileExt === 'mp4' || fileExt === 'avi' || fileExt === 'mov') ? 'video' : 'link';
  
      // First check if cloudinary_id column exists in the table
      db.query("DESCRIBE academic_system.course_materials", (err, columns) => {
        if (err) {
          console.error('Error checking table structure:', err);
          reject(err);
          return;
        }
        
        // Check if cloudinary_id column exists
        const hasCloudinaryIdColumn = columns.some(col => col.Field === 'cloudinary_id');
        
        // Choose the appropriate query based on column existence
        let query, params;
        
        if (hasCloudinaryIdColumn && cloudinaryId) {
          // If column exists and we have cloudinaryId
          query = 'INSERT INTO course_materials (content_id, course_id, material_title, material_url, material_type, cloudinary_id) VALUES (?, ?, ?, ?, ?, ?)';
          params = [contentId, courseId, fileName, fileUrl, materialType, cloudinaryId];
        } else {
          // If column doesn't exist or no cloudinaryId provided
          query = 'INSERT INTO course_materials (content_id, course_id, material_title, material_url, material_type) VALUES (?, ?, ?, ?, ?)';
          params = [contentId, courseId, fileName, fileUrl, materialType];
        }
        
        db.query(query, params, (err, result) => {
          if (err) {
            console.error('Error adding file:', err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
  }

  // Get files for a content
  static getFilesByContentId(contentId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM course_materials WHERE content_id = ?';
      db.query(query, [contentId], (err, results) => {
        if (err) {
          console.error('Error getting files by content ID:', err);
          reject(err);
        } else {
          console.log(`Found ${results.length} files for content ${contentId}`);
          resolve(results);
        }
      });
    });
  }

  // Delete file
  static deleteFile(fileId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM course_materials WHERE material_id = ?';
      db.query(query, [fileId], (err, result) => {
        if (err) {
          console.error('Error deleting file:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get materials by course ID
  static getByCourseId(courseId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.* 
        FROM course_materials m
        WHERE m.course_id = ?`;
      db.query(query, [courseId], (err, results) => {
        if (err) {
          console.error('Error getting materials by course ID:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = Material;
