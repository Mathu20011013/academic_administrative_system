// models/comment.js
const db = require('../config/db');

// Get all comments for a specific forum (discussion)
const getCommentsByForumId = (forum_id, callback) => {
  db.query(
    'SELECT c.comment_id, c.comment, c.created_at, u.email AS user_email FROM comment c JOIN user u ON c.user_id = u.user_id WHERE c.forum_id = ? ORDER BY c.created_at',
    [forum_id],
    callback
  );
};

// Add a new comment to a forum
const createComment = (forum_id, user_id, comment, callback) => {
  db.query(
    'INSERT INTO comment (forum_id, user_id, comment) VALUES (?, ?, ?)',
    [forum_id, user_id, comment],
    callback
  );
};

module.exports = {
  getCommentsByForumId,
  createComment
};
