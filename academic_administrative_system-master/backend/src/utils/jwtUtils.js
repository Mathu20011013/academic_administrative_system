// utils/jwtUtils.js
const jwt = require('jsonwebtoken');

// Make sure this matches EXACTLY with the JWT_SECRET in authMiddleware.js
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Generate JWT token with user data
const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Return null if token is invalid
  }
};

module.exports = {
  generateToken,
  verifyToken
};