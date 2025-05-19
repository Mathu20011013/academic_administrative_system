import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { 
  getAssignmentById, 
  getSubmissionsByAssignment,
  downloadSubmissionFile
} from '../../../api'; 
import '../../styles/SubmissionViewer.css';
import InstructorLayout from './in-Layout'; // Make sure this is the correct path to your InstructorLayout

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
        setLoading(true);
        
        // Fetch assignment details
        const assignmentResponse = await getAssignmentById(assignmentId);
        setAssignment(assignmentResponse);
        
        // Fetch submissions for this assignment
        const submissionsResponse = await getSubmissionsByAssignment(assignmentId);
        setSubmissions(submissionsResponse?.submissions || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading assignment data. Please try again.');
        setLoading(false);
      }
    };
    
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

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
      <InstructorLayout>
        <div className="container mt-5">
          <div className="loading">Loading assignment data</div>
        </div>
      </InstructorLayout>
    );
  }

  if (error) {
    return (
      <InstructorLayout>
        <div className="container mt-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="submission-viewer-container">
        <div className="card">
          {/* Card header with title and back button */}
          <div className="card-header">
            <h2 className="card-title">Assignment Submissions</h2>
            <div className="back-button-container">
              <button 
                className="navbar-color-btn"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card-body">
            {assignment && (
              <div className="assignment-info mb-4">
                <h4>{assignment.title}</h4>
                <p>{assignment.description}</p>
                <p><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
                <p><strong>Max Score:</strong> {assignment.max_score}</p>
              </div>
            )}

            <div className="submissions-table">
              <h5 className="mb-3">Student Submissions: {submissions.length}</h5>
              
              {submissions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Submission Date</th>
                        <th>File</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.submission_id}>
                          <td>{submission.student_name}</td>
                          <td>{new Date(submission.submission_date).toLocaleString()}</td>
                          <td>{submission.filename}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleDownloadFile(submission.submission_id)}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  No submissions for this assignment yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default SubmissionViewer;