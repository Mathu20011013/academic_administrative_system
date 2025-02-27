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

// Add more API functions here for other routes like /home, /mycourses, etc.

export default api;
