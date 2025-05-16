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
  
  // Handle file download directly
  const handleDownload = async (fileUrl, fileName) => {
    try {
        // For Cloudinary URLs, we need special handling
        if (fileUrl && fileUrl.includes('cloudinary.com')) {
            // For PDFs, get the raw file format from cloudinary
            if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                // Transform the URL to get the raw file instead of the default viewer
                const baseUrl = fileUrl.split('/upload/')[0];
                const filePathPart = fileUrl.split('/upload/')[1];
                const downloadUrl = `${baseUrl}/upload/fl_attachment/${filePathPart}`;
                
                // Open in new tab with download flag
                window.open(downloadUrl, '_blank');
            } else {
                // For non-PDFs, use fetch API approach for better control
                const response = await fetch(fileUrl);
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

      {/* Display any attached files */}
      {assignment.files && assignment.files.length > 0 && (
        <div className="assignment-files">
          <h4>Attached Files:</h4>
          {assignment.files.map((file, index) => (
            <div key={file.file_id || index} className="file-item">
              <i className={`fas ${getFileIcon(file.file_name)}`}></i>
              <span className="file-name">{file.file_name || 'Unnamed file'}</span>
              <button 
                className="download-btn"
                onClick={() => handleDownload(file.file_url, file.file_name)}
              >
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Assignment submission form would go here */}
    </div>
  );
};

export default Assignment;
