// src/controllers/enrollmentController.js
const Enrollment = require("../models/enrollmentModel");
const Course = require("../models/courseModel");
const Student = require("../models/studentModel");

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
    
    // Skip student validation or create student record if needed
    // We'll directly create the enrollment
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
    // Fetch enrolled courses with instructor name
    const courses = await Enrollment.getEnrolledCourses(student_id);
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
    const isEnrolled = await Enrollment.checkEnrollment(student_id, course_id);
    res.status(200).json({ isEnrolled });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({ message: "Error checking enrollment status", error });
  }
};
