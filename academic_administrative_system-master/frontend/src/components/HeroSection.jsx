import React, { useState, useEffect } from "react";
import ProfileModal from "../pages/ProfileModal"; 
import "../styles/HeroSection.css"; 
import logo from "../assets/LOGO.png"; 
import { FaUser } from "react-icons/fa"; // Import React Icons

const HeroSection = ({ role, userId }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Debug log when props change
  useEffect(() => {
    console.log("HeroSection received props:", { userId, role });
  }, [userId, role]);

  // Function to handle profile icon click
  const handleProfileClick = () => {
    // Get userId and role from localStorage if not provided as props
    const storedUserId = userId || localStorage.getItem('userId');
    const storedRole = role || localStorage.getItem('userRole');
    
    console.log("Profile clicked, using:", { 
      userId: storedUserId, 
      role: storedRole 
    });
    
    if (storedUserId && storedRole) {
      setShowProfileModal(true);
    } else {
      console.error("No user ID or role available");
      // Could redirect to login here
      // window.location.href = '/login';
    }
  };

  // Function to close the modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  return (
    <div className="hero-container">
      {/* Top Row: Logo, Name, Search Bar, Icons */}
      <div className="hero-top">
        <div className="hero-logo">
          <img src={logo} alt="Error to Clever" />
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
          {/* Conditionally render icons based on role */}
          {(role === "student" || localStorage.getItem('userRole') === 'student') && 
            <span>🛒</span>
          } {/* Cart Icon for Student */}
          <span>🔔</span> {/* Notification Icon */}
          {/* Updated profile icon with better styling */}
          <span 
            onClick={handleProfileClick} 
            className="profile-icon"
            title="Your Profile"
          >
            <FaUser />
          </span>
        </div>
      </div>

      {/* Background Image and Text Section */}
      <div className="hero-background">
        <h1>Learn something new every day.</h1>
        <p>Become professionals and ready to join the world.</p>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          userId={userId || localStorage.getItem('userId')} 
          role={role || localStorage.getItem('userRole')} 
          closeModal={closeProfileModal} 
        />
      )}
    </div>
  );
};

export default HeroSection;