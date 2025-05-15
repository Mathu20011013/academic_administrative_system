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
        // Check all possible token keys
        const token = localStorage.getItem("authToken") || 
                      localStorage.getItem("token") || 
                      localStorage.getItem("jwt");
        
        console.log("[Debug] Token exists:", !!token);
        
        if (!token) {
          console.error("No token found - redirecting to login");
          setError("Please log in to view your courses");
          setLoading(false);
          navigate("/login");
          return;
        }

        console.log("[Debug] Token preview:", token.substring(0, 15) + "...");

        // Fetch instructor courses with detailed logging
        console.log("[Debug] Starting API call to fetch instructor courses");
        const response = await axios.get(
          "http://localhost:5000/api/courses/instructor/courses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("[Debug] API response received:", response.data);
        
        if (!response.data?.courses) {
          throw new Error("Invalid response structure from API");
        }

        // Add fallbacks for missing data
        const processedCourses = response.data.courses.map(course => ({
          ...course,
          instructor_name: course.instructor_name || "Not assigned",
          image_url: course.image_url || "https://via.placeholder.com/150",
          description: course.description || "No description available"
        }));

        console.log("[Debug] Processed courses:", processedCourses);
        setCourses(processedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        let errorMessage = "Failed to fetch courses";
        
        if (error.response) {
          console.error("[Debug] Server responded with:", error.response.status);
          errorMessage += ` (Status: ${error.response.status})`;
          if (error.response.data) {
            console.error("[Debug] Error details:", error.response.data);
            errorMessage += ` - ${error.response.data.message || "Unknown error"}`;
          }
        } else if (error.request) {
          console.error("[Debug] No response received:", error.request);
          errorMessage += " - Server not responding";
        }
        
        setError(errorMessage);
      } finally {
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
        <h1>Assigned Courses</h1>
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
