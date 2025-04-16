// controllers/commentController.js
const Comment = require('../models/comment');

// Get all comments for a specific discussion
const getCommentsByForumId = (req, res) => {
  const { forum_id } = req.params;
  Comment.getCommentsByForumId(forum_id, (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
};

// Create a new comment on a discussion
const createComment = (req, res) => {
  const { forum_id, user_id, comment } = req.body;
  Comment.createComment(forum_id, user_id, comment, (err, result) => {
    if (err) {
      console.error('Error creating comment:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'Comment added successfully', comment_id: result.insertId });
  });
};

module.exports = {
  getCommentsByForumId,
  createComment
};
