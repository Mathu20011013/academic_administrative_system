// models/discussion.js
const db = require('../config/db');

// Get all discussions from the `discussion_forum` table
const getAllDiscussions = (callback) => {
  const query = `
    SELECT 
      d.forum_id AS discussion_id,
      d.title,
      d.question AS content,
      d.created_at,
      d.user_id,
      u.username,
      u.email,
      CASE 
        WHEN s.student_id IS NOT NULL THEN 'student'
        WHEN i.instructor_id IS NOT NULL THEN 'instructor'
        ELSE 'admin'
      END as user_type
    FROM discussion_forum d
    JOIN user u ON d.user_id = u.user_id
    LEFT JOIN student s ON u.user_id = s.user_id
    LEFT JOIN instructor i ON u.user_id = i.user_id
    ORDER BY d.created_at DESC
  `;
  
  db.query(query, callback);
};

// Create a new discussion
const createDiscussion = (discussionData, callback) => {
  const { course_id, user_id, title, question } = discussionData;
  
  const query = `
    INSERT INTO discussion_forum (course_id, user_id, title, question) 
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [course_id, user_id, title, question], callback);
};

module.exports = {
  getAllDiscussions,
  createDiscussion
};
