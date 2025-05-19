import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { 
  getAssignmentById, 
  getSubmissionsByAssignment,
  viewSubmissionFile,
  downloadSubmissionFile
} from '../../../api'; // Adjust path as needed
import '../../styles/SubmissionViewer.css';
import Layout from '../Layout';
import { Button } from 'react-bootstrap';

const SubmissionViewer = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching assignment data for ID:', assignmentId);
        // Fetch assignment details using the imported function
        const assignmentData = await getAssignmentById(assignmentId);
        console.log('Assignment data received:', assignmentData);
        setAssignment(assignmentData);
        
        // Fetch submissions for this assignment using the imported function
        const submissionsData = await getSubmissionsByAssignment(assignmentId);
        console.log('Submissions data received:', submissionsData);
        setSubmissions(submissionsData.submissions || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load assignment data: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assignmentId]);

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await api.put(`/submission/${submissionId}/grade`, {
        grade,
        feedback
      });
      
      // Refresh submissions data
      const response = await api.get(`/submission/assignment/${assignmentId}/submissions`);
      setSubmissions(response.data.submissions || []);
      
      alert('Submission graded successfully');
    } catch (err) {
      console.error('Error grading submission:', err);
      alert('Failed to grade submission');
    }
  };

  // Use the imported functions for file operations with better error handling
  const handleViewFile = (submissionId) => {
    try {
      console.log("Viewing file for submission:", submissionId);
      viewSubmissionFile(submissionId);
    } catch (err) {
      console.error("Error viewing file:", err);
      alert("Failed to view file. Please try again.");
    }
  };

  const handleDownloadFile = (submissionId) => {
    try {
      console.log("Downloading file for submission:", submissionId);
      downloadSubmissionFile(submissionId);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading assignment data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="submission-viewer">
        <div className="assignment-header">
          <h2>Assignment Submissions</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>
        
        {assignment && (
          <div className="assignment-details">
            <h3>{assignment.title}</h3>
            <p>{assignment.description}</p>
            <p><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
            <p><strong>Max Score:</strong> {assignment.max_score}</p>
          </div>
        )}
        
        <div className="submissions-count">
          <h3>Submissions ({submissions.length})</h3>
        </div>
        
        {submissions.length === 0 ? (
          <div className="no-submissions">
            <p>No submissions yet for this assignment.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date Submitted</th>
                  <th>File</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(submission => (
                  <tr key={submission.submission_id}>
                    <td>{submission.student_name || `Student ${submission.student_id}`}</td>
                    <td>{new Date(submission.submission_date).toLocaleString()}</td>
                    <td>
                      <span 
                        className="file-link"
                        onClick={() => handleViewFile(submission.submission_id)}
                      >
                        {submission.filename || 'View File'}
                      </span>
                    </td>
                    <td>
                      {submission.grade !== null ? 
                        `${submission.grade}/${assignment?.max_score || 100}` : 
                        'Not graded'}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewFile(submission.submission_id)}
                        >
                          View
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleDownloadFile(submission.submission_id)}
                        >
                          Download
                        </button>
                        <button 
                          className="btn btn-sm btn-info"
                          data-bs-toggle="modal"
                          data-bs-target={`#gradeModal-${submission.submission_id}`}
                        >
                          Grade
                        </button>
                      </div>
                      
                      {/* Grade Modal */}
                      <div className="modal fade" id={`gradeModal-${submission.submission_id}`} tabIndex="-1">
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">Grade Submission</h5>
                              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const grade = e.target.elements.grade.value;
                                  const feedback = e.target.elements.feedback.value;
                                  handleGradeSubmission(submission.submission_id, grade, feedback);
                                  
                                  // Close the modal (requires Bootstrap JS)
                                  document.querySelector(`#gradeModal-${submission.submission_id} .btn-close`).click();
                                }}
                              >
                                <div className="mb-3">
                                  <label htmlFor={`grade-${submission.submission_id}`} className="form-label">Grade (max: {assignment?.max_score || 100})</label>
                                  <input 
                                    type="number" 
                                    className="form-control" 
                                    id={`grade-${submission.submission_id}`}
                                    name="grade"
                                    defaultValue={submission.grade || ''}
                                    min="0"
                                    max={assignment?.max_score || 100}
                                    required
                                  />
                                </div>
                                <div className="mb-3">
                                  <label htmlFor={`feedback-${submission.submission_id}`} className="form-label">Feedback</label>
                                  <textarea 
                                    className="form-control" 
                                    id={`feedback-${submission.submission_id}`}
                                    name="feedback"
                                    defaultValue={submission.feedback || ''}
                                    rows="3"
                                  ></textarea>
                                </div>
                                <div className="d-flex justify-content-end">
                                  <button type="button" className="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                                  <button type="submit" className="btn btn-primary">Save</button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubmissionViewer;