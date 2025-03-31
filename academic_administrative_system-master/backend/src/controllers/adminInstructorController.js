const db = require('../config/db');
const bcrypt = require('bcrypt'); // You'll need to install this package for password hashing

// Get all instructors
const getAllInstructors = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const query = `
    SELECT 
      user_id AS "User ID", 
      username AS "Username", 
      email AS "Email", 
      IFNULL(contact_number, '------') AS "Phone",
      IFNULL(qualification, '------') AS "Qualification",
      IFNULL(specialization, '------') AS "Specialization",
      role AS "Role", 
      signup_date AS "Signup Date" 
    FROM user 
    WHERE role = 'instructor';
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching instructors:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
};

// Add new instructor
const addInstructor = async (req, res) => {
  const { username, email, password, contact_number, qualification, specialization, role } = req.body;
  
  console.log("Received data to add new instructor:", req.body);

  // Validate required fields
  if (!username || !email || !password || !role || role !== 'instructor') {
    return res.status(400).json({ 
      error: "Username, email, password are required, and role must be 'instructor'!" 
    });
  }

  // Check if user with this email already exists
  const checkEmailQuery = `SELECT * FROM user WHERE email = ?`;
  
  db.query(checkEmailQuery, [email], async (emailError, emailResults) => {
    if (emailError) {
      console.error('Error checking email:', emailError);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (emailResults.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Email is unique, proceed with adding the instructor
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const insertQuery = `
        INSERT INTO user (
          username, 
          email,
          password,
          contact_number, 
          qualification, 
          specialization, 
          role, 
          signup_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const values = [
        username,
        email,
        hashedPassword,
        contact_number || null,
        qualification || null,
        specialization || null,
        role,
        currentDate
      ];

      db.query(insertQuery, values, (insertError, insertResults) => {
        if (insertError) {
          console.error('Error adding instructor:', insertError);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(201).json({ 
          message: 'Instructor added successfully',
          instructorId: insertResults.insertId
        });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ error: 'Error creating account' });
    }
  });
};

// Edit instructor details
const editInstructor = (req, res) => {
  const { user_id } = req.params;
  const { username, email, contact_number, qualification, specialization, role } = req.body;

  console.log("Received data to update:", req.body);

  // Validate required fields
  if (!username || !email || !role) {
    return res.status(400).json({ error: "Username, email and role are required!" });
  }

  // Check if the email is already in use by another user
  const checkEmailQuery = `SELECT * FROM user WHERE email = ? AND user_id != ?`;
  
  db.query(checkEmailQuery, [email, user_id], (emailError, emailResults) => {
    if (emailError) {
      console.error('Error checking email:', emailError);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (emailResults.length > 0) {
      return res.status(409).json({ error: 'Email already in use by another user' });
    }

    // Email is valid, proceed with update
    const updateQuery = `
      UPDATE user
      SET username = ?, 
          email = ?, 
          contact_number = ?, 
          qualification = ?,
          specialization = ?,
          role = ?
      WHERE user_id = ?;
    `;

    // Execute the query with the provided values
    db.query(updateQuery, [
      username, 
      email, 
      contact_number || null, 
      qualification || null, 
      specialization || null, 
      role, 
      user_id
    ], (updateError, updateResults) => {
      if (updateError) {
        console.error('Error updating instructor:', updateError);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      console.log("Query executed successfully:", updateResults);

      // Check if any rows were updated
      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ error: 'Instructor not found' });
      }

      res.status(200).json({ message: 'Instructor updated successfully' });
    });
  });
};

// Reset instructor password
const resetInstructorPassword = async (req, res) => {
  const { user_id } = req.params;
  const { password } = req.body;

  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({ 
      error: "Password is required and must be at least 6 characters long!" 
    });
  }

  try {
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const updateQuery = `
      UPDATE user
      SET password = ?
      WHERE user_id = ? AND role = 'instructor';
    `;

    db.query(updateQuery, [hashedPassword, user_id], (updateError, updateResults) => {
      if (updateError) {
        console.error('Error resetting password:', updateError);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Check if any rows were updated
      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ error: 'Instructor not found' });
      }

      res.status(200).json({ message: 'Password reset successfully' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ error: 'Error resetting password' });
  }
};

// Delete instructor
const deleteInstructor = (req, res) => {
  const { user_id } = req.params;

  const query = `DELETE FROM user WHERE user_id = ? AND role = 'instructor';`;

  db.query(query, [user_id], (error, results) => {
    if (error) {
      console.error('Error deleting instructor:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // If no rows were deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.status(200).json({ message: 'Instructor deleted successfully' });
  });
};

module.exports = {
  getAllInstructors,
  addInstructor,
  editInstructor,
  resetInstructorPassword,
  deleteInstructor
};