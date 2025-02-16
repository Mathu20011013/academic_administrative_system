import React from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";

const MyCourses = () => {
  return (
    <Layout>
      <h2>My Courses</h2>
      <div className="course-list">
        <CourseCard title="Mobile Dev Mastery" instructor="Alex Brown" price="34.99" imgSrc="mobile.jpg" />
      </div>
    </Layout>
  );
};

export default MyCourses;
