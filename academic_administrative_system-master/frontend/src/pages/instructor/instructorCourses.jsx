import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/instructor/in-Layout";
import CourseCard from "../../components/CourseCard";
import { useNavigate } from "react-router-dom";

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Get authentication token
        const token = localStorage.getItem("token") || 
                      localStorage.getItem("authToken") || 
                      localStorage.getItem("jwt");
        
        // Debug logs              
        console.log("[Debug] Token exists:", !!token);
        console.log("[Debug] User ID:", localStorage.getItem('userId'));
        
        // Make API request - check this URL matches your backend route
        const response = await axios.get(
          "http://localhost:5000/api/courses/instructor/courses",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log("[Debug] API Response:", response.data);
        setCourses(response.data.courses || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        console.log("[Debug] Status code:", error.response?.status);
        console.log("[Debug] Error data:", error.response?.data);
        setError("Failed to load courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleAccessCourse = (courseId) => {
    console.log(`[Debug] Accessing course ${courseId}`);
    navigate(`/course/${courseId}`);
  };

  return (
    <Layout>
      <div className="container mt-4 home-container">
    
        {error && (
          <div className="alert alert-danger">
            {error}
            <button 
              className="btn btn-link" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}
        
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {loading ? (
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  price={course.price?.toFixed(2) || "Free"}
                  imgSrc={course.image_url}
                  description={course.description}
                  buttonText="Access Course"
                  course_id={course.course_id}
                  onClick={handleAccessCourse}
                />
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                No courses assigned yet. Contact your administrator.
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InstructorCourses;
