import React from "react";
import Layout from "../../components/instructor/in-Layout"; // Admin-specific layout component
import Forum from "../../components/C-Forum"; // Import the Forum component from components folder
import "../../styles/Forum.css";

const InstructorForum = () => {
  return (
    <Layout>
      <div className="admin-forum-container">
        <Forum /> {/* Reuse the Forum component */}
      </div>
    </Layout>
  );
};

export default InstructorForum;