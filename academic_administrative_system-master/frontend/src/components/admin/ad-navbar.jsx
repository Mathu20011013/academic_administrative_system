import React from "react";
import { NavLink } from "react-router-dom"; // Using NavLink for active tab styling
import "../../styles/Navbar.css"; // Importing CSS

const Navbar = () => {
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
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                to="/adminCourses"
              >
                Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                to="/adminInstructors"
              >
                Instructors
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                to="/adminstudents"
              >
                Students
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                to="/adminforum"
              >
                Forum
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/adminReports"
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                <i className="fas fa-chart-bar"></i> Reports
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
