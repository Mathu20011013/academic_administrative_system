import React from "react";
import Layout from "../../components/instructor/in-Layout"; // Admin-specific layout component


const InstructorCourses = () => {
  return (
    <Layout>
      <div className="instructor-courses-container">
        <courses /> {/* Reuse the Forum component */}
      </div>
    </Layout>
  );
};

export default InstructorCourses;