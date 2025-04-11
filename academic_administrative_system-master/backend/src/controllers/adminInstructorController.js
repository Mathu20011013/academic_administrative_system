const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get all instructors with joined data from user and instructor tables
const getAllInstructors = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const query = `
    SELECT 
      u.user_id AS "User ID", 
      i.instructor_id AS "Instructor ID",
      u.username AS "Username", 
      i.instructor_id AS "Instructor ID",
      u.email AS "Email", 
      IFNULL(u.contact_number, '------') AS "Phone",
      IFNULL(i.qualification, '------') AS "Qualification",
      IFNULL(i.specialization, '------') AS "Specialization",
      u.role AS "Role",
      i.bio AS "Bio",
      i.rating_average AS "Rating",
      u.signup_date AS "Signup Date" 
    FROM user u
    LEFT JOIN instructor i ON u.user_id = i.user_id
    WHERE u.role = 'instructor';
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching instructors:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
};

// Add new instructor - create entry in both user and instructor tables
const addInstructor = async (req, res) => {
  const { username, email, password, contact_number, qualification, specialization, bio, role } = req.body;

  console.log("Received data to add new instructor:", req.body);

  // Validate required fields
  if (!username || !email || !password || !role || role !== 'instructor') {
    return res.status(400).json({ 
      error: "Username, email, password are required, and role must be 'instructor'!" 
    });
  }

  // Check if email already exists
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
      
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Start transaction to ensure both tables are updated
      db.beginTransaction(function(err) {
        if (err) {
          console.error('Error starting transaction:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Insert into user table
        const insertUserQuery = `
          INSERT INTO user (username, email, password, contact_number, role, signup_date) 
          VALUES (?, ?, ?, ?, ?, ?);
        `;
        const userValues = [username, email, hashedPassword, contact_number || null, role, currentDate];
        
        db.query(insertUserQuery, userValues, (userError, userResults) => {
          if (userError) {
            console.error('Error adding user:', userError);
            return db.rollback(() => {
              res.status(500).json({ error: 'Error adding user: ' + userError.message });
            });
          }

          const userId = userResults.insertId;

          // Now insert into instructor table - INCLUDE ONLY RELEVANT FIELDS
          const insertInstructorQuery = `
            INSERT INTO instructor (user_id, bio, qualification, specialization, rating_average, email)
            VALUES (?, ?, ?, ?, ?, ?);
          `;
          const instructorValues = [
            userId, 
            bio || null, 
            qualification || null, 
            specialization || null, 
            0.0, // Default rating for new instructor
            email  // Adding email to match your database schema
          ];
          
          db.query(insertInstructorQuery, instructorValues, (instructorError, instructorResults) => {
            if (instructorError) {
              console.error('Error adding instructor details:', instructorError);
              return db.rollback(() => {
                res.status(500).json({ error: 'Error adding instructor details: ' + instructorError.message });
              });
            }

            // Commit the transaction
            db.commit((commitErr) => {
              if (commitErr) {
                console.error('Error committing transaction:', commitErr);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Error committing transaction: ' + commitErr.message });
                });
              }

              res.status(201).json({
                message: 'Instructor added successfully',
                userId: userId,
                instructorId: instructorResults.insertId
              });
            });
          });
        });
      });
    } catch (error) {
      console.error('Error creating instructor account:', error);
      return res.status(500).json({ error: 'Error creating account: ' + error.message });
    }
  });
};


// Edit instructor details in both user and instructor tables
const editInstructor = (req, res) => {
  const { user_id } = req.params;
  const { username, email, password, contact_number, qualification, specialization, bio, role } = req.body;

  console.log("Received data to update instructor:", req.body);

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

    // Begin transaction to update both tables
    db.beginTransaction(async function(err) {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      try {
        // If password is provided, hash it
        let hashedPassword = null;
        if (password) {
          const saltRounds = 10;
          hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Update user table
        let updateUserQuery;
        let userValues;

        if (password) {
          // Include password update
          updateUserQuery = `
            UPDATE user
            SET username = ?, 
                email = ?, 
                contact_number = ?, 
                role = ?,
                password = ?
            WHERE user_id = ?;
          `;
          userValues = [username, email, contact_number || null, role, hashedPassword, user_id];
        } else {
          // Exclude password update
          updateUserQuery = `
            UPDATE user
            SET username = ?, 
                email = ?, 
                contact_number = ?, 
                role = ?
            WHERE user_id = ?;
          `;
          userValues = [username, email, contact_number || null, role, user_id];
        }

        db.query(updateUserQuery, userValues, (updateUserError, updateUserResults) => {
          if (updateUserError) {
            return db.rollback(() => {
              console.error('Error updating user data:', updateUserError);
              res.status(500).json({ error: 'Error updating user data: ' + updateUserError.message });
            });
          }

          // Check if user was found and updated
          if (updateUserResults.affectedRows === 0) {
            return db.rollback(() => {
              res.status(404).json({ error: 'Instructor not found' });
            });
          }

          // Check if instructor record exists first
          const checkInstructorQuery = `SELECT * FROM instructor WHERE user_id = ?`;
          
          db.query(checkInstructorQuery, [user_id], (checkError, checkResults) => {
            if (checkError) {
              return db.rollback(() => {
                console.error('Error checking instructor record:', checkError);
                res.status(500).json({ error: 'Error checking instructor record: ' + checkError.message });
              });
            }

            let instructorQuery;
            let instructorValues;

            if (checkResults.length > 0) {
              // Update existing instructor record
              instructorQuery = `
                UPDATE instructor
                SET qualification = ?,
                    specialization = ?,
                    bio = ?,
                    email = ?
                WHERE user_id = ?;
              `;
              instructorValues = [qualification || null, specialization || null, bio || null, email, user_id];
            } else {
              // Create new instructor record
              instructorQuery = `
                INSERT INTO instructor (user_id, qualification, specialization, bio, rating_average, email)
                VALUES (?, ?, ?, ?, ?, ?);
              `;
              instructorValues = [user_id, qualification || null, specialization || null, bio || null, 0.0, email];
            }

            // Execute instructor query
            db.query(instructorQuery, instructorValues, (instructorError, instructorResults) => {
              if (instructorError) {
                return db.rollback(() => {
                  console.error('Error updating instructor details:', instructorError);
                  res.status(500).json({ error: 'Error updating instructor details: ' + instructorError.message });
                });
              }

              // Commit transaction
              db.commit((commitErr) => {
                if (commitErr) {
                  return db.rollback(() => {
                    console.error('Error committing transaction:', commitErr);
                    res.status(500).json({ error: 'Error committing transaction: ' + commitErr.message });
                  });
                }

                res.status(200).json({ message: 'Instructor updated successfully' });
              });
            });
          });
        });
      } catch (error) {
        return db.rollback(() => {
          console.error('Error in transaction:', error);
          res.status(500).json({ error: 'Error updating instructor: ' + error.message });
        });
      }
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

// Delete instructor - remove from both tables
const deleteInstructor = (req, res) => {
  const { user_id } = req.params;

  // Begin transaction
  db.beginTransaction(function(err) {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // First delete from instructor table
    const deleteInstructorQuery = `DELETE FROM instructor WHERE user_id = ?;`;
    
    db.query(deleteInstructorQuery, [user_id], (instructorError, instructorResults) => {
      if (instructorError) {
        return db.rollback(() => {
          console.error('Error deleting instructor record:', instructorError);
          res.status(500).json({ error: 'Internal Server Error' });
        });
      }
      
      // Now delete from user table
      const deleteUserQuery = `DELETE FROM user WHERE user_id = ? AND role = 'instructor';`;
      
      db.query(deleteUserQuery, [user_id], (userError, userResults) => {
        if (userError) {
          return db.rollback(() => {
            console.error('Error deleting user record:', userError);
            res.status(500).json({ error: 'Internal Server Error' });
          });
        }

        // If no rows were deleted
        if (userResults.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: 'Instructor not found' });
          });
        }

        // Commit transaction
        db.commit((commitErr) => {
          if (commitErr) {
            return db.rollback(() => {
              console.error('Error committing transaction:', commitErr);
              res.status(500).json({ error: 'Internal Server Error' });
            });
          }

          res.status(200).json({ message: 'Instructor deleted successfully' });
        });
      });
    });
  });
};

module.exports = {
  getAllInstructors,
  addInstructor,
  editInstructor,
  resetInstructorPassword,
  deleteInstructor
};