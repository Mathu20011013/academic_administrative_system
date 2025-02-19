import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

const Layout = ({ children }) => {
  return (
    <div>
      <HeroSection />
      <Navbar /> {/* Make sure Navbar is below HeroSection */}
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
