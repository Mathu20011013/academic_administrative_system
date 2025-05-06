import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/instructor/in-Layout"; // Instructor layout component
import CourseCard from "../../components/CourseCard"; // Reusing the CourseCard component for the instructor's courses
import { useNavigate } from "react-router-dom";

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Retrieve token from localStorage
  const token = localStorage.getItem("authToken");  // Using the token saved after login

  useEffect(() => {
    if (!token) {
      console.log("No token found, please login again.");
      // Optionally redirect to login page
      navigate("/login");
      return;
    }

    // Fetch the courses assigned to the logged-in instructor
    axios
      .get("http://localhost:5000/api/courses/instructor/courses", {
        headers: {
          Authorization: `Bearer ${token}`,  // Passing the token in Authorization header
        },
      })
      .then((response) => {
        setCourses(response.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });
  }, [token, navigate]);  // Added token and navigate in the dependency array

  const handleAccessCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <Layout>
      <div className="container mt-4 home-container">
        <h1>Assigned Courses</h1>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {loading ? (
            <p>Loading...</p>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  price={course.price}
                  imgSrc={course.image_url || "https://via.placeholder.com/150"}
                  description={course.description} // Ensure description is passed
                  buttonText="Access Course"
                  onClick={() => handleAccessCourse(course.course_id)} // Navigate to course details
                />
              </div>
            ))
          ) : (
            <p>No courses assigned yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InstructorCourses;
