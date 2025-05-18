// src/models/enrollmentModel.js
const db = require("../config/db");

module.exports = {
  // Check if a student is already enrolled in a course
  checkEnrollment: (student_id, course_id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM enrollment WHERE student_id = ? AND course_id = ?';
      db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  },

  // Create a new enrollment
  create: (student_id, course_id) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO enrollment (student_id, course_id) VALUES (?, ?)';
      db.query(query, [student_id, course_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Get all courses a student is enrolled in
  getEnrolledCourses: (student_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.course_id, c.course_name, c.price, c.image_url, 
               COALESCE(u.username, u.first_name, 'Not assigned') AS instructor_name, 
               c.syllabus AS description,
               c.is_active
        FROM enrollment e
        JOIN course c ON e.course_id = c.course_id
        LEFT JOIN instructor i ON c.instructor_id = i.instructor_id
        LEFT JOIN user u ON i.user_id = u.user_id
        WHERE e.student_id = ? AND c.is_active = TRUE`;
      
      db.query(query, [student_id], (err, results) => {
        if (err) {
          console.error("Error fetching enrolled courses:", err);
          reject(err);
        } else {
          console.log("Enrolled courses fetched:", results);
          resolve(results);
        }
      });
    });
  }
};
