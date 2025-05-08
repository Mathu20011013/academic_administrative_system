// src/routes/courseContentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const courseContentController = require('../controllers/courseContentController');

// Create course content (with optional file upload)
router.post('/create', upload.array('files', 5), courseContentController.createContent);

// Get all content for a course
router.get('/course/:courseId', courseContentController.getCourseContent);

// Update course content
router.put('/:contentId', upload.array('files', 5), courseContentController.updateContent);

// Delete course content
router.delete('/:contentId', courseContentController.deleteContent);

// Delete a file
router.delete('/file/:fileId', courseContentController.deleteFile);

module.exports = router;
