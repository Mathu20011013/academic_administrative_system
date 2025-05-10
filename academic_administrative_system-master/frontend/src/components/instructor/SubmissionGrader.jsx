// src/components/instructor/SubmissionGrader.jsx
// Purpose: Interface for instructors to grade student submissions

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import '../../styles/SubmissionGrader.css';

const SubmissionGrader = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get(`/assignment/${assignmentId}/submissions`);
        setSubmissions(response.data.submissions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load submissions');
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  const handleSubmissionSelect = (submission) => {
    setCurrentSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!currentSubmission) return;
    
    setSubmitting(true);
    try {
      await api.put(`/submission/${currentSubmission.submission_id}/grade`, {
        grade,
        feedback
      });
      
      // Update the submission in the list
      setSubmissions(submissions.map(sub => 
        sub.submission_id === currentSubmission.submission_id 
          ? { ...sub, grade, feedback, graded_at: new Date().toISOString() } 
          : sub
      ));
      
      // Reset current submission
      setCurrentSubmission(null);
      setGrade('');
      setFeedback('');
    } catch (err) {
      setError('Failed to submit grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading submissions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="submission-grader">
      <div className="submissions-list">
        <h2>Student Submissions</h2>
        {submissions.length === 0 ? (
          <p>No submissions yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.submission_id}>
                  <td>{submission.student_name}</td>
                  <td>{new Date(submission.submission_date).toLocaleString()}</td>
                  <td>{submission.grade ? 'Graded' : 'Pending'}</td>
                  <td>{submission.grade || '-'}</td>
                  <td>
                    <button 
                      onClick={() => handleSubmissionSelect(submission)}
                      className="view-btn"
                    >
                      {submission.grade ? 'Edit Grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {currentSubmission && (
        <div className="grading-form">
          <h3>Grade Submission</h3>
          <p><strong>Student:</strong> {currentSubmission.student_name}</p>
          <p>
            <strong>Submitted:</strong> {new Date(currentSubmission.submission_date).toLocaleString()}
          </p>
          
          <div className="submission-file">
            <a 
              href={currentSubmission.submission_file} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-link"
            >
              <i className="fas fa-file"></i> View Submission
            </a>
          </div>
          
          <form onSubmit={handleSubmitGrade}>
            <div className="form-group">
              <label>Grade</label>
              <input 
                type="number" 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                min="0"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Feedback</label>
              <textarea 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                rows="4"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setCurrentSubmission(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Grade'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubmissionGrader;
