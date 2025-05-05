// src/controllers/enrollmentController.js
const Enrollment = require('../models/enrollmentModel');
const Course = require('../models/courseModel');
const Student = require('../models/studentModel');

// Enroll a student in a course
exports.enrollStudent = async (req, res) => {
  const { student_id, course_id } = req.body;

  // Validate input
  if (!student_id || !course_id) {
    return res.status(400).json({ message: 'Student ID and Course ID are required' });
  }

  try {
    // Check if the student exists
    const student = await Student.findById(student_id);

    // Check if the course exists
    const course = await Course.getById(course_id);

    // Check if the student is already enrolled
    const isEnrolled = await Enrollment.checkEnrollment(student_id, course_id);
    if (isEnrolled) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }

    // Enroll the student
    await Enrollment.create(student_id, course_id);

    res.status(200).json({
      message: 'Student enrolled successfully',
      course_name: course.course_name,
      instructor_name: course.instructor_name,
    });
  } catch (err) {
    console.error('Error during enrollment:', err);
    res.status(500).json({ message: 'Error enrolling student', error: err.message });
  }
};

// Get all enrolled courses for a student
exports.getEnrolledCourses = async (req, res) => {
  const student_id = req.params.student_id;

  try {
    // Fetch enrolled courses
    const courses = await Enrollment.getEnrolledCourses(student_id);
    res.status(200).json({ courses });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return res.status(500).json({ message: 'Error fetching enrolled courses', error });
  }
};
