const bcrypt = require('bcrypt');

// Plain password that you want to hash
const password = 'admin1';  // Replace this with the password you want to hash

// Use bcrypt to hash the password
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password:', hashedPassword);
  // Now you can use this hashed password in your database query
});
