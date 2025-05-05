// src/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set up multer to store files locally in an 'uploads' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using the current timestamp and original file name
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file name
  },
});

// File size limit (5MB) and allowed file types (jpg, jpeg, png, pdf)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);  // Reject the file
  }
};

// Create the upload instance with settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB limit
  },
  fileFilter: fileFilter,  // Apply file type filter
});

module.exports = upload;
