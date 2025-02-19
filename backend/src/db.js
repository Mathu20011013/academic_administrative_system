// backend/src/db.js
const mysql = require('mysql2');

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'yourUsername', // Replace with your MySQL username
  password: 'yourPassword', // Replace with your MySQL password
  database: 'yourDatabase' // Replace with your database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;
