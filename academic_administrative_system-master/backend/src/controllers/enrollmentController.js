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
    let id = req.params.student_id;
    console.log("Received ID for enrolled courses:", id);
    
    // Always try to map from user_id to student_id first
    try {
      const studentId = await getUserStudentId(id);
      console.log(`Successfully mapped user_id ${id} to student_id ${studentId}`);
      id = studentId;
    } catch (error) {
      // If mapping fails, check if the provided ID is already a valid student_id
      const isValid = await isStudentId(id);
      if (!isValid) {
        console.error(`ID ${id} is neither a valid user_id nor a student_id`);
        return res.status(404).json({ 
          message: "No valid student found for the provided ID",
          error: error.message
        });
      }
      console.log(`Using provided ID ${id} directly as student_id`);
    }
    
    console.log("Fetching enrolled courses for student_id:", id);
    
    // Query your database for enrolled courses
    const enrolledCourses = await Enrollment.getEnrolledCourses(id);
    console.log("Enrolled courses found:", enrolledCourses.length);
    
    // Return with courses wrapper to match frontend expectations
    res.status(200).json({ courses: enrolledCourses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({
      message: "Failed to fetch enrolled courses",
      error: error.message
    });
  }
};

// Check if a student is enrolled in a specific course
exports.checkEnrollment = async (req, res) => {
  try {
    let id = req.params.studentId;
    const course_id = req.params.courseId;
    
    // Try to map from user_id to student_id
    try {
      const studentId = await getUserStudentId(id);
      id = studentId;
    } catch (error) {
      // If mapping fails, check if the provided ID is already a valid student_id
      const isValid = await isStudentId(id);
      if (!isValid) {
        return res.status(404).json({ message: "No valid student found for the provided ID" });
      }
    }
    
    const isEnrolled = await Enrollment.checkEnrollment(id, course_id);
    res.status(200).json({ isEnrolled });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({ message: "Error checking enrollment status", error });
  }
};
