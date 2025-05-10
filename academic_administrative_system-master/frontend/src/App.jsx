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
import AdminHome from "./pages/admin/adminCourses"; // Corrected import path
import AdminStudents from "./pages/admin/adminstudents";
import AdminForum from "./pages/admin/adminforum";
import AdminInstructors from './pages/admin/adminInstructor';
import InstructorForum from './pages/instructor/instructorForum';
import InstructorCourses from './pages/instructor/instructorCourses';
import InstructorChatbot from './pages/instructor/instructorChatbot'; // Corrected import path

import CourseDetail from './components/CourseDetail';
import SubmissionForm from './components/SubmissionForm';
import SubmissionGrader from './components/instructor/SubmissionGrader';

import NotFound from './components/NotFound';


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
          <Route path="/adminCourses" element={<AdminHome />} />
          <Route path="/adminstudents" element={<AdminStudents />} />
          <Route path="/admininstructors" element={<AdminInstructors />} />
          <Route path="/adminforum" element={<AdminForum />} />

          <Route path="/instructorForum" element={<InstructorForum />} />
          <Route path="/instructorCourses" element={<InstructorCourses />} />
          <Route path="/instructorChatbot" element={<InstructorChatbot />} />

          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/assignment/:assignmentId/submit" element={<SubmissionForm />} />
          <Route path="/assignment/:assignmentId/submissions" element={<SubmissionGrader />} />
          {/* Catch-all route for 404 Not Found */}

          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/assignment/:assignmentId/submit" element={<SubmissionForm />} />
          <Route path="/assignment/:assignmentId/submissions" element={<SubmissionGrader />} />
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </div>
  );
};

export default App;
