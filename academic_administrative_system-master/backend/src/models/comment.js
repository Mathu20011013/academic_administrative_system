// models/comment.js
const db = require('../config/db');

// Get all comments for a specific discussion with username
const getCommentsByForumId = (forum_id, callback) => {
  const query = `
    SELECT 
      c.comment_id,
      c.forum_id,
      c.user_id,
      c.comment,
      c.created_at,
      u.username,
      u.email,
      CASE 
        WHEN s.student_id IS NOT NULL THEN 'student'
        WHEN i.instructor_id IS NOT NULL THEN 'instructor'
        ELSE 'admin'
      END as user_type
    FROM comment c
    JOIN user u ON c.user_id = u.user_id
    LEFT JOIN student s ON u.user_id = s.user_id
    LEFT JOIN instructor i ON u.user_id = i.user_id
    WHERE c.forum_id = ?
    ORDER BY c.created_at ASC
  `;
  
  db.query(query, [forum_id], callback);
};

// Create a new comment with user information
const createComment = (forum_id, user_id, comment, callback) => {
  const query = 'INSERT INTO comment (forum_id, user_id, comment) VALUES (?, ?, ?)';
  db.query(query, [forum_id, user_id, comment], callback);
};

module.exports = {
  getCommentsByForumId,
  createComment
};
