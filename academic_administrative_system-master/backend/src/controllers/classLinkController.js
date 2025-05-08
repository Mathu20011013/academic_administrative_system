// src/controllers/classLinkController.js
const ClassLink = require('../models/classLinkModel');

// Create class link
exports.createClassLink = async (req, res) => {
  try {
    const { content_id, meeting_url, meeting_time } = req.body;
    
    // Validate required fields
    if (!content_id || !meeting_url) {
      return res.status(400).json({ message: 'Content ID and meeting URL are required' });
    }
    
    // Create class link
    const linkId = await ClassLink.create({
      content_id,
      meeting_url,
      meeting_time: meeting_time || null
    });
    
    res.status(201).json({
      message: 'Class link created successfully',
      linkId
    });
  } catch (error) {
    console.error('Error creating class link:', error);
    res.status(500).json({ message: 'Error creating class link', error: error.message });
  }
};

// Update class link
exports.updateClassLink = async (req, res) => {
  try {
    const linkId = req.params.linkId;
    const { meeting_url, meeting_time } = req.body;
    
    // Update class link
    await ClassLink.update(linkId, {
      meeting_url,
      meeting_time
    });
    
    res.status(200).json({ message: 'Class link updated successfully' });
  } catch (error) {
    console.error('Error updating class link:', error);
    res.status(500).json({ message: 'Error updating class link', error: error.message });
  }
};

// Get class link details
exports.getClassLink = async (req, res) => {
  try {
    const linkId = req.params.linkId;
    
    // Get class link details
    const query = `
      SELECT cl.*, c.title, c.description
      FROM class_links cl
      JOIN course_content c ON cl.content_id = c.content_id
      WHERE cl.link_id = ?`;
    
    db.query(query, [linkId], (err, results) => {
      if (err) {
        console.error('Error fetching class link:', err);
        return res.status(500).json({ message: 'Error fetching class link', error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Class link not found' });
      }
      
      res.status(200).json({ classLink: results[0] });
    });
  } catch (error) {
    console.error('Error in getClassLink:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
