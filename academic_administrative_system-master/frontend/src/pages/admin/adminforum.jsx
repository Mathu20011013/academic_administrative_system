import React from "react";
import Layout from "../../components/admin/ad-Layout"; // Admin-specific layout component
import Forum from "../../components/C-Forum"; // Import the Forum component from components folder
import "../../styles/Forum.css";

const AdminForum = () => {
  return (
    <Layout>
      <div className="admin-forum-container">
        <Forum /> {/* Reuse the Forum component */}
      </div>
    </Layout>
  );
};

export default AdminForum;