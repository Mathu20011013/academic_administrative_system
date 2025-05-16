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

// File size limit (increased to 20MB) and allowed file types (jpg, jpeg, png, pdf)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-zip-compressed',
    'video/mp4', 'video/mpeg', 'video/quicktime'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Invalid file type. Only images, documents, videos and PDF files are allowed.'), false);  // Reject the file
  }
};

// Create the upload instance with increased size settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,  // 20MB limit (increased from 5MB)
  },
  fileFilter: fileFilter,  // Apply file type filter
});

module.exports = upload;
