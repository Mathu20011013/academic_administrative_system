import React from "react";
import Layout from "../components/Layout"; // Import the layout component
import Forum from "../components/C-Forum"; // Import the reusable Forum component
import "../styles/Forum.css"; // Import the styles

const ForumPage = () => {
  return (
    <Layout>
      <div className="forum-page-container">
        <Forum /> {/* Reuse the Forum component */}
      </div>
    </Layout>
  );
};

export default ForumPage;
