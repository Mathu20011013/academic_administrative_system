const express = require('express');
const db = require('../config/db'); // Import the database connection
const cors = require('cors'); // Add CORS package
const { signup, login } = require('../controllers/authController');

const app = express();
app.use(cors()); // Enable CORS globally

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// ✅ New Route: Get all students (excluding passwords)
router.get('/students', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const query = `
  SELECT 
    id AS "User ID", 
    username AS "Username", 
    email, 
    phone, 
    address, 
    DATE_FORMAT(dob, '%Y-%m-%d') AS dob,  -- This will return only the date part
    gender, 
    guardian_name AS "Guardian Name", 
    guardian_contact AS "Guardian Contact", 
    role, 
    created_at
  FROM users 
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
});

module.exports = router;
