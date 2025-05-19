const cloudinary = require('../config/cloudinary');
const Submission = require('../models/submissionModel');
const db = require('../config/db'); // Add this import

exports.submitAssignment = async (req, res) => {
  const { assignment_id, student_id } = req.body;
  console.log("Submission request received:", { assignment_id, student_id });

  // Check if file exists in the request
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Ensure assignment_id and student_id are provided
  if (!assignment_id || !student_id) {
    return res.status(400).json({ message: 'Assignment ID and Student ID are required' });
  }

  try {
    // First, check if a student exists linked to this user_id
    db.query('SELECT * FROM student WHERE user_id = ?', [student_id], async (err, results) => {
      if (err) {
        console.error("Error checking student:", err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      let actualStudentId;
      
      // If no student is linked to this user_id, create one
      if (results.length === 0) {
        console.log(`No student found for user ID ${student_id}. Creating a new record.`);
        
        // Create a new student record - don't provide student_id as it's auto-increment
        db.query(
          'INSERT INTO student (user_id, gender) VALUES (?, "other")',
          [student_id], 
          async (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error creating student:", insertErr);
              return res.status(500).json({ message: 'Error creating student record', error: insertErr.message });
            }
            
            // Use the auto-generated student_id
            actualStudentId = insertResult.insertId;
            console.log(`Created student record with ID ${actualStudentId} for user ${student_id}`);
            
            // Now proceed with the upload and submission
            await proceedWithSubmission(actualStudentId);
          }
        );
      } else {
        // Student exists, use their student_id
        actualStudentId = results[0].student_id;
        console.log(`Found existing student with ID ${actualStudentId} for user ${student_id}`);
        await proceedWithSubmission(actualStudentId);
      }
    });

    // Function to handle the file upload and submission process
    async function proceedWithSubmission(actualStudentId) {
      try {
        // Upload file to Cloudinary
        console.log(`Uploading file to Cloudinary for student ${actualStudentId}:`, req.file.originalname);
        const result = await cloudinary.uploader.upload(req.file.path, { 
          resource_type: "auto",
          folder: "submissions" 
        });
        
        // Get the Cloudinary URL
        const fileUrl = result.secure_url;
        console.log("File uploaded successfully:", fileUrl);
        
        // Insert into database using the actual student_id
        const query = `
          INSERT INTO submissions 
          (assignment_id, student_id, submission_file, filename, submission_date) 
          VALUES (?, ?, ?, ?, NOW())
        `;
        
        db.query(query, [
          assignment_id, 
          actualStudentId,  // Use the correct student_id, not the user_id
          fileUrl, 
          req.file.originalname
        ], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ 
              message: 'Error saving submission to database', 
              error: err.message 
            });
          }
          
          // Return success response
          res.status(201).json({
            message: 'Assignment submitted successfully',
            submissionId: result.insertId,
            fileUrl: fileUrl
          });
        });
      } catch (error) {
        console.error("Error in upload process:", error);
        res.status(500).json({ 
          message: 'Error uploading file', 
          error: error.message 
        });
      }
    }
  } catch (error) {
    console.error("General error:", error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Grade a submission
exports.gradeSubmission = async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const { grade, feedback } = req.body;
    
    // Validate grade
    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: 'Grade is required' });
    }
    
    // Update the submission with the grade and feedback
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
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Error grading submission', error: error.message });
  }
};

// Get all submissions for an assignment
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    
    const query = `
      SELECT s.*, COALESCE(u.username, CONCAT('User ', st.user_id)) as student_name
      FROM submissions s
      JOIN student st ON s.student_id = st.student_id
      LEFT JOIN user u ON st.user_id = u.user_id
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
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
};

// View a submission file
exports.viewSubmissionFile = (req, res) => {
  const { submissionId } = req.params;
  
  // Get the file URL from database
  const query = 'SELECT submission_file, filename FROM submissions WHERE submission_id = ?';
  
  db.query(query, [submissionId], (err, results) => {
    if (err) {
      console.error('Error getting submission file:', err);
      return res.status(500).json({ message: 'Error retrieving file', error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    const { submission_file } = results[0];
    
    if (!submission_file) {
      return res.status(404).json({ message: 'No file found for this submission' });
    }
    
    // Redirect to the file URL
    res.redirect(submission_file);
  });
};

// Download a submission file
exports.downloadSubmissionFile = (req, res) => {
  const { submissionId } = req.params;
  
  // Get the file URL from database
  const query = 'SELECT submission_file, filename FROM submissions WHERE submission_id = ?';
  
  db.query(query, [submissionId], (err, results) => {
    if (err) {
      console.error('Error getting submission file:', err);
      return res.status(500).json({ message: 'Error retrieving file', error: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    const { submission_file, filename } = results[0];
    
    if (!submission_file) {
      return res.status(404).json({ message: 'No file found for this submission' });
    }
    
    // For Cloudinary URLs, modify to force download
    let downloadUrl = submission_file;
    
    // Append fl_attachment to Cloudinary URL to force download
    if (downloadUrl.includes('/upload/')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    } else {
      // Add as query parameter if not a standard Cloudinary URL
      downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + 'fl_attachment=true';
    }
    
    res.redirect(downloadUrl);
  });
};
