// src/components/CourseCard.jsx
import React from "react";
import "../styles/CourseCard.css"; // Import the CSS file
import axios from 'axios';  // Import axios for API calls

const CourseCard = ({ title, instructor, price, imgSrc, courseId, studentId, buttonText, onClick }) => {
  // Fallback image when the URL is invalid or missing
  const defaultImg = "https://via.placeholder.com/150";  // Placeholder image URL

  // Check if the imgSrc is available, else use the fallback image
  const courseImg = imgSrc ? imgSrc : defaultImg;

  // Function to handle the "Buy" button click and enroll the student
  const handleEnroll = async () => {
    try {
      // Make API call to enroll the student in the course
      const response = await axios.post('http://localhost:5000/api/enroll', {
        student_id: studentId,
        course_id: courseId
      });

      // Handle success
      if (response.status === 200) {
        alert("Enrollment successful!");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in the course. Please try again.");
    }
  };

  return (
    <div className="card course-card">
      {/* Display either the course image or a placeholder */}
      <img className="card-img-top course-card-img" src={courseImg} alt={title} />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{instructor}</p>
        <p className="card-text">{price}</p>
        {/* Conditionally render button based on the buttonText prop */}
        {buttonText ? (
          <button className="btn btn-primary" onClick={handleEnroll}>
            {buttonText} {/* "Enroll" button text */}
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={onClick}> 
            View Course {/* This will be used in My Courses or Instructor pages */}
          </button>
        )}
      </div>
      <div className="card-footer">
        {/* Display a fallback message if the image URL is invalid */}
        {imgSrc ? null : <small className="text-muted">No image available for this course</small>}
      </div>
    </div>
  );
};

export default CourseCard;
