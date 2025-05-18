import React from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Add useNavigate
import "../styles/Navbar.css";
import { handleLogout } from "../utils/auth.js"; // Import the logout function

const Navbar = () => {
  const navigate = useNavigate();

  const logoutUser = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">E2C</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Home Tab */}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                to="/home"
              >
                Home
              </NavLink>
            </li>
            {/* My Courses Tab */}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                to="/mycourses"
              >
                My Courses
              </NavLink>
            </li>
            {/* Forum Tab */}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                to="/forum"
              >
                Forum
              </NavLink>
            </li>
            {/* Chatbot Tab */}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                to="/chatbot"
              >
                Chatbot
              </NavLink>
            </li>
            
            {/* Logout Button */}
            
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
