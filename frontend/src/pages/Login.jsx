import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to dashboard or appropriate page
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
          <img src="/assets/Signuppageimg.png" alt="Login" className="signup-img" />
        </div>
        {/* Form Section */}
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
            <button type="submit">Login</button>
          </form>
          <p className="auth-alt-text">or you can</p>
          <p>
            Need an Account? <a href="/signup">Sign Up</a>
          </p>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
