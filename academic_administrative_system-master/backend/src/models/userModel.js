const db = require('../config/db');

// Function to create a new user
const createUser = (userData, callback) => {
  // Ensure callback is a function
  if (typeof callback !== 'function') {
    console.error('Callback is not a function');
    return;
  }

  const query = 'INSERT INTO users SET ?';
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

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error('Error finding user by email:', error.message);
      return callback(error);
    }
    callback(null, results.length > 0 ? results[0] : null);
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