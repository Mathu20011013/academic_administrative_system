const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');
const db = require('../config/db');

const signup = (req, res) => {
  const { username, email, password, role, contact_number } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Check if email already exists
    const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
    db.query(checkEmailQuery, [email], (checkError, checkResults) => {
      if (checkError) {
        console.error('Error checking email:', checkError);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Insert the new user into the user table
      const query = 'INSERT INTO user (username, email, password, role, contact_number, signup_date) VALUES (?, ?, ?, ?, ?, NOW())';
      db.query(query, [username, email, hashedPassword, role, contact_number || null], (error, results) => {
        if (error) {
          console.error('Error inserting user:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const userId = results.insertId; // Get the user_id from the newly inserted user

        // If the role is 'student', insert an entry in the student table with minimal data (no profile info)
        if (role === 'student') {
          // Insert the student record with only user_id, no extra profile information at this point
          const studentQuery = 'INSERT INTO student (user_id) VALUES (?)';
          db.query(studentQuery, [userId], (studentError) => {
            if (studentError) {
              console.error('Error inserting student:', studentError);
              // Continue with token generation
            }
          });
        } else if (role === 'instructor') {
          // Insert instructor record
          const instructorQuery = 'INSERT INTO instructor (user_id) VALUES (?)';
          db.query(instructorQuery, [userId], (instructorError) => {
            if (instructorError) {
              console.error('Error inserting instructor:', instructorError);
              // Continue with token generation
            }
          });
        } else if (role === 'admin') {
          // Insert admin record
          const adminQuery = 'INSERT INTO admin (user_id, admin_name) VALUES (?, ?)';
          db.query(adminQuery, [userId, username], (adminError) => {
            if (adminError) {
              console.error('Error inserting admin:', adminError);
              // Continue with token generation
            }
          });
        }

        // Generate a token for the new user
        const token = generateToken({ 
          id: userId,
          username, 
          email, 
          role
        });
        
        // Return user data along with token
        res.status(201).json({ 
          message: 'User created successfully', 
          token,
          user: {
            user_id: userId,
            username,
            email,
            role,
            contact_number: contact_number || null
          }
        });
      });
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
      const token = generateToken({ 
        id: user.user_id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      });
      
      // Create a user object without the password
      const userData = { ...user };
      delete userData.password;
      
      // Return token and user data
      res.status(200).json({ 
        message: 'Login successful', 
        token,
        user: userData
      });
    });
  });
};

// Get user profile - useful for token verification
// In backend/src/controllers/authController.js
// Add this function if it doesn't exist:
const getCurrentUser = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = req.user.id;
  
  const query = 'SELECT user_id, username, email, role, contact_number FROM user WHERE user_id = ?';
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching current user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(results[0]);
  });
};

// Add it to the exports
module.exports = {
  signup,
  login,
  getCurrentUser
};