import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Get token
        const token = localStorage.getItem("authToken") || 
                      localStorage.getItem("token") || 
                      localStorage.getItem("jwt");
        
        if (!token) {
          console.error("No token found - redirecting to login");
          setError("Please log in to view your courses");
          setLoading(false);
          navigate("/login");
          return;
        }

        // Get user ID from localStorage
        const userId = localStorage.getItem('userId');
        console.log("[Debug] User ID:", userId);
        
        if (!userId) {
          setError("User ID not found");
          setLoading(false);
          navigate("/login");
          return;
        }

        console.log("[Debug] Starting API call to fetch enrolled courses for user ID:", userId);
        const response = await axios.get(
          `http://localhost:5000/api/enrollments/my-courses/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("[Debug] API response received:", response.data);
        
        // Handle different response structures
        const coursesData = response.data.courses || [];
        
        // Add fallbacks for missing data
        const processedCourses = coursesData.map(course => ({
          ...course,
          instructor_name: course.instructor_name || "Not assigned",
          image_url: course.image_url || "https://via.placeholder.com/150",
          description: course.description || "No description available"
        }));

        console.log("[Debug] Processed courses:", processedCourses);
        setCourses(processedCourses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        let errorMessage = "Failed to fetch courses";
        
        if (error.response) {
          console.error("[Debug] Server responded with:", error.response.status);
          errorMessage += ` (Status: ${error.response.status})`;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleAccessCourse = (courseId) => {
    console.log("Accessing course:", courseId);
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        <h2>My Enrolled Courses</h2>
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  imgSrc={course.image_url}
                  buttonText="Access Course"
                  course_id={course.course_id}
                  onClick={() => handleAccessCourse(course.course_id)}
                />
              </div>
            ))
          ) : (
            <div className="col-12">
              <p>No courses enrolled yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyCourses;
