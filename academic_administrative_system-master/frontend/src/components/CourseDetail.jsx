// src/components/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Layout from '../components/Layout'; // For student view
import InstructorLayout from '../components/instructor/in-Layout'; // For instructor view
import Announcement from './course/Announcement';
import Assignment from './course/Assignment';
import Material from './course/Material';
import ClassLink from './course/ClassLink';
import '../styles/CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [content, setContent] = useState([]);
  const [courseInfo, setCourseInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [userRole, setUserRole] = useState('student'); // Default to student
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole');
    if (role) {
      setUserRole(role);
    }

    const fetchCourseData = async () => {
  try {
    // Fetch course info
    const courseResponse = await api.get(`/courses/${courseId}`);
    console.log('Course response:', courseResponse.data); // Add this line
    setCourseInfo(courseResponse.data.course);
    
    // Fetch course content
    const contentResponse = await api.get(`/content/course/${courseId}`);
    console.log('Content response:', contentResponse.data); // Add this line too
    setContent(contentResponse.data.content || []);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching course data:', err); // Add error logging
    setError('Failed to load course content');
    setLoading(false);
  }
};

fetchCourseData();

  }, [courseId]);

const handleClose = () => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole === 'instructor') {
    navigate('/instructorCourses');
  } else if (userRole === 'admin') {
    navigate('/adminCourses'); // Changed to match your file structure
  } else {
    navigate('/mycourses'); // Changed to match your route
  }
};



  const filteredContent = activeTab === 'all' 
    ? content 
    : content.filter(item => item.content_type === activeTab);

  const renderContent = () => {
    if (loading) return <div className="loading">Loading course content...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredContent.length === 0) return <p>No content available in this section.</p>;

    return filteredContent.map(item => {
      switch (item.content_type) {
        case 'announcement':
          return <Announcement key={item.content_id} announcement={item} />;
        case 'assignment':
          return (
            <Assignment 
              key={item.content_id} 
              assignment={item.assignmentData || item} 
              isInstructor={userRole === 'instructor'}
              studentId={localStorage.getItem('userId')}
            />
          );
        case 'material':
          return <Material key={item.content_id} material={item} />;
        case 'class_link':
          return <ClassLink key={item.content_id} classLink={item.linkData || item} />;
        default:
          return null;
      }
    });
  };

  // Choose layout based on user role
  const SelectedLayout = userRole === 'instructor' ? InstructorLayout : Layout;

  return (
    <SelectedLayout>
      <div className="course-detail-container">
        <div className="course-header">
          <h1 className="course-title">{courseInfo.course_name || 'Course Details'}</h1>
          <p className="course-instructor">Instructor: {courseInfo.instructor_name || 'Not assigned'}</p>
        <button className="close-button" onClick={handleClose}>
  <span aria-hidden="true">&times;</span>
</button>

        </div>

        <div className="content-filters">
          <button 
            className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcement')}
          >
            Announcements
          </button>
          <button 
            className={`filter-btn ${activeTab === 'assignment' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignment')}
          >
            Assignments
          </button>
          <button 
            className={`filter-btn ${activeTab === 'material' ? 'active' : ''}`}
            onClick={() => setActiveTab('material')}
          >
            Materials
          </button>
          <button 
            className={`filter-btn ${activeTab === 'class_link' ? 'active' : ''}`}
            onClick={() => setActiveTab('class_link')}
          >
            Class Links
          </button>
        </div>

        {userRole === 'instructor' && (
          <button 
            className="add-content-btn"
            onClick={() => navigate(`/course/${courseId}/add-content`)}
          >
            Add Content
          </button>
        )}

        <div className="content-section">
          <div className="content-list">
            {renderContent()}
          </div>
        </div>
      </div>
    </SelectedLayout>
  );
};

export default CourseDetail;
