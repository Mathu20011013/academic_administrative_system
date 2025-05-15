// src/controllers/enrollmentController.js
const Enrollment = require("../models/enrollmentModel");
const Course = require("../models/courseModel");
const Student = require("../models/studentModel");
const db = require('../config/db');

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
    // First check if the student is already enrolled
    const isEnrolled = await Enrollment.checkEnrollment(student_id, course_id);
    if (isEnrolled) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }
    
    // Create the enrollment with the user_id (which will be mapped to student_id in the model)
    await Enrollment.create(student_id, course_id);
    res.status(200).json({ message: "Enrollment successful!" });
  } catch (err) {
    console.error("Error during enrollment:", err);
    res
      .status(500)
      .json({ message: "Error enrolling student", error: err.message });
  }
};

// Get all enrolled courses for a student with instructor name
exports.getEnrolledCourses = async (req, res) => {
  const student_id = req.params.student_id;

  try {
    // First check if we need to map from user_id to student_id
    let studentId = student_id;
    
    // If this looks like a user_id rather than a student_id, map it
    if (isNaN(studentId) || parseInt(studentId) > 1000) { // Assuming user_ids are larger than student_ids
      const query = 'SELECT student_id FROM student WHERE user_id = ?';
      const results = await new Promise((resolve, reject) => {
        db.query(query, [student_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      studentId = results[0].student_id;
    }
    
    // Fetch enrolled courses with instructor name
    const courses = await Enrollment.getEnrolledCourses(studentId);
    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({ message: "Error fetching enrolled courses", error });
  }
};

// Check if a student is enrolled in a specific course
exports.checkEnrollment = async (req, res) => {
  const student_id = req.params.studentId;
  const course_id = req.params.courseId;
  
  try {
    // First check if we need to map from user_id to student_id
    let studentId = student_id;
    
    // If this looks like a user_id rather than a student_id, map it
    if (isNaN(studentId) || parseInt(studentId) > 1000) { // Assuming user_ids are larger than student_ids
      const query = 'SELECT student_id FROM student WHERE user_id = ?';
      const results = await new Promise((resolve, reject) => {
        db.query(query, [student_id], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      studentId = results[0].student_id;
    }
    
    const isEnrolled = await Enrollment.checkEnrollment(studentId, course_id);
    res.status(200).json({ isEnrolled });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({ message: "Error checking enrollment status", error });
  }
};
