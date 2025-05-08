// src/controllers/courseRatingController.js
const db = require('../config/db');

// Submit a course rating
exports.submitRating = async (req, res) => {
  try {
    const { course_id, student_id, rating, comment } = req.body;
    
    // Validate required fields
    if (!course_id || !student_id || !rating) {
      return res.status(400).json({ message: 'Course ID, student ID, and rating are required' });
    }
    
    // Check if rating already exists for this student and course
    const checkQuery = 'SELECT * FROM course_ratings WHERE course_id = ? AND student_id = ?';
    db.query(checkQuery, [course_id, student_id], (err, results) => {
      if (err) {
        console.error('Error checking existing rating:', err);
        return res.status(500).json({ message: 'Error checking existing rating', error: err.message });
      }
      
      if (results.length > 0) {
        // Update existing rating
        const updateQuery = 'UPDATE course_ratings SET rating = ?, comment = ? WHERE course_id = ? AND student_id = ?';
        db.query(updateQuery, [rating, comment || '', course_id, student_id], (err, result) => {
          if (err) {
            console.error('Error updating rating:', err);
            return res.status(500).json({ message: 'Error updating rating', error: err.message });
          }
          
          res.status(200).json({ message: 'Rating updated successfully' });
        });
      } else {
        // Create new rating
        const insertQuery = 'INSERT INTO course_ratings (course_id, student_id, rating, comment) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [course_id, student_id, rating, comment || ''], (err, result) => {
          if (err) {
            console.error('Error creating rating:', err);
            return res.status(500).json({ message: 'Error creating rating', error: err.message });
          }
          
          res.status(201).json({ message: 'Rating submitted successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error in submitRating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get course ratings
exports.getCourseRatings = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Get all ratings for this course
    const query = `
      SELECT cr.*, u.name as student_name
      FROM course_ratings cr
      JOIN student s ON cr.student_id = s.student_id
      JOIN user u ON s.user_id = u.user_id
      WHERE cr.course_id = ?
      ORDER BY cr.created_at DESC`;
    
    db.query(query, [courseId], (err, results) => {
      if (err) {
        console.error('Error fetching ratings:', err);
        return res.status(500).json({ message: 'Error fetching ratings', error: err.message });
      }
      
      // Calculate average rating
      let avgRating = 0;
      if (results.length > 0) {
        const sum = results.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = sum / results.length;
      }
      
      res.status(200).json({ 
        ratings: results,
        averageRating: avgRating,
        totalRatings: results.length
      });
    });
  } catch (error) {
    console.error('Error in getCourseRatings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
