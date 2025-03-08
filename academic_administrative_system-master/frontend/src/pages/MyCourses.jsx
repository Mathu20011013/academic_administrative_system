import React from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";
import '../styles/Home.css'; // Reuse the same styles as Home page

const MyCourses = () => {
  const courses = [
    { id: 1, title: 'Web Dev for Beginners', instructor: 'Alex Brown', imgSrc: '/assets/Webdev.jpeg' },
    // ...other courses
  ];

  return (
    <Layout>
      <div className="container mt-4 home-container">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {courses.map((course, index) => (
            <div key={index} className="col">
              <CourseCard 
                title={course.title} 
                instructor={course.instructor} 
                imgSrc={course.imgSrc} 
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MyCourses;
