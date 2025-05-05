const cloudinary = require('../config/cloudinary'); // Cloudinary configuration
const Submission = require('../models/submissionModel'); // Submission model

// Handle assignment submission
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
