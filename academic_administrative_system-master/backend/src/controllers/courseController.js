// src/controllers/courseController.js
const Course = require("../models/courseModel");
const db = require("../config/db");

// getAllCourses
exports.getAllCourses = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === 'true';
    
    let query = `
      SELECT c.course_id, c.course_name, c.price, c.image_url, u.username AS instructor_name, c.syllabus AS description, c.is_active
      FROM course c
      LEFT JOIN user u ON c.instructor_id = u.user_id`;
    
    // For non-admin users, only show active courses
    if (!showInactive) {
      query += ` WHERE c.is_active = TRUE`;
    }
    
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
};

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

// Toggle course status (active/inactive)
exports.toggleCourseStatus = async (req, res) => {
  const course_id = req.params.courseId;
  const { status } = req.body; // Expecting a boolean value
  
  try {
    const result = await Course.toggleStatus(course_id, status);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    const statusText = status ? 'activated' : 'deactivated';
    res.status(200).json({ 
      message: `Course ${statusText} successfully`, 
      result 
    });
  } catch (error) {
    console.error("Error updating course status:", error);
    res.status(500).json({ message: "Error updating course status", error });
  }
};

// Get instructor courses
exports.getInstructorCourses = async (req, res) => {
  console.log("getInstructorCourses called");
  console.log("User from token:", req.user);
  
  try {
    // Get instructor user_id from the authenticated user
    const userId = req.user?.id || req.user?.userId || req.user?.user_id;
    
    if (!userId) {
      console.error("No user ID found in request");
      return res.status(401).json({ message: "Authentication required" });
    }
    
    console.log("Looking up instructor for user_id:", userId);
    
    // Get instructor_id from user_id
    const instructorQuery = `SELECT instructor_id FROM instructor WHERE user_id = ?`;
    
    db.query(instructorQuery, [userId], async (err, instructorResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      
      console.log("Instructor lookup results:", instructorResults);
      
      if (instructorResults.length === 0) {
        return res.status(404).json({ 
          message: "Instructor not found for this user", 
          userId: userId
        });
      }
      
      const instructorId = instructorResults[0].instructor_id;
      console.log("Found instructor_id:", instructorId);
      
      // Get all courses for this instructor
      const coursesQuery = `
        SELECT * FROM course 
        WHERE instructor_id = ? AND is_active = 1
      `;
      
      db.query(coursesQuery, [instructorId], (err, courseResults) => {
        if (err) {
          console.error("Error fetching courses:", err);
          return res.status(500).json({ message: "Error fetching courses" });
        }
        
        console.log(`Found ${courseResults.length} active courses for instructor ${instructorId}`);
        return res.status(200).json({ courses: courseResults });
      });
    });
  } catch (error) {
    console.error("Error in getInstructorCourses:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete course (keeping for backward compatibility)
exports.deleteCourse = async (req, res) => {
  const course_id = req.params.courseId;
  try {
    // Instead of deleting, we'll deactivate the course
    const result = await Course.toggleStatus(course_id, false);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.status(200).json({ 
      message: "Course deactivated successfully", 
      result 
    });
  } catch (error) {
    console.error("Error deactivating course:", error);
    res.status(500).json({ message: "Error deactivating course", error });
  }
};
