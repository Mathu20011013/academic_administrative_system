// backend/src/models/User.js
const db = require('../db');

// User model for signup and login
const User = {
  // Signup function
  create: (userData, callback) => {
    const { username, email, password } = userData;
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], callback);
  },

  // Find user by email for login
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  }
};

module.exports = User;
