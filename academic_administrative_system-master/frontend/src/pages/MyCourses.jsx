// src/pages/MyCourses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import { useNavigate } from 'react-router-dom'; // Updated import for react-router-dom v6

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = 1;  // You can replace this with dynamic user context or localStorage
  const navigate = useNavigate(); // Using useNavigate for navigation

  // Fetch enrolled courses
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/enrollments/my-courses/${studentId}`) // Backend API to get enrolled courses
      .then((response) => {
        setCourses(response.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
  }, [studentId]);

  // If courses are still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Navigate to Course Detail page when a course is clicked
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`); // Redirect to Course Detail page using navigate()
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h1>My Courses</h1>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="col">
                <CourseCard
                  title={course.course_name}
                  instructor={course.instructor_name}
                  imgSrc={course.image_url || 'https://via.placeholder.com/150'}
                  onClick={() => handleCourseClick(course.course_id)} // On click navigate to course detail
                />
              </div>
            ))
          ) : (
            <p>No courses enrolled yet.</p> // If no courses found
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyCourses;
