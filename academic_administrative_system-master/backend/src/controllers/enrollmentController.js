// src/controllers/enrollmentController.js
const Enrollment = require("../models/enrollmentModel");
const Course = require("../models/courseModel");
const Student = require("../models/studentModel");
const db = require('../config/db');

// Helper function to map user_id to student_id
const getUserStudentId = (user_id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT student_id FROM student WHERE user_id = ?';
    db.query(query, [user_id], (err, results) => {
      if (err) {
        console.error("Error in getUserStudentId:", err);
        reject(err);
      } else if (results.length === 0) {
        console.error("No student record found for user_id:", user_id);
        reject(new Error('No student record found for this user'));
      } else {
        console.log(`Mapped user_id ${user_id} to student_id ${results[0].student_id}`);
        resolve(results[0].student_id);
      }
    });
  });
};

// Helper function to check if an ID exists in the student table as student_id
const isStudentId = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM student WHERE student_id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count > 0);
      }
    });
  });
};

// Get all courses with instructor name
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.getAll(); // Ensure all necessary fields are returned
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses", error });
  }
};

// Enroll a student in a course
exports.enrollStudent = async (req, res) => {
  const { student_id, course_id } = req.body;
  if (!student_id || !course_id) {
    return res
      .status(400)
      .json({ message: "Student ID and Course ID are required" });
  }

  try {
    let actualStudentId = student_id;
    
    // If the ID provided is a user_id, map it to student_id
    try {
      const mappedStudentId = await getUserStudentId(student_id);
      actualStudentId = mappedStudentId;
    } catch (error) {
      // Check if the provided ID is already a valid student_id
      const isValid = await isStudentId(student_id);
      if (!isValid) {
        return res.status(404).json({ 
          success: false,
          message: "Invalid student ID. Please check your credentials."
        });
      }
    }
    
    // First check if the student is already enrolled
    const isEnrolled = await Enrollment.checkEnrollment(actualStudentId, course_id);
    if (isEnrolled) {
      return res
        .status(409) // Using 409 Conflict status code for already enrolled situation
        .json({ 
          success: false,
          message: "You are already enrolled in this course. You cannot enroll twice.",
          alreadyEnrolled: true
        });
    }

    // Create the enrollment with the student_id
    await Enrollment.create(actualStudentId, course_id);
    res.status(201).json({ 
      success: true,
      message: "Enrollment successful!" 
    });
  } catch (err) {
    console.error("Error during enrollment:", err);
    res
      .status(500)
      .json({ 
        success: false,
        message: "Error processing your enrollment request. Please try again.",
        error: err.message 
      });
  }
};

// Get all enrolled courses for a student with instructor name
exports.getEnrolledCourses = async (req, res) => {
  try {
    // IMPORTANT FIX: Get student_id from request parameters
    let id = req.params.student_id;
    console.log("Received ID for enrolled courses:", id);
    
    // Add detailed error logging to trace the issue
    if (!id) {
      console.error("No student_id provided in request parameters");
      return res.status(400).json({ 
        message: "Missing student ID parameter"
      });
    }
    
    // Try to directly get enrollments first without mapping (for debugging)
    console.log("Testing direct enrollment query with ID:", id);
    
    // First check if enrollment records exist
    db.query('SELECT COUNT(*) as count FROM enrollment WHERE student_id = ?', [id], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking enrollments:", checkErr);
        return res.status(500).json({ 
          message: "Database error checking enrollments",
          error: checkErr.message
        });
      }
      
      const enrollmentCount = checkResult[0].count;
      console.log(`Found ${enrollmentCount} enrollment records for student ${id}`);

      // If no direct match as student_id, try to map from user_id
      if (enrollmentCount === 0) {
        console.log("No enrollments found with direct ID, trying to map from user_id to student_id");
        
        // Use getUserStudentId helper to map user_id to student_id
        db.query('SELECT student_id FROM student WHERE user_id = ?', [id], (mappingErr, mappingResults) => {
          if (mappingErr) {
            console.error("Error mapping user_id to student_id:", mappingErr);
            return res.status(500).json({
              message: "Error mapping user ID to student ID",
              error: mappingErr.message
            });
          }
          
          if (mappingResults.length === 0) {
            console.log(`No student found for user_id ${id}`);
            return res.status(200).json({ courses: [] }); // Return empty array instead of error
          }
          
          // Use the mapped student_id
          const studentId = mappingResults[0].student_id;
          console.log(`Mapped user_id ${id} to student_id ${studentId}, trying query again`);
          
          // Now query with the correct student_id
          fetchCourses(studentId);
        });
      } else {
        // We found enrollments with the direct ID, proceed with query
        fetchCourses(id);
      }
    });
    
    // Function to fetch courses with correct student_id
    function fetchCourses(studentId) {
      const query = `
        SELECT c.course_id, c.course_name, c.price, c.image_url,
              COALESCE(u.username, 'Not assigned') AS instructor_name, 
              c.syllabus AS description,
              c.is_active
        FROM enrollment e
        JOIN course c ON e.course_id = c.course_id
        LEFT JOIN instructor i ON c.instructor_id = i.instructor_id
        LEFT JOIN user u ON i.user_id = u.user_id
        WHERE e.student_id = ? AND c.is_active = TRUE`;
      
      db.query(query, [studentId], (err, results) => {
        if (err) {
          console.error("Error in SQL query:", err);
          return res.status(500).json({ 
            message: "Database error fetching courses",
            error: err.message
          });
        }
        
        console.log(`Retrieved ${results.length} courses for student ${studentId}`);
        
        // Return with courses wrapper to match frontend expectations
        res.status(200).json({ courses: results });
      });
    }
  } catch (error) {
    console.error("Unexpected error in getEnrolledCourses:", error);
    res.status(500).json({ 
      message: "Unexpected server error",
      error: error.message 
    });
  }
};

// Add this export to match the route
exports.checkEnrollment = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    console.log(`Checking if student ${studentId} is enrolled in course ${courseId}`);

    const query = `
      SELECT COUNT(*) as enrolled
      FROM enrollment
      WHERE student_id = ? AND course_id = ?
    `;

    db.query(query, [studentId, courseId], (err, results) => {
      if (err) {
        console.error("Error checking enrollment:", err);
        return res.status(500).json({
          message: "Database error checking enrollment",
          error: err.message
        });
      }

      const isEnrolled = results[0].enrolled > 0;
      console.log(`Student ${studentId} enrollment status for course ${courseId}: ${isEnrolled ? 'Enrolled' : 'Not enrolled'}`);

      res.status(200).json({
        isEnrolled: isEnrolled
      });
    });
  } catch (error) {
    console.error("Error in checkEnrollment function:", error);
    res.status(500).json({
      message: "Failed to check enrollment status",
      error: error.message
    });
  }
};
