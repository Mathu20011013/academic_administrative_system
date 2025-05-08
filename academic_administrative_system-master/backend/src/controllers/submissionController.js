const cloudinary = require('../config/cloudinary');
const Submission = require('../models/submissionModel');
const db = require('../config/db'); // Add this import

exports.submitAssignment = async (req, res) => {
  const { assignment_id, student_id } = req.body;

  // Check if file exists in the request
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Ensure assignment_id and student_id are provided
  if (!assignment_id || !student_id) {
    return res.status(400).json({ message: 'Assignment ID and Student ID are required' });
  }

  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
    
    // Get the Cloudinary URL (secure_url is the link to the uploaded file)
    const fileUrl = result.secure_url;
    
    // Create the submission entry in the database
    const submissionData = {
      assignment_id,
      student_id,
      submission_file: fileUrl, // Store Cloudinary URL in the database
    };
    
    // Save submission to database
    const submission = await Submission.create(submissionData);
    
    // Respond with success message and submission data
    res.status(200).json({
      message: 'Assignment submitted successfully',
      submission,
    });
  } catch (error) {
    // Handle any errors (Cloudinary or database issues)
    console.error("Error occurred:", error);
    res.status(500).json({ message: 'Error processing submission', error });
  }
};

// Add grading functionality
exports.gradeSubmission = async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const { grade, feedback } = req.body;
    
    // Validate grade
    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'Grade is required' });
    }
    
    // Update submission with grade
    const result = await Submission.updateGrade(submissionId, grade, feedback);
    
    if (!result) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.status(200).json({ message: 'Submission graded successfully' });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Error grading submission', error: error.message });
  }
};

// Get all submissions for an assignment
// Get all submissions for an assignment
exports.getSubmissions = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    
    // Get all submissions for this assignment
    const query = `
      SELECT s.*, u.username as student_name
      FROM submissions s
      JOIN student st ON s.student_id = st.student_id
      JOIN user u ON st.user_id = u.user_id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC`;
    
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
