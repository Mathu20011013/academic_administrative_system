// src/models/submissionModel.js

const db = require('../config/db'); // MySQL database connection

const Submission = {
  // Create a new assignment submission
  create: (submissionData) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO submissions (assignment_id, student_id, submission_file, submission_date) VALUES (?, ?, ?, NOW())';
      db.query(
        query,
        [submissionData.assignment_id, submissionData.student_id, submissionData.submission_file],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  // Get all submissions for a specific assignment
  getAllByAssignmentId: (assignmentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM submissions WHERE assignment_id = ? ORDER BY submission_date DESC';
      db.query(query, [assignmentId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Get submissions for a specific student
  getByStudentId: (studentId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM submissions WHERE student_id = ?';
      db.query(query, [studentId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  // Update submission grade
  updateGrade: (submissionId, grade, feedback) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE submissions SET grade = ?, feedback = ?, graded_at = NOW() WHERE submission_id = ?';
      db.query(query, [grade, feedback || '', submissionId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.affectedRows > 0);
        }
      });
    });
  }
};

module.exports = Submission;
