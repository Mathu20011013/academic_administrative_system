import React, { useState, useEffect, useRef } from "react";
import ProfileModal from "../pages/ProfileModal";
import "../styles/HeroSection.css";
import logo from "../assets/LOGO.png";
import { FaUser, FaBell, FaShoppingCart, FaSearch } from "react-icons/fa";
import axios from "axios";

const HeroSection = ({ role, userId }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Search states
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Ref for search dropdown
  const searchRef = useRef(null);

  // Handle profile icon click
  const handleProfileClick = () => {
    const storedUserId = userId || localStorage.getItem("userId");
    const storedRole = role || localStorage.getItem("userRole");
    
    if (storedUserId && storedRole) {
      setShowProfileModal(true);
    } else {
      console.error("No user ID or role available");
    }
  };

  // Close profile modal
  const closeProfileModal = () => {
    console.log("closeProfileModal called"); // Debug log
    setShowProfileModal(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 2) {
      searchCourses(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Search courses API call
  const searchCourses = async (searchQuery) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/search/courses?query=${searchQuery}`);
      setSearchResults(response.data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  // Handle search result click
  const handleResultClick = (courseId) => {
    // Don't redirect - just scroll to the course on the current page
    setShowResults(false);
    setQuery("");
    
    // Small delay to ensure the dropdown closes first
    setTimeout(() => {
      // Find the course element
      const courseElement = document.getElementById(`course-${courseId}`);
      
      if (courseElement) {
        // Scroll to the element
        courseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        courseElement.classList.add('highlighted-course');
        
        // Remove highlight after animation completes
        setTimeout(() => {
          courseElement.classList.remove('highlighted-course');
        }, 2000);
      } else {
        // If the course isn't on the current page, we can try to fetch it
        // or show a message that the course isn't available on this page
        console.log("Course not found on current page");
      }
    }, 100);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hero-container">
      <div className="hero-top">
        <div className="hero-logo">
          <img src={logo} alt="E2C Logo" />
          <h2>E2C</h2>
        </div>
        
        {/* Search bar with dropdown */}
        <div className="hero-search" ref={searchRef}>
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={query}
            onChange={handleSearchChange}
          />
          <button>
            <FaSearch />
          </button>
          
          {/* Simple dropdown for search results */}
          {showResults && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(course => (
                <div 
                  key={course.course_id} 
                  className="search-item"
                  onClick={() => handleResultClick(course.course_id)}
                >
                  {course.course_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="hero-icons">
          <div className="notification-icon">
            <FaBell />
          </div>

          
          <div className="profile-icon" onClick={handleProfileClick}>
            <FaUser />
          </div>
        </div>
      </div>
      
      <div className="hero-background">
        <h1>Become professionals and ready to join the world.</h1>
        <p>Learn from the best instructors and gain the skills you need to succeed in your career.</p>
      </div>
      
      {showProfileModal && (
        <ProfileModal
          userId={userId || localStorage.getItem("userId")}
          role={role || localStorage.getItem("userRole")}
          closeModal={closeProfileModal} // Pass the close function correctly
        />
      )}
    </div>
  );
};

export default HeroSection;
