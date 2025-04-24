import React, { useState, useEffect } from "react";
import Navbar from "../../components/instructor/in-navbar";
import HeroSection from "../../components/HeroSection";
import Footer from "../../components/Footer";

const InstructorLayout = ({ children }) => {
  const [user, setUser] = useState({
    userId: null,
    role: null
  });

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    // Log for debugging
    console.log("Layout loaded with auth data:", { token: !!token, userId, userRole });

    if (userId && userRole) {
      setUser({
        userId: userId,
        role: userRole
      });
    } else if (token) {
      // If we have a token but no userId/role, try to extract from token
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        console.log('Extracted token payload:', payload);
        
        // Store user data from token
        localStorage.setItem('userId', payload.id);
        localStorage.setItem('userRole', payload.role);
        
        setUser({
          userId: payload.id,
          role: payload.role
        });
      } catch (error) {
        console.error('Error extracting data from token:', error);
      }
    }
  }, []);

  return (
    <div>
      <HeroSection userId={user.userId} role={user.role} />
      <Navbar /> {/* Make sure Navbar is below HeroSection */}
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default InstructorLayout;