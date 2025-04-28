const jwt = require('jsonwebtoken');

// Generate JWT token with user data
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
