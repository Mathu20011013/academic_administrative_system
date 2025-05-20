// controllers/discussionController.js
const Discussion = require('../models/discussion');

// Get all discussions - with better error handling
const getAllDiscussions = (req, res) => {
  console.log("Getting all discussions");
  
  Discussion.getAllDiscussions((err, discussions) => {
    if (err) {
      console.error('Error fetching discussions:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message,
        sqlMessage: err.sqlMessage
      });
    }
    
    console.log(`Returning ${discussions?.length || 0} discussions`);
    res.json(discussions || []);
  });
};

// Get a single discussion by ID
const getDiscussionById = (req, res) => {
  const { id } = req.params;
  Discussion.getDiscussionById(id, (err, result) => {
    if (err) {
      console.error('Error fetching discussion:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    res.status(200).json(result[0]);
  });
};

// Create a new discussion
const createDiscussion = (req, res) => {
  const { course_id, user_id, title, question } = req.body;
  Discussion.createDiscussion(course_id, user_id, title, question, (err, result) => {
    if (err) {
      console.error('Error creating discussion:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'Discussion created successfully', forum_id: result.insertId });
  });
};

module.exports = {
  getAllDiscussions,
  getDiscussionById,
  createDiscussion
};
