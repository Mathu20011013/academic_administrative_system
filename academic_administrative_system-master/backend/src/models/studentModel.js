// src/models/studentModel.js
const db = require('../config/db');

module.exports = {
  findById: (student_id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM student WHERE student_id = ?';
      db.query(query, [student_id], (err, results) => {
        if (err) {
          console.error('Error finding student by ID:', err);
          reject(err);
        } else if (results.length === 0) {
          reject(new Error('Student not found'));
        } else {
          resolve(results[0]); // Ensure only one record is returned
        }
      });
    });
  }
};
