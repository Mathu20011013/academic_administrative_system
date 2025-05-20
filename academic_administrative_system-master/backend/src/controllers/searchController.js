// src/controllers/searchController.js
const db = require('../config/db');

exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const searchQuery = `%${query}%`;
    
    // Modified query to get ALL courses matching the search term
    // No enrollment filtering - just get all courses that match
    const sql = `
      SELECT c.course_id, c.course_name
      FROM course c
      WHERE c.course_name LIKE ? 
      OR c.syllabus LIKE ?
      LIMIT 15`;
    
    db.query(sql, [searchQuery, searchQuery], (err, results) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).json({ message: "Error performing search", error: err });
      }
      
      res.status(200).json({ results });
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error performing search", error });
  }
};
