const express = require('express');
const { getUserProfile, updateUserProfile, resetPassword } = require('../controllers/userProfileController');
const { authenticate } = require('../middleware/authmiddleware'); // Fixed the casing here
const router = express.Router();

// Public profile route - no authentication required for viewing
router.get('/:user_id', getUserProfile);

// Protected routes - only authenticated users can access their own profile
router.put('/:user_id', authenticate, (req, res, next) => {
  // Check if user is updating their own profile or is an admin
  if (req.user.id === parseInt(req.params.user_id) || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'You can only update your own profile' });
  }
}, updateUserProfile);

// Password reset route - only authenticated users can reset their own password
router.put('/:user_id/reset-password', authenticate, (req, res, next) => {
  // Check if user is resetting their own password or is an admin
  if (req.user.id === parseInt(req.params.user_id) || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'You can only reset your own password' });
  }
}, resetPassword);

module.exports = router;