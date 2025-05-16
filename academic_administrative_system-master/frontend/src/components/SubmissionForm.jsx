// src/components/SubmissionForm.jsx
// Purpose: Form for students to submit assignments

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/SubmissionForm.css";
import Layout from "../components/Layout"; // Import Layout component

const SubmissionForm = () => {
  const { assignmentId } = useParams(); // Get assignment ID from URL
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);

  console.log("Assignment ID from URL:", assignmentId); // Debug log
  
  useEffect(() => {
    // Get student ID from local storage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setStudentId(user.id || user.student_id);
    
    // Fetch assignment details
    const fetchAssignment = async () => {
      try {
        console.log("Fetching assignment with ID:", assignmentId);
        const response = await api.get(`/api/assignment/${assignmentId}`);
        console.log("API response:", response.data);
        
        // Set the assignment directly from response data
        setAssignment(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assignment:", err);
        setError("Failed to load assignment details");
        setLoading(false);
      }
    };
    
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("assignment_id", assignmentId);
      formData.append("student_id", studentId);
      formData.append("file", file);

      await api.post("/submission/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Redirect back to course page
      navigate(`/course/${assignment.course_id}`);
    } catch (err) {
      setError(err.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="container mt-4">Loading assignment details...</div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="container mt-4 error-message">{error}</div>
      </Layout>
    );
  if (!assignment)
    return (
      <Layout>
        <div className="container mt-4">Assignment not found</div>
      </Layout>
    );

  // Check if assignment is past due
  const isPastDue = new Date(assignment.due_date) < new Date();

  return (
    <Layout>
      <div className="container mt-4">
        <div className="card submission-form-card">
          <div className="card-body">
            <h1 className="card-title">Submit Assignment</h1>

            <div className="assignment-details mt-4">
              <h3>{assignment.title}</h3>
              <p>{assignment.description}</p>
              <p className="due-date">
                <strong>Due Date:</strong>{" "}
                {new Date(assignment.due_date).toLocaleString()}
              </p>
              <p>
                <strong>Max Score:</strong> {assignment.max_score} points
              </p>
            </div>

            <div className="mt-4">
              <h5>Upload Your Submission</h5>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                  className="d-none"
                />
                <label
                  htmlFor="fileUpload"
                  className="btn btn-primary file-upload-btn"
                >
                  Choose File
                </label>
                <span className="ml-2 file-name">
                  {file ? file.name : "No file chosen"}
                </span>
              </div>
            </div>

            <div className="mt-4 button-group">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting || !file}
              >
                {submitting ? "Submitting..." : "Submit Assignment"}
              </button>

              <button
                onClick={() => {
                  // Log what we're trying to navigate to
                  console.log("Assignment object for navigation:", assignment);
                  
                  // Make sure we have a course ID
                  if (assignment && assignment.course_id) {
                    console.log("Navigating back to course:", assignment.course_id);
                    navigate(`/course/${assignment.course_id}`);
                  } else {
                    // Fallback to going back in history if no course ID
                    console.log("No course ID found, navigating back in history");
                    navigate(-1);
                  }
                }}
                className="btn btn-secondary"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubmissionForm;
