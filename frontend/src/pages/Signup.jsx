import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { email, password, confirmPassword, role });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

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
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
            <button type="submit">Create Account</button>
          </form>
          <p className="auth-alt-text">or you can</p>
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Signup;
