//handles user authentication
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');
const User = require('../models/userModel');

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Check if user exists using callback pattern
  User.findUserByEmail(email, async (error, existingUser) => {
    if (error) {
      console.error('Error checking existing user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user data object
      const userData = { 
        username,
        email, 
        password: hashedPassword
      };
      
      // Add username if provided
      /*if (username) {
        userData.username = username;
      } */
      
      // Create user using callback pattern, save the data to the database
      User.createUser(userData, (createError, results) => {
        if (createError) {
          console.error('Error creating user:', createError);
          return res.status(500).json({ 
            error: 'Internal server error', 
            details: createError.message 
          });
        }
        
        // Get the user ID from the insert results
        const userId = results.insertId;
        
        // Generate JWT token
        const token = generateToken({ id: userId });
        res.cookie('token', token, { httpOnly: true });
        
        // Return success response
        res.status(201).json({ 
          message: 'User created successfully', 
          user: { id: userId, email, username } // Don't include password in response
        });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  });
};

// login function
const login = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Find user by email
  User.findUserByEmail(email, async (error, user) => {
    if (error) {
      console.error('Error finding user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    try {
      // Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = generateToken({ id: user.id });
      res.cookie('token', token, { httpOnly: true });
      
      // Remove password from response
      const userResponse = {...user};
      delete userResponse.password;
      
      res.status(200).json({ 
        message: 'Login successful', 
        user: userResponse 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  });
};

module.exports = {
  signup,
  login,
};