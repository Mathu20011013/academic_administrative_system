import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import axios from "axios";
import "../styles/Home.css";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/courses")
      .then((response) => {
        // Debugging: Check what data you receive
        console.log(response.data.courses); // Log the fetched courses
        setCourses(response.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleEnroll = (courseId) => {
    const studentId = 1;  // Replace with actual student ID (from logged-in user)

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
        
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  price={course.price}
                  imgSrc={course.image_url || "https://via.placeholder.com/150"}
                  description={course.description} // Ensure description is passed
                  buttonText="Enroll"
                />
              </div>
            ))
          ) : (
            <p>No courses available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
