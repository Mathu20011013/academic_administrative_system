// src/routes/classLinkRoutes.js
const express = require('express');
const router = express.Router();
const classLinkController = require('../controllers/classLinkController');

// Create class link
router.post('/create', classLinkController.createClassLink);

// Update class link
router.put('/:linkId', classLinkController.updateClassLink);

// Get class link details
router.get('/:linkId', classLinkController.getClassLink);

module.exports = router;
