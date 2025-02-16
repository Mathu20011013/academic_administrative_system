import React from "react";
import "../styles/HeroSection.css"; // Importing CSS
import logo from "../assets/LOGO.png"; // Update with the correct path

const HeroSection = () => {
  return (
    <div className="hero-container">
      {/* Top Row: Logo, Name, Search Bar, Icons */}
      <div className="hero-top">
        <div className="hero-logo">
          <img src="/assets/LOGO.png" alt="Error to Clever" />
          <h2>ERROR TO CLEVER</h2>
        </div>
        <div className="hero-search">
          <input type="text" placeholder="Search for course" />
          <button>🔍</button>
        </div>
        <div className="hero-icons">
          <span>🛒</span> {/* Cart Icon */}
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
