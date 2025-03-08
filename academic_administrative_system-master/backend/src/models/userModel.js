// Exported functions to interact with the users table in the database
const db = require('../config/db'); // Import the database connection

// Function to create a new user
const createUser = (userData, callback) => {
  // Ensure callback is a function
  if (typeof callback !== 'function') {
    console.error('Callback is not a function');
    return;
  }

  const query = 'INSERT INTO users SET ?'; // Query to insert user data
  db.query(query, userData, (error, results) => {
    if (error) {
      console.error('Error inserting user:', error.message);
      return callback(error);
    }
    callback(null, results);
  });
};

// Function to find a user by email
const findUserByEmail = (email, callback) => {
  // Ensure callback is a function
  if (typeof callback !== 'function') {
    console.error('Callback is not a function');
    return;
  }

  const query = 'SELECT * FROM users WHERE email = ?';// Query to find user by email
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error('Error finding user by email:', error.message);
      return callback(error);
    }
    callback(null, results.length > 0 ? results[0] : null);//determines whether a user exists in the database and passes the result to the callback function.


  });
};

// Promise-based versions (alternative approach)
const createUserPromise = (userData) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO users SET ?';
    db.query(query, userData, (error, results) => {
      if (error) {
        console.error('Error inserting user:', error.message);
        return reject(error);
      }
      resolve(results);
    });
  });
};

const findUserByEmailPromise = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error('Error finding user by email:', error.message);
        return reject(error);
      }
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  createUserPromise,
  findUserByEmailPromise
};