import React from "react";
import Navbar from "./ad-navbar";
import HeroSection from "./ad-HeroSection";
import Footer from "../../components/Footer";

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
