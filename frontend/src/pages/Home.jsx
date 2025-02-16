import React from "react";
import Layout from "../components/Layout";
import CourseCard from "../components/CourseCard";

const Home = () => {
  return (
    <Layout>
      <div className="course-list">
        <CourseCard title="Web Dev for Beginners" instructor="John Doe" price="24.99" imgSrc="webdev.jpg" />
        <CourseCard title="UI Design" instructor="Jane Smith" price="19.99" imgSrc="ui.jpg" />
      </div>
    </Layout>
  );
};

export default Home;
