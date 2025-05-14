// Add to src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Process payment
router.post('/process', paymentController.processPayment);

module.exports = router;
