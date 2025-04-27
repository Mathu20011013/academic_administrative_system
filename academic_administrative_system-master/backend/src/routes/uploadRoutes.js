const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

/**
 * Route to handle file uploads.
 * This route uploads a file to Cloudinary and returns the file URL.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path; // Path of the uploaded file
    const folder = req.body.folder || 'default'; // Optional folder name
    const fileUrl = await uploadToCloudinary(filePath, folder); // Upload to Cloudinary

    res.status(200).json({ success: true, fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

module.exports = router;