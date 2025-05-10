import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = 1; // Replace with actual logged-in user ID
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/enrollments/my-courses/${studentId}`)
      .then((response) => {
        setCourses(response.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });
  }, [studentId]);

  // Define onClick handler for accessing course details
  const handleAccessCourse = (courseId) => {
    console.log("Accessing course:", courseId);
    navigate(`/course/${courseId}`); // Navigate to the course details page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="container mt-4">
        
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  imgSrc={course.image_url || "https://via.placeholder.com/150"}
                  buttonText="Access Course"
                  course_id={course.course_id} // Pass course_id as a prop
                  onClick={handleAccessCourse} // Pass the handler function directly
                />
              </div>
            ))
          ) : (
            <p>No courses enrolled yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyCourses;
