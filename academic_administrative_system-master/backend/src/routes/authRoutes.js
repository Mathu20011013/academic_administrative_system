const express = require('express');
const { signup, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/authmiddleware');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Add a route to verify token and get current user
router.get('/me', authenticate, getCurrentUser);

module.exports = router;