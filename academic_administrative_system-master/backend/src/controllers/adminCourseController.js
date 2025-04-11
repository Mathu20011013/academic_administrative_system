const db = require("../config/db");

// Get all courses
const getAllCourses = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const query = `
    SELECT 
      course_id AS "Course ID", 
      course_name AS "Course Name", 
      syllabus AS "Syllabus", 
      price AS "Price",
      instructor_id AS "Instructor ID",
      image_url AS "Image URL"
    FROM course;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json(results);
  });
};

// Add new course
const addCourse = (req, res) => {
  const { course_name, syllabus, price, instructor_id, image_url } = req.body;

  console.log("Received data to add new course:", req.body);

  // Validate required fields
  if (!course_name || !syllabus || !price || !instructor_id) {
    return res.status(400).json({
      error: "Course name, syllabus, price, and instructor_id are required!",
    });
  }

  // Check if instructor_id exists
  const validateInstructorQuery = `SELECT * FROM instructor WHERE instructor_id = ?`;
  db.query(validateInstructorQuery, [instructor_id], (validateError, validateResults) => {
    if (validateError) {
      console.error("Error validating instructor_id:", validateError);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (validateResults.length === 0) {
      return res.status(400).json({ error: "Invalid instructor_id. Instructor does not exist." });
    }

    // If instructor_id is valid, proceed to insert the course
    const insertQuery = `
      INSERT INTO course (course_name, syllabus, price, instructor_id, image_url)
      VALUES (?, ?, ?, ?);
    `;

    const values = [course_name, syllabus, price, instructor_id, image_url];

    db.query(insertQuery, values, (insertError, insertResults) => {
      if (insertError) {
        console.error("Error adding course:", insertError);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.status(201).json({
        message: "Course added successfully",
        courseId: insertResults.insertId,
      });
    });
  });
};

// Edit course details
const editCourse = (req, res) => {
  const { course_id } = req.params;
  const { course_name, syllabus, price, instructor_id, image_url} = req.body;

  console.log("Course ID:", course_id); // Debugging
  console.log("Request Body:", req.body); // Debugging

  if (!course_name || !syllabus || !price || !instructor_id) {
    return res.status(400).json({
      error: "Course name, syllabus, price, and instructor_id are required!",
    });
  }

  const updateQuery = `
    UPDATE course
    SET 
      course_name = ?, 
      syllabus = ?, 
      price = ?, 
      instructor_id = ?,
      image_url =?
    WHERE course_id = ?;
  `;

  const values = [course_name, syllabus, price, instructor_id, image_url, course_id];

  db.query(updateQuery, values, (updateError, updateResults) => {
    if (updateError) {
      console.error("Error updating course:", updateError);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course updated successfully" });
  });
};

// Reset course price
const resetCoursePrice = (req, res) => {
  const { course_id } = req.params;
  const { price } = req.body;

  // Validate price
  if (!price || isNaN(parseFloat(price))) {
    return res.status(400).json({
      error: "Valid price is required!",
    });
  }

  const updateQuery = `
    UPDATE course
    SET price = ?
    WHERE course_id = ?;
  `;

  db.query(updateQuery, [price, course_id], (updateError, updateResults) => {
    if (updateError) {
      console.error("Error resetting price:", updateError);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if any rows were updated
    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course price updated successfully" });
  });
};

// Delete course
const deleteCourse = (req, res) => {
  const { course_id } = req.params;

  const query = `DELETE FROM course WHERE course_id = ?;`;

  db.query(query, [course_id], (error, results) => {
    if (error) {
      console.error("Error deleting course:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If no rows were deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  });
};

module.exports = {
  getAllCourses,
  addCourse,
  editCourse,
  resetCoursePrice,
  deleteCourse,
};
