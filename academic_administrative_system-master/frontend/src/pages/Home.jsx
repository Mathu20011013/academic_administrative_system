import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import axios from "axios";
import "../styles/Home.css";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedCourse, setHighlightedCourse] = useState(null);

  useEffect(() => {
    // Check if there's a highlight parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const highlightCourseId = urlParams.get('highlight');
    
    if (highlightCourseId) {
      setHighlightedCourse(parseInt(highlightCourseId));
    }

    axios
      .get("http://localhost:5000/api/courses")
      .then((response) => {
        // Debugging: Check what data you receive
        console.log(response.data.courses); // Log the fetched courses
        setCourses(response.data.courses);
        setLoading(false);
        
        // If there's a highlighted course, scroll to it
        if (highlightCourseId) {
          setTimeout(() => {
            const element = document.getElementById(`course-${highlightCourseId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mt-4 home-container">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div 
                key={course.course_id} 
                id={`course-${course.course_id}`}
                className={`col ${highlightedCourse === course.course_id ? 'highlighted-course' : ''}`}
              >
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  price={course.price}
                  imgSrc={course.image_url || "https://via.placeholder.com/150"}
                  description={course.description} // Ensure description is passed
                  buttonText="Enroll"
                  course_id={course.course_id} 
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
