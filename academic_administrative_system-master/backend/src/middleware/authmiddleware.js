// filepath: /d:/AAS/academic_administrative_system-master/academic_administrative_system-master/backend/src/middleware/authMiddleware.js
//
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  authenticate
};