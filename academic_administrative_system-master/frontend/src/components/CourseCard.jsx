import React from "react";
import "../styles/CourseCard.css"; // Import the CSS file
import axios from "axios"; // Import axios for API calls

const CourseCard = ({
  title,
  instructor,
  price,
  imgSrc,
  description,
  buttonText,
  onClick,  // Ensure onClick is passed as a prop from the parent component
}) => {
  // Debugging props to ensure they are passed correctly
  console.log("CourseCard props:", {
    title,
    instructor,
    price,
    imgSrc,
    description,
  });

  const defaultImg = "https://via.placeholder.com/150";
  const courseImg = imgSrc ? imgSrc : defaultImg;
  
  // Function to handle the "Enroll" button click and enroll the student
  const handleEnroll = async () => {
    try {
      // Make API call to enroll the student in the course
      const response = await axios.post("http://localhost:5000/api/enroll", {
        student_id: 1,  // Example student ID, replace with actual data
        course_id: 1,   // Example course ID, replace with actual data
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

  // Define the default onClick if not passed as a prop
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log("Course card clicked, but no handler defined.");
    }
  };

  return (
    <div className="card course-card">
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
          <button className="btn btn-secondary" onClick={handleClick}>
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
