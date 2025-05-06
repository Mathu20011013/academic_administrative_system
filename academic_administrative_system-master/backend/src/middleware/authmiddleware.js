// Path: /middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Make sure this matches EXACTLY with the JWT_SECRET in jwtUtils.js
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    console.log('Auth Header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // Make sure we're correctly handling the 'Bearer ' prefix
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    console.log('Token extracted:', token.substring(0, 10) + '...');
    
    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded token:', decoded);
      req.user = decoded;
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      throw verifyError;
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

module.exports = {
  authenticate
};