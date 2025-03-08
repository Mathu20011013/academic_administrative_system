// backend/src/config/db.js 
// This file sets up the MySQL connection using the mysql package and environment variables. The connection is established with error handling.
const mysql = require('mysql');
require('dotenv').config(); // Ensure dotenv is configured

// MySQL connection setup
// Use the environment variables to connect to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// establish actual connection with error handling
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = db;
