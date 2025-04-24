// models/discussion.js
const db = require('../config/db');

// Get all discussions from the `discussion_forum` table
const getAllDiscussions = (callback) => {
  db.query(
    `SELECT df.*, u.email, u.role FROM discussion_forum df
     JOIN user u ON df.user_id = u.user_id
     ORDER BY df.created_at DESC`,
    callback
  );
};

// Get a single discussion by ID
const getDiscussionById = (id, callback) => {
  db.query('SELECT * FROM discussion_forum WHERE forum_id = ?', [id], callback);
};

// Create a new discussion in the `discussion_forum` table
const createDiscussion = (course_id, user_id, title, question, callback) => {
  db.query(
    'INSERT INTO discussion_forum (course_id, user_id, title, question) VALUES (?, ?, ?, ?)',
    [course_id, user_id, title, question],
    callback
  );
};

module.exports = {
  getAllDiscussions,
  getDiscussionById,
  createDiscussion
};
