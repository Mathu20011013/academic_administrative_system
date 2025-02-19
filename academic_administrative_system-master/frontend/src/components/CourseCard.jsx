import React from "react";

const CourseCard = ({ title, instructor, price, imgSrc }) => {
  return (
    <div className="course-card">
      <img src={imgSrc} alt={title} />
      <h3>{title}</h3>
      <p>{instructor}</p>
      <p>${price}</p>
    </div>
  );
};

export default CourseCard;
