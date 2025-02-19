import React from "react";
import "../styles/Footer.css";  // ✅ Updated path

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <img src="/assets/LOGO.png" alt="Academy Logo" className="footer-logo" />
          <h1>
            ERROR TO <br />
            CLEVER
          </h1>
        </div>
        <div className="footer-links">
          <a href="#">Web Programming</a>
          <a href="#">UI/UX Design</a>
          <a href="#">Digital Marketing</a>
          <a href="#">Data Science</a>
          <a href="#">Machine Learning</a>
          <a href="#">Cyber Security</a>
          <a href="#">Cloud Computing</a>
          <a href="#">DevOps</a>
          <a href="#">Blockchain</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright © MyCourses 2024. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
