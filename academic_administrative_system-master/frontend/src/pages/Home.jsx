import React from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import "../styles/Home.css"; // Import the CSS file

const Home = () => {
  // Example data for the courses
  const courses = [
    { title: "Web Dev for Beginners", instructor: "John Doe", price: "24.99", imgSrc: "/assets/Webdev.jpeg" },
    { title: "UI Design", instructor: "Jane Smith", price: "19.99", imgSrc: "/assets/Ui.jpeg" },
    { title: "Advanced React", instructor: "Alex Johnson", price: "29.99", imgSrc: "/assets/React.jpeg" },
    { title: "Ai", instructor: "Emily White", price: "19.99", imgSrc: "/assets/Ai.jpeg" },
  ];

  return (
    <Layout>
      <div className="container mt-4 home-container">
        {/* Row to hold the course cards */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {/* Dynamically rendering CourseCard components */}
          {courses.map((course, index) => (
            <div key={index} className="col">
              <CourseCard
                title={course.title}
                instructor={course.instructor}
                price={course.price}
                imgSrc={course.imgSrc}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
