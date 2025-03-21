import React from "react";
import Layout from "../../components/admin/ad-Layout"; // Adjust the import path as needed

const AdminHome = () => {
  return (
    <Layout>
      <div className="admin-home-container">
        <h2>Admin Home</h2>
        <p>Welcome to the admin dashboard.</p>
        {/* Add more admin-specific content here */}
      </div>
    </Layout>
  );
};

export default AdminHome;