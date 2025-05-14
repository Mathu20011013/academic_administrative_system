// src/controllers/paymentController.js
const db = require('../config/db');

exports.processPayment = async (req, res) => {
  try {
    const { courseId, amount, userId } = req.body;
    
    if (!courseId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information"
      });
    }
    
    // First, find the student_id that corresponds to this user_id
    db.query('SELECT student_id FROM student WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error finding student:', err);
        return res.status(500).json({
          success: false,
          message: "Payment processing failed"
        });
      }
      
      if (results.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No student record found for this user"
        });
      }
      
      const studentId = results[0].student_id;
      
      // Now insert the payment with the correct student_id
      const query = 'INSERT INTO payments (student_id, course_id, amount, payment_status) VALUES (?, ?, ?, ?)';
      db.query(query, [studentId, courseId, amount, 'completed'], (err, result) => {
        if (err) {
          console.error('Payment processing error:', err);
          return res.status(500).json({
            success: false,
            message: "Payment processing failed"
          });
        }
        
        // Return success response
        return res.status(200).json({
          success: true,
          message: "Payment processed successfully",
          paymentId: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message
    });
  }
};
