// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css'; // Import global styles 
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from "./pages/Home";
import MyCourses from "./pages/MyCourses";
import Forum from "./pages/Forum";
import Chatbot from "./pages/Chatbotpage"; // Corrected import
import AdminHome from "./pages/admin/adminhome"; // Import the AdminHome component
import AdminStudents from "./pages/admin/adminstudents"; // Import the AdminStudents component
import AdminTeachers from "./pages/admin/adminteachers"; // Import the AdminTeachers component
import AdminForum from "./pages/admin/adminforum"; // Import the AdminForum component

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Router>
        <Routes>
          {/* Redirect root URL "/" to "/login" */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main Pages inside Layout */}
          <Route path="/home" element={<Home />} />
          <Route path="/mycourses" element={<MyCourses />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/adminhome" element={<AdminHome />} /> {/* Add the AdminHome route */}
          <Route path="/adminstudents" element={<AdminStudents />} /> {/* Add the AdminStudents route */}
          <Route path="/adminteachers" element={<AdminTeachers />} /> {/* Add the AdminTeachers route */}
          <Route path="/adminforum" element={<AdminForum />} /> {/* Add the AdminForum route */}
        </Routes>
      </Router>
    </div>
  );
};

export default App;
