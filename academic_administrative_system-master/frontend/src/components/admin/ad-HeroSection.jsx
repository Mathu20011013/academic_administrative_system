import React from "react";
import "../../styles/HeroSection.css"; // Importing CSS
import logo from "../../assets/LOGO.png"; // Update with the correct path

const HeroSection = () => {
  return (
    <div className="hero-container">
      {/* Top Row: Logo, Name, Search Bar, Icons */}
      <div className="hero-top">
        <div className="hero-logo">
          <img src="/assets/LOGO.png" alt="Error to Clever" />
          <h2>ERROR TO CLEVER</h2>
        </div>

        {/* Bootstrap Search Bar */}
        <nav className="navbar navbar-light bg-light">
          <form className="form-inline d-flex align-items-center">
            <input
              className="form-control search-input"
              type="search"
              placeholder="Search for course"
              aria-label="Search"
            />
            <button className="btn btn-outline-success search-button" type="submit">
              <i className="fas fa-search"></i> Search
            </button>
          </form>
        </nav>

        <div className="hero-icons">
          
          <span>🔔</span> {/* Notification Icon */}
          <span>👤</span> {/* Profile Icon */}
        </div>
      </div>

      {/* Background Image and Text Section */}
      <div className="hero-background">
        <h1>Learn something new every day.</h1>
        <p>Become professionals and ready to join the world.</p>
      </div>
    </div>
  );
};

export default HeroSection;
