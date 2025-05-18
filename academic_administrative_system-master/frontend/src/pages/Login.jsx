import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { handleLogin } from '../utils/auth.js';
import '../styles/AuthPage.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      
      if (response.status === 200) {
        setMessage(response.data.message);
        setIsSuccess(true);
        
        // Use the new handleLogin function to store token and user data
        if (response.data.user) {
          handleLogin(response.data.user, response.data.token);
          
          // Still store the other fields as before
          localStorage.setItem('userEmail', response.data.user.email);
          localStorage.setItem('userName', response.data.user.username);
          console.log('Stored user data with role-specific storage');
        } else {
          // Extract from token as fallback
          try {
            const token = response.data.token;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            console.log('Token payload:', payload);
            
            // Create a user object with token payload data
            const userData = {
              user_id: payload.id,
              role: payload.role
            };
            
            // Store using our new function
            handleLogin(userData, token);
            
            // Store remaining fields as before
            localStorage.setItem('userEmail', payload.email);
            localStorage.setItem('userName', payload.username);
          } catch (error) {
            console.error('Error extracting data from token:', error);
          }
        }
        
        // Check if data was stored properly
        console.log('LocalStorage after login:', {
          token: localStorage.getItem('authToken') ? 'Set' : 'Not set',
          userId: localStorage.getItem('userId'),
          role: localStorage.getItem('userRole'),
          email: localStorage.getItem('userEmail')
        });
        
        setTimeout(() => {
          const userRole = localStorage.getItem('userRole');
          
          if (userRole === 'admin') {
            navigate('/adminCourses');
          } else if (userRole === 'instructor') {
            navigate('/instructorCourses');
          } else {
            // Default for students or any other role
            navigate('/home');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Login failed', error);
      setMessage(error.response?.data?.error || 'An error occurred during login');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-image">
          <img src="/assets/Signuppageimg.png" alt="Login" className="signup-img" />
        </div>
        <div className="auth-form-container">
          <img src="/assets/LOGO.png" alt="Company Logo" className="auth-logo" />
          <h2 className="auth-title">ERROR TO CLEVER</h2>
          <p className="auth-subtitle">Welcome back! Please log in to continue.</p>
          <form onSubmit={handleSubmit} className="form-elements">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-alt-text">or you can</p>
          <p>
            Need an Account? <a href="/signup">Sign Up</a>
          </p>
          {message && (
            <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;