// src/controllers/courseController.js
const Course = require('../models/courseModel');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.getAll();
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  const course_id = req.params.courseId;
  try {
    const course = await Course.getById(course_id);
    res.status(200).json({ course });
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ message: 'Failed to fetch course by ID', error });
  }
};

// Create a course
exports.createCourse = async (req, res) => {
  const courseData = req.body;
  try {
    const result = await Course.create(courseData);
    res.status(201).json({ message: 'Course created successfully', result });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course', error });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  const course_id = req.params.courseId;
  const courseData = req.body;
  try {
    const result = await Course.update(course_id, courseData);
    res.status(200).json({ message: 'Course updated successfully', result });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course', error });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  const course_id = req.params.courseId;
  try {
    const result = await Course.delete(course_id);
    res.status(200).json({ message: 'Course deleted successfully', result });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course', error });
  }
};
