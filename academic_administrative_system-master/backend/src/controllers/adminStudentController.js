const db = require('../config/db');

// Get all students
const getAllStudents = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const query = `
    SELECT 
      user_id AS "User ID", 
      username AS "Username", 
      email AS "Email", 
      IFNULL(contact_number, '------') AS "Phone", -- Replace NULL with '-'
      role AS "Role", 
      signup_date AS "Signup Date" 
    FROM user 
    WHERE role = 'student';
  `;
  
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
};

// Edit student details
const editStudent = (req, res) => {
  const { user_id } = req.params;  // Get user_id from URL params
  const { username, email, contact_number, role } = req.body; // Get fields from request body

  console.log("Received data to update:", req.body); // Log the request body

  // Validate fields
  if (!username || !email || !contact_number || !role) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const query = `
    UPDATE user
    SET username = ?, email = ?, contact_number = ?, role = ?
    WHERE user_id = ?;
  `;

  // Execute the query with the provided values
  db.query(query, [username, email, contact_number, role, user_id], (error, results) => {
    if (error) {
      console.error('Error updating student:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    console.log("Query executed successfully:", results); // Log query results

    // Check if any rows were updated (user_id not found)
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student updated successfully' });
  });
};

// Delete student
const deleteStudent = (req, res) => {
  const { user_id } = req.params;  // Get user_id from URL

  const query = `DELETE FROM user WHERE user_id = ?;`;

  db.query(query, [user_id], (error, results) => {
    if (error) {
      console.error('Error deleting student:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // If no rows were deleted (user_id not found)
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  });
};

module.exports = {
  getAllStudents,
  editStudent,
  deleteStudent
};
