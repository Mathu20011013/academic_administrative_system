// src/models/submissionModel.js
const db = require('../config/db'); // MySQL database connection

const Submission = {
  // Create a new assignment submission
  create: (submissionData, callback) => {
    const query = 'INSERT INTO submissions (assignment_id, student_id, submission_file) VALUES (?, ?, ?)';
    db.query(query, [submissionData.assignment_id, submissionData.student_id, submissionData.submission_file], callback);
  },

  // Get all submissions for a specific assignment
  getAllByAssignmentId: (assignmentId, callback) => {
    const query = 'SELECT * FROM submissions WHERE assignment_id = ?';
    db.query(query, [assignmentId], callback);
  },

  // Get submissions for a specific student
  getByStudentId: (studentId, callback) => {
    const query = 'SELECT * FROM submissions WHERE student_id = ?';
    db.query(query, [studentId], callback);
  }
};

module.exports = Submission;
