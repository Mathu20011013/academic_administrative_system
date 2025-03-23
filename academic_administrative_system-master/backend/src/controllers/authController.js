const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');
const db = require('../config/db');

const signup = (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Insert the new user into the database
    const query = 'INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, 'student'], (error, results) => {
      if (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Generate a token for the new user
      const token = generateToken({ id: results.insertId, username, email, role: 'student' });
      res.status(201).json({ message: 'User created successfully', token });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  // Fetch the user from the database
  const query = 'SELECT * FROM user WHERE email = ?';
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare the password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing password:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate a token for the user
      const token = generateToken({ id: user.user_id, username: user.username, email: user.email, role: user.role });
      res.status(200).json({ message: 'Login successful', token });
    });
  });
};

module.exports = {
  signup,
  login,
};