// models/discussion.js
const db = require('../config/db');

// Get all discussions from the `discussion_forum` table
const getAllDiscussions = (callback) => {
  db.query('SELECT * FROM discussion_forum ORDER BY created_at DESC', callback);
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
