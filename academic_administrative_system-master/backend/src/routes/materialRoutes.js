// src/routes/materialRoutes.js
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const upload = require('../middlewares/upload');

// Get all materials for a course
router.get('/course/:courseId', materialController.getMaterialsByCourseId);

// Get specific material by id
router.get('/:materialId', materialController.getMaterialById);

// Upload a new material - the 'single' method accepts one file with field name 'file'
router.post('/upload', upload.single('file'), materialController.uploadMaterial);

// Download a material file
router.get('/download/:materialId', materialController.downloadMaterial);

// Delete a material
router.delete('/:materialId', materialController.deleteMaterial);

module.exports = router;