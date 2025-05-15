// src/controllers/courseController.js
const Course = require("../models/courseModel");
const db = require("../config/db"); // Make sure this line is present

// getAllCourses
exports.getAllCourses = async (req, res) => {
  try {
    const query = `
      SELECT c.course_id, c.course_name, c.price, c.image_url, u.username AS instructor_name, c.syllabus AS description
      FROM course c
      LEFT JOIN user u ON c.instructor_id = u.user_id`;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching courses:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch courses", error: err });
      }
      res.status(200).json({ courses: results });
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses", error });
  }
}; // Missing closing brace added

// Get course by ID
exports.getCourseById = async (req, res) => {
  const course_id = req.params.courseId;
  try {
    const query = `
      SELECT c.course_id, c.course_name, c.price, c.image_url, 
             u.username AS instructor_name, c.syllabus AS description
      FROM course c
      LEFT JOIN user u ON c.instructor_id = u.user_id
      WHERE c.course_id = ?`;

    db.query(query, [course_id], (err, results) => {
      if (err) {
        console.error("Error fetching course:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch course", error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json({ course: results[0] });
    });
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    res.status(500).json({ message: "Failed to fetch course by ID", error });
  }
};

// Create a course
exports.createCourse = async (req, res) => {
  const courseData = req.body;
  try {
    const result = await Course.create(courseData);
    res.status(201).json({ message: "Course created successfully", result });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Error creating course", error });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  const course_id = req.params.courseId;
  const courseData = req.body;
  try {
    const result = await Course.update(course_id, courseData);
    res.status(200).json({ message: "Course updated successfully", result });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating course", error });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  const course_id = req.params.courseId;
  try {
    const result = await Course.delete(course_id);
    res.status(200).json({ message: "Course deleted successfully", result });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Error deleting course", error });
  }
};

// Get instructor courses
exports.getInstructorCourses = async (req, res) => {
  try {
    // Check if req.user exists
    if (!req.user) {
      console.error("User not authenticated");
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user.id;
    console.log("User ID from token:", userId);
    
    // First, get the instructor_id that corresponds to this user_id
    const instructorQuery = `SELECT instructor_id FROM instructor WHERE user_id = ?`;
    
    db.query(instructorQuery, [userId], (err, instructorResults) => {
      if (err) {
        console.error("Error finding instructor:", err);
        return res.status(500).json({ 
          message: "Failed to find instructor record", 
          error: err 
        });
      }
      
      if (instructorResults.length === 0) {
        return res.status(404).json({ 
          message: "No instructor record found for this user" 
        });
      }
      
      const instructorId = instructorResults[0].instructor_id;
      console.log("Mapped instructor_id:", instructorId);
      
      // Now query for courses using the correct instructor_id
      // Include the JOIN with user table to get instructor_name
      const coursesQuery = `
        SELECT c.course_id, c.course_name, c.price, c.image_url, u.username AS instructor_name, c.syllabus AS description
        FROM course c
        LEFT JOIN user u ON c.instructor_id = u.user_id
        WHERE c.instructor_id = ?`;
      
      db.query(coursesQuery, [instructorId], (err, results) => {
        if (err) {
          console.error("Error fetching instructor courses:", err);
          return res.status(500).json({ 
            message: "Failed to fetch instructor courses", 
            error: err 
          });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ 
            message: "No courses assigned to this instructor." 
          });
        }
        
        return res.status(200).json({ courses: results });
      });
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return res
      .status(500)
      .json({ message: "Error fetching instructor's courses.", error });
  }
};
