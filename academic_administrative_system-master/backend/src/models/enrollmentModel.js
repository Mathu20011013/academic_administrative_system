// src/models/enrollmentModel.js
const db = require('../config/db');

module.exports = {
  // Check if a student is already enrolled in a course
  checkEnrollment: (student_id, course_id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM enrollment WHERE student_id = ? AND course_id = ?';
      db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0); // Return true if already enrolled
        }
      });
    });
  },

  // Enroll a student into a course
  create: (student_id, course_id) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO enrollment (student_id, course_id) VALUES (?, ?)';
      db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results); // Return inserted result
        }
      });
    });
  },

  // Get all courses a student is enrolled in
  getEnrolledCourses: (student_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.* 
        FROM course c
        JOIN enrollment e ON c.course_id = e.course_id
        WHERE e.student_id = ?
      `;
      db.query(query, [student_id], (err, results) => {
        if (err) {
          reject(err);
        } else if (!results || results.length === 0) {
          resolve([]); // Return empty array instead of throwing error
        } else {
          resolve(results); // Return the courses
        }
      });
    });
  }
};
