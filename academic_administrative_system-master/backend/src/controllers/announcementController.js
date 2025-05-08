// src/controllers/announcementController.js
const Announcement = require('../models/announcementModel');
const CourseContent = require('../models/courseContentModel');

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { content_id, is_pinned } = req.body;

    // Validate required fields
    if (!content_id) {
      return res.status(400).json({ message: 'Content ID is required' });
    }

    // Create announcement
    const announcementId = await Announcement.create({
      content_id,
      is_pinned: is_pinned || false
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcementId
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
};

// Get course announcements
exports.getCourseAnnouncements = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // Get all announcements for this course
    const announcements = await Announcement.getByCourseId(courseId);
    res.status(200).json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};

// Toggle pin status
exports.togglePin = async (req, res) => {
  try {
    const announcementId = req.params.announcementId;
    const { is_pinned } = req.body;
    // Update pin status
    await Announcement.updatePinStatus(announcementId, is_pinned);
    res.status(200).json({ message: 'Announcement pin status updated successfully' });
  } catch (error) {
    console.error('Error updating announcement pin status:', error);
    res.status(500).json({ message: 'Error updating announcement pin status', error: error.message });
  }
};
