const db = require('../config/db');

const getAllStudents = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const query = `
    SELECT 
      user_id AS "User ID", 
      username AS "Username", 
      email AS "Email", 
      contact_number AS "Phone",  -- Ensure this matches the key in the frontend
      role AS "Role",  -- Ensure this matches the key in the frontend
      signup_date AS "Signup Date"  -- Ensure this matches the key in the frontend
    FROM user 
    WHERE role = 'student';
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log('Fetched students:', results);
    res.status(200).json(results);
  });
};

module.exports = {
  getAllStudents,
};