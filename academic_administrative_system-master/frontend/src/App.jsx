// frontend/src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css'; // Import global styles 
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from "./pages/Home";
import MyCourses from "./pages/MyCourses";
import Forum from "./pages/Forum";
import Chatbot from "./pages/Chatbotpage";
import AdminHome from "./pages/admin/adminCourses";
import AdminStudents from "./pages/admin/adminstudents";
import AdminForum from "./pages/admin/adminforum";
import AdminInstructors from './pages/admin/adminInstructor';
import InstructorForum from './pages/instructor/instructorForum';
import InstructorCourses from './pages/instructor/instructorCourses';
import InstructorChatbot from './pages/instructor/instructorChatbot';
import AdminReports from './pages/admin/adminReports'; // Import the new AdminReports page

import CourseDetail from './components/CourseDetail';
import SubmissionForm from './components/SubmissionForm';
import SubmissionGrader from './components/instructor/SubmissionGrader';
import ContentCreator from './components/instructor/ContentCreator';
import ErrorBoundary from './components/ErrorBoundary';

import NotFound from './components/NotFound';
import Payment from './components/payment';

const SubmissionViewer = lazy(() => import('./components/instructor/SubmissionViewer'));

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
          
          {/* Admin routes */}
          <Route path="/adminCourses" element={<AdminHome />} />
          <Route path="/adminstudents" element={<AdminStudents />} />
          <Route path="/admininstructors" element={<AdminInstructors />} />
          <Route path="/adminforum" element={<AdminForum />} />
          <Route 
            path="/adminReports" 
            element={
              <ErrorBoundary>
                <AdminReports />
              </ErrorBoundary>
            } 
          /> {/* New route for AdminReports */}

          {/* Instructor routes */}
          <Route path="/instructorForum" element={<InstructorForum />} />
          <Route path="/instructorCourses" element={<InstructorCourses />} />
          <Route path="/instructorChatbot" element={<InstructorChatbot />} />

          {/* Course and assignment routes */}
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/course/:courseId/add-content" element={<ContentCreator />} />
          <Route path="/assignment/:assignmentId/submit" element={<SubmissionForm />} />
          <Route path="/assignment/:assignmentId/submissions" element={<SubmissionGrader />} />
          
          {/* Add route for instructor to view student submissions */}
          <Route 
            path="/instructor/assignment/:assignmentId/submissions" 
            element={<SubmissionViewer />} 
          />
          <Route 
            path="/assignment/:assignmentId/submissions" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <SubmissionViewer />
              </Suspense>
            } 
          />

          <Route path="/payment" element={<Payment />} />
          
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
