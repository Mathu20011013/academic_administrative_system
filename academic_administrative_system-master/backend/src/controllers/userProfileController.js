const db = require('../config/db');
const bcrypt = require('bcrypt');  // Ensure bcrypt is required for password hashing

const getUserProfile = (req, res) => {
    const { user_id } = req.params;
    const { role } = req.query; // Get the role from query parameters

    // Basic query for user details (common for all roles)
    let query = `
        SELECT u.user_id, u.username, u.email, u.contact_number, u.role
        FROM user u
        WHERE u.user_id = ?;
    `;

    // If the role is 'student', add student-specific fields
    if (role === "student") {
        query = `
            SELECT u.user_id, u.username, u.email, u.contact_number, u.role,
                   s.student_id, s.guardian_name, s.guardian_contact, s.gender, 
                   s.dob, s.address
            FROM user u
            LEFT JOIN student s ON u.user_id = s.user_id
            WHERE u.user_id = ?;
        `;
    }

    // If the role is 'instructor', add instructor-specific fields
    if (role === "instructor") {
        query = `
            SELECT u.user_id, u.username, u.email, u.contact_number, u.role,
                   i.qualification, i.specialization, i.bio, i.rating_average
            FROM user u
            LEFT JOIN instructor i ON u.user_id = i.user_id
            WHERE u.user_id = ?;
        `;
    }

    // If the role is 'admin', add admin-specific fields
    if (role === "admin") {
        query = `
            SELECT u.user_id, u.username, u.email, u.contact_number, u.role,
                   a.admin_name, a.profile_picture, a.bio
            FROM user u
            LEFT JOIN admin a ON u.user_id = a.user_id
            WHERE u.user_id = ?;
        `;
    }

    // Execute the query based on role
    db.query(query, [user_id], (error, results) => {
        if (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        res.status(200).json(user); // Send back the profile data based on role
    });
};

// Update user profile (admin, student, instructor)

const updateUserProfile = (req, res) => {
    const { user_id } = req.params;
    const { username, email, contact_number, password, guardian_name, guardian_contact, gender, dob, address, role } = req.body;

    // Basic validation
    if (!username || !email) {
        return res.status(400).json({ error: 'Username and Email are required!' });
    }

    // Begin transaction to update both user and student tables
    db.beginTransaction(function(err) {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Update user data in the user table
        let updateUserQuery = `
            UPDATE user SET username = ?, email = ?, contact_number = ? WHERE user_id = ?
        `;
        let userValues = [username, email, contact_number, user_id];

        if (password) {
            const saltRounds = 10;
            const hashedPassword = bcrypt.hashSync(password, saltRounds);  // Hash the password before saving
            updateUserQuery = `
                UPDATE user SET username = ?, email = ?, contact_number = ?, password = ? WHERE user_id = ?
            `;
            userValues = [username, email, contact_number, hashedPassword, user_id];
        }

        db.query(updateUserQuery, userValues, (error, results) => {
            if (error) {
                return db.rollback(() => {
                    console.error('Error updating user profile:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
            }

            // Update student data if the role is 'student'
            if (role === 'student') {
                const updateStudentQuery = `
                    UPDATE student SET guardian_name = ?, guardian_contact = ?, gender = ?, dob = ?, address = ?
                    WHERE user_id = ?
                `;
                const studentValues = [guardian_name, guardian_contact, gender, dob, address, user_id];

                db.query(updateStudentQuery, studentValues, (studentError) => {
                    if (studentError) {
                        return db.rollback(() => {
                            console.error('Error updating student profile:', studentError);
                            res.status(500).json({ error: 'Internal Server Error' });
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
                        res.status(200).json({ message: 'Profile updated successfully' });
                    });
                });
            } else {
                // For other roles (admin, instructor), just commit the user update
                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error('Error committing transaction:', commitErr);
                            res.status(500).json({ error: 'Internal Server Error' });
                        });
                    }
                    res.status(200).json({ message: 'Profile updated successfully' });
                });
            }
        });
    });
};

// Reset user password
const resetPassword = (req, res) => {
    const { user_id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(new_password, saltRounds);  // Use bcrypt to hash password

    const query = `
        UPDATE user SET password = ? WHERE user_id = ?;
    `;

    db.query(query, [hashedPassword, user_id], (error, results) => {
        if (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Password updated successfully' });
    });
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    resetPassword
};
