// backend/src/routes/authRoutes.js
//to handle login and sign up pages
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Signup Route
router.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    const userData = { username, email, password: hashedPassword };
    User.create(userData, (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(200).json({ message: 'User created successfully!' });
    });
  });
});

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (error, results) => {
    if (error || results.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    bcrypt.compare(password, results[0].password, (err, match) => {
      if (!match) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: results[0].id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    });
  });
});

module.exports = router;
