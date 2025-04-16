// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const commentController = require('../controllers/commentController');

// Discussion Routes
router.get('/discussions', discussionController.getAllDiscussions);  // Get all discussions
router.get('/discussions/:id', discussionController.getDiscussionById);  // Get a specific discussion
router.post('/discussions', discussionController.createDiscussion);  // Create a new discussion

// Comment Routes
router.get('/comments/forum/:forum_id', commentController.getCommentsByForumId);  // Get all comments for a specific forum
router.post('/comments', commentController.createComment);  // Create a new comment

module.exports = router;
