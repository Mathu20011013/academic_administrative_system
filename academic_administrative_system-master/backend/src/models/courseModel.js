// src/models/courseModel.js
const db = require("../config/db"); // Assuming you're using MySQL or another DB

module.exports = {
  // Get all courses
getAll: (showInactive = false) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM course";
    if (!showInactive) {
      query += " WHERE is_active = TRUE";
    }
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching all courses:", err);
        reject(err);
      } else {
        console.log("Courses fetched:", results);
        resolve(results);
      }
    });
  });
},

  // Function to get courses assigned to a specific instructor
getInstructorCourses: (instructor_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.course_id, c.course_name, c.price, c.image_url, u.username AS instructor_name, c.syllabus AS description, c.is_active
      FROM course c
      LEFT JOIN user u ON c.instructor_id = u.user_id
      WHERE c.instructor_id = ? AND c.is_active = TRUE`;
    
    db.query(query, [instructor_id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
},

  // Get course by ID
  getById: (course_id) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM course WHERE course_id = ?";
      db.query(query, [course_id], (err, rows) => {
        if (err) {
          console.error("Error fetching course by ID:", err);
          reject(new Error("Failed to fetch course by ID"));
        } else if (!rows || rows.length === 0) {
          reject(new Error("Course not found"));
        } else {
          console.log("Course found:", rows[0]); // Log the found course
          resolve(rows[0]);
        }
      });
    });
  },

  // Create a new course
  create: (courseData) => {
    const { course_name, instructor_id, price, syllabus, image_url } =
      courseData;
    const query =
      "INSERT INTO course (course_name, instructor_id, price, syllabus, image_url) VALUES (?, ?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [course_name, instructor_id, price, syllabus, image_url],
        (err, result) => {
          if (err) {
            console.error("Error creating course:", err);
            reject(err);
          } else {
            console.log("Course created successfully:", result);
            resolve(result);
          }
        }
      );
    });
  },

  // Update course details
  update: (course_id, courseData) => {
    const { course_name, instructor_id, price, syllabus, image_url } =
      courseData;
    const query =
      "UPDATE course SET course_name = ?, instructor_id = ?, price = ?, syllabus = ?, image_url = ? WHERE course_id = ?";
    return new Promise((resolve, reject) => {
      db.query(
        query,
        [course_name, instructor_id, price, syllabus, image_url, course_id], // Changed instructor_name to instructor_id
        (err, result) => {
          if (err) {
            console.error("Error updating course:", err);
            reject(err);
          } else {
            console.log("Course updated successfully:", result);
            resolve(result);
          }
        }
      );
    });
  },
  // Delete a course
toggleStatus: (course_id, status) => {
  // Add validation
  if (!course_id) {
    return Promise.reject(new Error("Course ID is required"));
  }
  
  const query = "UPDATE course SET is_active = ? WHERE course_id = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [status, course_id], (err, result) => {
      if (err) {
        console.error("Error updating course status:", err);
        reject(err);
      } else {
        console.log(`Course status updated to ${status ? 'active' : 'inactive'} successfully`);
        resolve(result);
      }
    });
  });
},


};
