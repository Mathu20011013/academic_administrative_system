import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import '../../styles/SubmissionViewer.css';
import InstructorLayout from './in-Layout';

const SubmissionViewer = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState({});

  // Fetch assignment details and submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get assignment details
        const assignmentResponse = await api.get(`/api/assignment/${assignmentId}`);
        setAssignment(assignmentResponse.data);
        
        // Get submissions for this assignment
        const submissionsResponse = await api.get(`/api/assignment/${assignmentId}/submissions`);
        setSubmissions(submissionsResponse.data.submissions || []);
        
        // Initialize grades and feedback
        const initialGrades = {};
        const initialFeedback = {};
        submissionsResponse.data.submissions?.forEach(sub => {
          initialGrades[sub.submission_id] = sub.grade || '';
          initialFeedback[sub.submission_id] = sub.feedback || '';
        });
        setGrades(initialGrades);
        setFeedback(initialFeedback);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load assignment and submissions");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assignmentId]);

  // Handle grade change
  const handleGradeChange = (submissionId, value) => {
    setGrades(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };
  
  // Handle feedback change
  const handleFeedbackChange = (submissionId, value) => {
    setFeedback(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };
  
  // Submit grade and feedback
  const handleSubmitGrade = async (submissionId) => {
    try {
      setSaving({ ...saving, [submissionId]: true });
      
      await api.put(`/api/submission/${submissionId}/grade`, {
        grade: grades[submissionId],
        feedback: feedback[submissionId]
      });
      
      // Update the submissions list with new grade
      setSubmissions(submissions.map(sub => {
        if (sub.submission_id === submissionId) {
          return {
            ...sub,
            grade: grades[submissionId],
            feedback: feedback[submissionId],
            graded_at: new Date().toISOString()
          };
        }
        return sub;
      }));
      
      alert('Grade submitted successfully!');
    } catch (err) {
      console.error("Error submitting grade:", err);
      alert('Failed to submit grade. Please try again.');
    } finally {
      setSaving({ ...saving, [submissionId]: false });
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleString();
  };
  
  // Handle file download
  const handleDownload = (fileUrl, fileName) => {
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="loading">Loading submissions...</div>
      </InstructorLayout>
    );
  }

  if (error) {
    return (
      <InstructorLayout>
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="submission-viewer">
        <div className="assignment-header">
          <h2>{assignment?.title || 'Assignment'}</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back to Course
          </button>
        </div>
        
        <div className="assignment-details">
          <p><strong>Due Date:</strong> {formatDate(assignment?.due_date)}</p>
          <p><strong>Max Score:</strong> {assignment?.max_score || 100}</p>
        </div>
        
        <div className="submissions-count">
          <h3>Submissions ({submissions.length})</h3>
        </div>
        
        {submissions.length === 0 ? (
          <div className="no-submissions">
            <p>No submissions have been made for this assignment yet.</p>
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div key={submission.submission_id} className="submission-card">
                <div className="submission-header">
                  <h4>{submission.student_name || 'Student'}</h4>
                  <span className="submission-date">
                    Submitted: {formatDate(submission.submitted_at)}
                  </span>
                </div>
                
                {submission.submission_file && (
                  <div className="submission-file">
                    <h5>Submitted File</h5>
                    <div className="file-item">
                      <i className="fas fa-file-alt"></i>
                      <span>{submission.filename || 'Submission File'}</span>
                      <button 
                        className="download-btn"
                        onClick={() => handleDownload(submission.submission_file, 'submission-file')}
                      >
                        <i className="fas fa-download"></i> Download
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="grading-section">
                  <div className="grade-input">
                    <label>Grade (out of {assignment?.max_score || 100}):</label>
                    <input
                      type="number"
                      min="0"
                      max={assignment?.max_score || 100}
                      value={grades[submission.submission_id]}
                      onChange={(e) => handleGradeChange(submission.submission_id, e.target.value)}
                      disabled={saving[submission.submission_id]}
                    />
                  </div>
                  
                  <div className="feedback-input">
                    <label>Feedback:</label>
                    <textarea
                      value={feedback[submission.submission_id]}
                      onChange={(e) => handleFeedbackChange(submission.submission_id, e.target.value)}
                      disabled={saving[submission.submission_id]}
                      placeholder="Provide feedback to the student..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="submit-grade">
                    <button
                      onClick={() => handleSubmitGrade(submission.submission_id)}
                      disabled={saving[submission.submission_id]}
                      className="grade-btn"
                    >
                      {saving[submission.submission_id] ? 'Saving...' : 'Submit Grade'}
                    </button>
                    
                    {submission.graded_at && (
                      <div className="graded-info">
                        <span>Last graded: {formatDate(submission.graded_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};

export default SubmissionViewer;