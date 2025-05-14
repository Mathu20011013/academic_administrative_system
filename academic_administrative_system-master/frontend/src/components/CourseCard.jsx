import React from "react";
import "../styles/CourseCard.css"; // Import the CSS file
import axios from "axios"; // Import axios for API calls
import { useNavigate } from 'react-router-dom';

const CourseCard = ({
  title,
  instructor,
  price,
  imgSrc,
  description,
  buttonText,
  onClick,
  course_id  // Added course_id prop
}) => {
  // Initialize the navigate function
  const navigate = useNavigate();
  
  // Debugging props to ensure they are passed correctly
  console.log("CourseCard props:", {
    title,
    instructor,
    price,
    imgSrc,
    description,
    course_id
  });

  const defaultImg = "https://via.placeholder.com/150";
  const courseImg = imgSrc ? imgSrc : defaultImg;
  
  // Function to handle the "Enroll" button click and enroll the student
  const handleEnroll = async (e) => {
    e.stopPropagation();
    try {
      // Get the user ID from localStorage
      const student_id = localStorage.getItem('userId');
      
      if (!student_id) {
        alert("Please log in to enroll in courses.");
        return;
      }
      
      // Navigate to payment page instead of directly enrolling
      navigate('/payment', { 
        state: { 
          course: {
            course_id: parseInt(course_id),
            title,
            instructor,
            price,
            description
          },
          student_id: parseInt(student_id)
        } 
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      const errorMessage = error.response?.data?.message || "Failed to enroll in the course";
      alert(errorMessage);
    }
  };

  // Define the default onClick if not passed as a prop
  const handleClick = () => {
    if (onClick) {
      onClick(course_id); // Pass course_id to the onClick handler
    } else {
      console.log("Course card clicked, but no handler defined.");
    }
  };

  return (
    <div className="card course-card" onClick={handleClick}>
      {/* Display either the course image or a placeholder */}
      <img className="card-img-top course-card-img" src={courseImg} alt={title} />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{instructor}</p>

        {/* Conditionally render description and price for Home Page */}
        {buttonText === "Enroll" && (
          <>
            <p className="card-text">{description}</p> {/* Description for Home */}
            <p className="card-text">Price: ${price}</p> {/* Price for Home */}
          </>
        )}

        {/* Conditionally render button based on the buttonText prop */}
        {buttonText === "Enroll" ? (
          <button className="btn btn-primary" onClick={handleEnroll}>
            Enroll
          </button>
        ) : (
          <button className="btn btn-primary" onClick={(e) => {
            e.stopPropagation(); // Prevent double navigation
            handleClick();
          }}>
            Access Course {/* This will be used in My Courses page */}
          </button>
        )}
      </div>
      <div className="card-footer">
        {imgSrc ? null : (
          <small className="text-muted">No image available for this course</small>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
