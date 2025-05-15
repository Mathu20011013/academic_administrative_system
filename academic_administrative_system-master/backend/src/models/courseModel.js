// src/models/courseModel.js
const db = require("../config/db"); // Assuming you're using MySQL or another DB

module.exports = {
  // Get all courses
  getAll: () => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM course";
      db.query(query, (err, results) => {
        if (err) {
          console.error("Error fetching all courses:", err);
          reject(err);
        } else {
          console.log("Courses fetched:", results); // Log the result
          resolve(results);
        }
      });
    });
  },
  // Function to get courses assigned to a specific instructor
 getInstructorCourses: (instructor_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.course_id, c.course_name, c.price, c.image_url, u.username AS instructor_name, c.syllabus AS description
      FROM course c
      LEFT JOIN user u ON c.instructor_id = u.user_id
      WHERE c.instructor_id = ?`;
    
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
delete: (course_id) => {
  const query = "DELETE FROM course WHERE course_id = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [course_id], (err, result) => {
      if (err) {
        console.error("Error deleting course:", err);
        reject(err);
      } else {
        console.log("Course and related enrollments deleted successfully");
        resolve(result);
      }
    });
  });
},

};
