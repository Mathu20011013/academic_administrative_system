// src/components/course/Assignment.jsx
// Purpose: Display assignment details and submission options for students

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Assignment.css';
import api from '../../api/api';

const Assignment = ({ assignment, isInstructor, studentId }) => {
  const [submission, setSubmission] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If student, check if they've already submitted
    if (!isInstructor && studentId) {
      const checkSubmission = async () => {
        try {
          const response = await api.get(`/submission/student/${studentId}/assignment/${assignment.assignment_id}`);
          if (response.data.submission) {
            setSubmission(response.data.submission);
          }
        } catch (error) {
          console.error('Error checking submission:', error);
        }
      };
      checkSubmission();
    }
  }, [assignment.assignment_id, isInstructor, studentId]);

  const handleViewSubmissions = () => {
    navigate(`/assignment/${assignment.assignment_id}/submissions`);
  };

  const handleSubmit = () => {
    navigate(`/assignment/${assignment.assignment_id}/submit`);
  };

  // Calculate if assignment is past due
  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <div className={`assignment ${isPastDue ? 'past-due' : ''}`}>
      <h3>{assignment.title}</h3>
      <p className="assignment-description">{assignment.description}</p>
      <div className="assignment-details">
        <p>
          <strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}
        </p>
        <p>
          <strong>Max Score:</strong> {assignment.max_score} points
        </p>
      </div>
      
      {isInstructor ? (
        <button onClick={handleViewSubmissions} className="view-submissions-btn">
          View Submissions
        </button>
      ) : (
        <div className="student-actions">
          {submission ? (
            <div className="submission-status">
              <p>Submitted on: {new Date(submission.submission_date).toLocaleString()}</p>
              {submission.grade !== null && (
                <p className="grade">
                  Grade: {submission.grade}/{assignment.max_score}
                </p>
              )}
            </div>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="submit-btn"
              disabled={isPastDue}
            >
              {isPastDue ? 'Past Due' : 'Submit Assignment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignment;
