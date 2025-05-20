// models/discussion.js
const db = require('../config/db');

// Get all discussions - fix this function
exports.getAllDiscussions = (callback) => {
  console.log("Fetching all discussions");
  
  const sql = `
    SELECT f.*, u.username, u.email, u.role 
    FROM discussion_forum f
    LEFT JOIN user u ON f.user_id = u.user_id
    ORDER BY f.created_at DESC
  `;
  
  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error in getAllDiscussions query:", error);
    } else {
      console.log(`Retrieved ${results?.length || 0} discussions`);
    }
    callback(error, results || []);
  });
};

// Get discussion by ID - use correct table name
exports.getDiscussionById = (id, callback) => {
  const sql = `
    SELECT f.*, u.username, u.email, u.role
    FROM discussion_forum f
    LEFT JOIN user u ON f.user_id = u.user_id
    WHERE f.forum_id = ?
  `;
  db.query(sql, [id], callback);
};

// Create discussion - use correct table name
exports.createDiscussion = (course_id, user_id, title, question, callback) => {
  console.log("Creating discussion with:", { course_id, user_id, title, question });
  
  // Build query with CORRECT TABLE NAME: discussion_forum
  let sql, params;
  
  if (course_id) {
    sql = 'INSERT INTO discussion_forum (course_id, user_id, title, question, created_at) VALUES (?, ?, ?, ?, NOW())';
    params = [course_id, user_id, title, question];
  } else {
    sql = 'INSERT INTO discussion_forum (user_id, title, question, created_at) VALUES (?, ?, ?, NOW())';
    params = [user_id, title, question];
  }
  
  console.log("SQL query:", sql);
  console.log("Parameters:", params);
  
  db.query(sql, params, callback);
};
