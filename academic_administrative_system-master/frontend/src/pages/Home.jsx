// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import axios from "axios";
import "../styles/Home.css"; // Import the CSS file

const Home = () => {
  const [courses, setCourses] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Fetch all courses from the backend
    axios
      .get("http://localhost:5000/api/courses")
      .then((response) => {
        setCourses(response.data.courses);  // Set courses state with fetched data
        setLoading(false);  // Stop loading once data is fetched
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);  // Stop loading even if there is an error
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;  // Show loading message or spinner
  }

  const handleEnroll = (courseId) => {
    const studentId = 1; // Replace with actual student ID (from logged-in user)

    axios
      .post("http://localhost:5000/api/student/enroll", { studentId, courseId })
      .then((response) => {
        alert("You have successfully enrolled in the course!");
      })
      .catch((error) => {
        console.error("Error enrolling in course:", error);
        alert("Failed to enroll in the course. Please try again.");
      });
  };

  return (
    <Layout>
      <div className="container mt-4 home-container">
        <h1>Available Courses</h1>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  price={course.price}
                  imgSrc={course.image_url || "https://via.placeholder.com/150"}  // Fallback image
                  onEnroll={() => handleEnroll(course.course_id)}  // Pass enroll handler
                />
              </div>
            ))
          ) : (
            <p>No courses available.</p> // Message when there are no courses
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
