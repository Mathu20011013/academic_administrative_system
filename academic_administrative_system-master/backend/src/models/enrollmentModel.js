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
  create: (user_id, course_id) => {
    return new Promise((resolve, reject) => {
      // First find the student_id that corresponds to this user_id
      const findStudentQuery = 'SELECT student_id FROM student WHERE user_id = ?';
      db.query(findStudentQuery, [user_id], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (results.length === 0) {
          reject(new Error('No student record found for this user'));
          return;
        }
        
        const studentId = results[0].student_id;
        
        // Now insert with the correct student_id
        const query = 'INSERT INTO enrollment (student_id, course_id) VALUES (?, ?)';
        db.query(query, [studentId, course_id], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });
  },

  // Get all courses a student is enrolled in with instructor name
  getEnrolledCourses: (student_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, u.username AS instructor_name
        FROM course c
        JOIN enrollment e ON c.course_id = e.course_id
        LEFT JOIN user u ON c.instructor_id = u.user_id
        WHERE e.student_id = ?`; // Changed JOIN to LEFT JOIN for instructor
      
      db.query(query, [student_id], (err, results) => {
        if (err) {
          reject(err);
        } else if (!results || results.length === 0) {
          resolve([]); // Return empty array if no results found
        } else {
          resolve(results); // Return the courses
        }
      });
    });
  }
};
