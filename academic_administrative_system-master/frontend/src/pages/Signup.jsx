import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); // New state to track success or error
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false); // Set to false for error
      setIsLoading(false);
      return;
    }

    try {
      // Include username in the request
      const response = await api.post('/signup', { 
        username, 
        email, 
        password 
      });
      
      console.log(response); // Log the entire response
      
      if (response.status === 201) {
        console.log(response.data); // Log the response data
        setMessage(response.data.message); // Set success message
        setIsSuccess(true); // Set to true for success
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } catch (error) {
      console.error("Signup error:", error); // Log the error to the console
      
      // Handle error response data if available
      if (error.response && error.response.data) {
        setMessage(error.response.data.error || "An error occurred during signup");
        console.error("Error details:", error.response.data);
      } else {
        setMessage(error.message || "An error occurred during signup");
      }
      setIsSuccess(false); // Set to false for error
    } finally {
      setIsLoading(false);
    }
  };

  // UI
  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Image Section */}
        <div className="auth-image">
          <img src="/assets/Signuppageimg.png" alt="Signup" className="signup-img" />
        </div>
        {/* Form Section */}
        <div className="auth-form-container">
          <img src="/assets/LOGO.png" alt="Company Logo" className="auth-logo" />
          <h2 className="auth-title">ERROR TO CLEVER</h2>
          <p className="auth-subtitle">Join us and get more benefits. We promise to keep your data safely.</p>
          
          <form onSubmit={handleSubmit} className="form-elements">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          <p className="auth-alt-text">or you can</p>
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
          {message && (
            <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;