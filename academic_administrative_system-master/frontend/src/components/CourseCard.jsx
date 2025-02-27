// src/components/CourseCard.jsx
import React from "react";
import "../styles/CourseCard.css"; // Import the CSS file

const CourseCard = ({ title, instructor, price, imgSrc }) => {
  return (
    <div className="card course-card">
      <img className="card-img-top course-card-img" src={imgSrc} alt={title} />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{instructor}</p>
        <p className="card-text">${price}</p>
      </div>
      <div className="card-footer">
        <small className="text-muted">Last updated 3 mins ago</small>
      </div>
    </div>
  );
};

export default CourseCard;
