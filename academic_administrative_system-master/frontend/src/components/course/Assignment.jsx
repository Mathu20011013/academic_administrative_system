// src/components/course/Assignment.jsx
// Purpose: Display assignment details and submission options for students

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Assignment.css';

const Assignment = ({ assignment, isInstructor, studentId }) => {
  const [submission, setSubmission] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if assignment is past due
  const isPastDue = () => {
    if (!assignment.due_date) return false;
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    return now > dueDate;
  };

  // Get appropriate icon based on file type
  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return 'fa-file-pdf';
    if (['doc', 'docx'].includes(extension)) return 'fa-file-word';
    if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel';
    if (['ppt', 'pptx'].includes(extension)) return 'fa-file-powerpoint';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'fa-file-image';
    if (['zip', 'rar'].includes(extension)) return 'fa-file-archive';
    
    return 'fa-file';
  };

  // Handle file download
  const handleDownload = async (fileUrl, fileName) => {
    try {
      if (!fileUrl) {
        throw new Error('File URL is missing');
      }
      
      // For Cloudinary URLs, we need special handling
      if (fileUrl.includes('cloudinary.com')) {
        console.log(`Attempting to download: ${fileName} from ${fileUrl}`);
        
        // For PDFs, use specialized handling
        if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
          // Transform the URL to get the raw file instead of the default viewer
          const baseUrl = fileUrl.split('/upload/')[0];
          const filePathPart = fileUrl.split('/upload/')[1];
          
          // Try the fl_attachment approach first (works in most browsers)
          const downloadUrl = `${baseUrl}/upload/fl_attachment/${filePathPart}`;
          console.log(`Using PDF download URL: ${downloadUrl}`);
          
          // Open in new tab with download flag
          window.open(downloadUrl, '_blank');
        } else {
          // For non-PDFs, try the fetch approach with fallback
          try {
            const response = await fetch(fileUrl);
            
            if (!response.ok) {
              throw new Error(`HTTP error: ${response.status}`);
            }
            
            const blob = await response.blob();
            
            // Create object URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }, 100);
          } catch (fetchError) {
            console.warn(`Fetch download failed: ${fetchError.message}, falling back to direct link`);
            // Fallback to direct link opening
            window.open(fileUrl, '_blank');
          }
        }
      } else {
        // For non-Cloudinary URLs, use the original method
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again later.');
    }
  };

  // Check if student has already submitted
  useEffect(() => {
    if (!isInstructor && studentId && assignment && assignment.assignment_id) {
      const fetchSubmission = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/submissions/student/${studentId}/assignment/${assignment.assignment_id}`);
          if (response.data) {
            setSubmission(response.data);
          }
        } catch (err) {
          console.log("No submission found or error:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchSubmission();
    }
  }, [assignment, studentId, isInstructor]);

  if (!assignment) {
    return <div className="assignment">Assignment details not available</div>;
  }

  return (
    <div className={`assignment ${isPastDue() ? 'past-due' : ''}`}>
      <h3>{assignment.title}</h3>
      
      <div className="assignment-description">
        {assignment.description}
      </div>
      
      <div className="assignment-details">
        <p><strong>Due Date:</strong> {formatDate(assignment.due_date)}</p>
        <p><strong>Max Score:</strong> {assignment.max_score || 100}</p>
        {isPastDue() && <p className="due-notice">This assignment is past due</p>}
      </div>

      {/* Assignment Files Section */}
      {assignment.files && assignment.files.length > 0 && (
        <div className="assignment-files">
          <h4>Assignment Files</h4>
          <div className="file-list">
            {assignment.files.map((file, index) => (
              <div key={file.material_id || index} className="file-item">
                <i className={`fas ${getFileIcon(file.material_title)}`}></i>
                <span className="file-name">{file.material_title || 'Unnamed file'}</span>
                <button 
                  className="download-btn"
                  onClick={() => handleDownload(file.material_url, file.material_title)}
                >
                  <i className="fas fa-download"></i> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student submission options */}
      {!isInstructor && (
        <div className="submission-section">
          {loading ? (
            <p>Loading submission details...</p>
          ) : submission ? (
            <div className="existing-submission">
              <h4>Your Submission</h4>
              <p>Submitted on: {new Date(submission.created_at).toLocaleString()}</p>
              
              {/* Show submitted files if any */}
              {submission.files && submission.files.length > 0 && (
                <div className="submission-files">
                  <h5>Submitted Files</h5>
                  <div className="file-list">
                    {submission.files.map((file, index) => (
                      <div key={index} className="file-item">
                        <i className={`fas ${getFileIcon(file.filename)}`}></i>
                        <span className="file-name">{file.filename}</span>
                        <button 
                          className="download-btn"
                          onClick={() => handleDownload(file.url, file.filename)}
                        >
                          <i className="fas fa-download"></i> Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Option to update submission if not past due */}
              {!isPastDue() && (
                <button 
                  className="submit-btn"
                  onClick={() => navigate(`/submit-assignment/${assignment.assignment_id}`)}
                >
                  Update Submission
                </button>
              )}
            </div>
          ) : (
            // No submission yet
            <div className="no-submission">
              {!isPastDue() && (
                <button 
                  className="submit-btn"
                  onClick={() => navigate(`/submit-assignment/${assignment.assignment_id}`)}
                >
                  Submit Assignment
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructor grading options */}
      {isInstructor && (
        <div className="instructor-options">
          <button 
            className="view-submissions-btn"
            onClick={() => navigate(`/instructor/assignments/${assignment.assignment_id}/submissions`)}
          >
            View Student Submissions
          </button>
        </div>
      )}
    </div>
  );
};

export default Assignment;
