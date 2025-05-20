// controllers/commentController.js
const Comment = require('../models/comment');
const db = require('../config/db'); // Make sure to include the database connection

// Get all comments for a specific discussion
const getCommentsByForumId = (req, res) => {
  const forum_id = req.params.forum_id;
  
  // Use direct database query to ensure we get user roles
  const sql = `
    SELECT c.*, u.username, u.email, u.role 
    FROM comment c
    LEFT JOIN user u ON c.user_id = u.user_id
    WHERE c.forum_id = ?
    ORDER BY c.created_at ASC
  `;

  db.query(sql, [forum_id], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    // Debug log to see what's coming back
    console.log(`Comments for forum ${forum_id}:`, results.map(c => ({
      comment_id: c.comment_id,
      username: c.username,
      role: c.role
    })));
    
    res.status(200).json(results || []);
  });
};

// Create a new comment on a discussion
const createComment = (req, res) => {
  const { forum_id, user_id, comment } = req.body;
  
  // Debug log
  console.log("Received comment data:", { forum_id, user_id, comment });
  
  if (!user_id) {
    console.log("Missing user_id in request");
    return res.status(401).json({ error: 'User ID is required to comment' });
  }
  
  if (!forum_id) {
    console.log("Missing forum_id in request");
    return res.status(400).json({ error: 'Forum ID is required' });
  }
  
  if (!comment || comment.trim() === '') {
    console.log("Empty comment submitted");
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }
  
  Comment.createComment(forum_id, user_id, comment, (err, result) => {
    if (err) {
      console.error('Error creating comment:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    res.status(201).json({ 
      message: 'Comment added successfully', 
      comment_id: result.insertId 
    });
  });
};

module.exports = {
  getCommentsByForumId,
  createComment
};
