// frontend/src/api.js
import axios from 'axios';

// Create an axios instance with the base URL of your backend API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL
});

// Function to login
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;  // Return the response data which should contain the token and message
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error logging in';  // More robust error handling
    throw new Error(errorMessage);  // Throw an error with the message from the backend or default message
  }
};

// Function to signup
export const signup = async (username, email, password) => {
  try {
    const response = await api.post('/auth/signup', { username, email, password });
    return response.data;  // Return the response data
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error signing up';  // More robust error handling
    throw new Error(errorMessage);  // Throw an error with the message from the backend or default message
  }
};

// Course functions
export const getCourseContent = async (courseId) => {
  try {
    const response = await api.get(`/content/course/${courseId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error fetching course content';
    throw new Error(errorMessage);
  }
};

export const createAssignment = async (assignmentData) => {
  try {
    const response = await api.post('/assignment/create', assignmentData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error creating assignment';
    throw new Error(errorMessage);
  }
};

export const submitAssignment = async (submissionData, file) => {
  try {
    const formData = new FormData();
    formData.append('assignment_id', submissionData.assignment_id);
    formData.append('student_id', submissionData.student_id);
    formData.append('file', file);
    
    const response = await api.post('/submission/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error submitting assignment';
    throw new Error(errorMessage);
  }
};

export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await api.put(`/submission/${submissionId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error grading submission';
    throw new Error(errorMessage);
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    const response = await api.post('/content/create', {
      ...announcementData,
      content_type: 'announcement'
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error creating announcement';
    throw new Error(errorMessage);
  }
};

export const getStudentCourses = async (studentId) => {
  try {
    const response = await api.get(`/enrollments/my-courses/${studentId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error fetching student courses';
    throw new Error(errorMessage);
  }
};

export const getInstructorCourses = async (instructorId) => {
  try {
    const response = await api.get(`/instructor/courses/${instructorId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error fetching instructor courses';
    throw new Error(errorMessage);
  }
};

// Add more API functions here for other routes as needed

// Add more API functions here for other routes like /home, /mycourses, etc.

export default api;
