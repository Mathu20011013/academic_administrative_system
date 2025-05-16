// src/components/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
        console.log('Course response:', courseResponse.data);
        setCourseInfo(courseResponse.data.course);
        
        // Fetch course content
        const contentResponse = await api.get(`/content/course/${courseId}`);
        console.log('Content response:', contentResponse.data);
        setContent(contentResponse.data.content || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course content');
        setLoading(false);
      }
    };

    fetchCourseData();
    
    // Check if we need to refresh data (coming back from content creation)
    if (location.state?.refresh) {
      fetchCourseData();
    }
  }, [courseId, location.state]);

  const handleClose = () => {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'instructor') {
      navigate('/instructorCourses');
    } else if (userRole === 'admin') {
      navigate('/adminCourses');
    } else {
      navigate('/mycourses');
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/content/${contentId}`);
      // Remove the deleted content from state
      setContent(prevContent => prevContent.filter(item => item.content_id !== contentId));
    } catch (err) {
      console.error('Error deleting content:', err);
      setError('Failed to delete content. Please try again.');
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
      // Create the content element based on type
      let contentElement;
      switch (item.content_type) {
        case 'announcement':
          contentElement = <Announcement announcement={item} />;
          break;
        case 'assignment':
          contentElement = (
            <Assignment 
              assignment={{
                ...item.assignmentData,
                content_id: item.content_id,
                title: item.title,
                description: item.description,
                files: item.files  // Pass files to the Assignment component
              }} 
              isInstructor={userRole === 'instructor'}
              studentId={userRole === 'student' ? localStorage.getItem('userId') : null}
            />
          );
          break;
        case 'material':
          contentElement = <Material material={item} />;
          break;
        case 'class_link':
          contentElement = <ClassLink classLink={item} />;
          break;
        default:
          return null;
      }

      // Return the content wrapped with delete button for instructors
      return (
        <div key={item.content_id} className="content-item-container">
          {contentElement}
          {userRole === 'instructor' && (
            <button 
              className="delete-content-btn" 
              onClick={() => handleDeleteContent(item.content_id)}
              title="Delete this content"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
      );
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
