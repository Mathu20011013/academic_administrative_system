// src/controllers/assignmentController.js

const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const CourseContent = require('../models/courseContentModel');
const db = require('../config/db');

// Get assignment details
exports.getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    // Get assignment details
    const assignment = await Assignment.getById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    // Get content details to include title and description
    const contentDetails = await CourseContent.getById(assignment.content_id);
    
    // Get files associated with this assignment's content
    const Material = require('../models/materialModel');
    const files = await Material.getFilesByContentId(assignment.content_id);
    
    // Combine all information
    const assignmentWithDetails = {
      ...assignment,
      title: contentDetails?.title || "Untitled Assignment",
      description: contentDetails?.description || "",
      files: files || []
    };
    
    res.json(assignmentWithDetails);
  } catch (error) {
    console.error("Error getting assignment details:", error);
    res.status(500).json({ message: "Error retrieving assignment details", error: error.message });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { course_id, title, description, due_date, max_score } = req.body;
    if (!course_id || !title || !due_date) {
      return res.status(400).json({ message: 'Course ID, title, and due date are required' });
    }
    const contentId = await CourseContent.create({
      course_id,
      content_type: 'assignment',
      title,
      description: description || ''
    });
    const query = 'INSERT INTO assignments (course_id, title, description, due_date, content_id, max_score) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(
      query,
      [course_id, title, description || '', due_date, contentId, max_score || 100],
      (err, result) => {
        if (err) {
          console.error('Error creating assignment:', err);
          return res.status(500).json({ message: 'Error creating assignment', error: err.message });
        }
        res.status(201).json({
          message: 'Assignment created successfully',
          assignmentId: result.insertId,
          contentId: contentId
        });
      }
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const { due_date, max_score, title, description } = req.body;
    const getContentIdQuery = 'SELECT content_id FROM assignments WHERE assignment_id = ?';
    db.query(getContentIdQuery, [assignmentId], async (err, results) => {
      if (err || results.length === 0) {
        console.error('Error finding assignment:', err);
        return res.status(404).json({ message: 'Assignment not found' });
      }
      const contentId = results[0].content_id;
      if (title || description) {
        const updateContentQuery = 'UPDATE course_content SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE content_id = ?';
        await db.query(updateContentQuery, [title, description, contentId]);
      }
      const updateAssignmentQuery = 'UPDATE assignments SET due_date = COALESCE(?, due_date), max_score = COALESCE(?, max_score) WHERE assignment_id = ?';
      db.query(updateAssignmentQuery, [due_date, max_score, assignmentId], (err, result) => {
        if (err) {
          console.error('Error updating assignment:', err);
          return res.status(500).json({ message: 'Error updating assignment', error: err.message });
        }
        res.status(200).json({ message: 'Assignment updated successfully' });
      });
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

// Get all submissions for an assignment
exports.getSubmissions = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    // Use the actual column name from your table: submission_date
    const query = `
      SELECT s.*, u.username as student_name
      FROM submissions s
      JOIN student st ON s.student_id = st.student_id
      JOIN user u ON st.user_id = u.user_id
      WHERE s.assignment_id = ?
      ORDER BY s.submission_date DESC`;
    db.query(query, [assignmentId], (err, results) => {
      if (err) {
        console.error('Error fetching submissions:', err);
        return res.status(500).json({ message: 'Error fetching submissions', error: err.message });
      }
      res.status(200).json({ submissions: results });
    });
  } catch (error) {
    console.error('Error in getSubmissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Grade a submission
exports.gradeSubmission = async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const { grade, feedback } = req.body;
    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'Grade is required' });
    }
    const query = `
      UPDATE submissions
      SET grade = ?, feedback = ?, graded_at = NOW()
      WHERE submission_id = ?`;
    db.query(query, [grade, feedback || '', submissionId], (err, result) => {
      if (err) {
        console.error('Error grading submission:', err);
        return res.status(500).json({ message: 'Error grading submission', error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      res.status(200).json({ message: 'Submission graded successfully' });
    });
  } catch (error) {
    console.error('Error in gradeSubmission:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
