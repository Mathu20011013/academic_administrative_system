import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Forum from "../components/C-Forum";
import "../styles/Forum.css";
import { useNavigate } from "react-router-dom";

const ForumPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication first - same as MyCourses.jsx
    const token = localStorage.getItem("authToken") || 
                  localStorage.getItem("token") || 
                  localStorage.getItem("jwt");
    
    if (!token) {
      console.error("No token found - redirecting to login");
      navigate("/login");
      return;
    }

    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');
    console.log("[Debug] User ID in Forum page:", userId);
    
    if (!userId) {
      console.error("User ID not found - redirecting to login");
      navigate("/login");
      return;
    }

    setLoading(false);
  }, [navigate]);

  return (
    <Layout>
      <div className="forum-page-container">
        {loading ? (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <Forum />
        )}
      </div>
    </Layout>
  );
};

export default ForumPage;
