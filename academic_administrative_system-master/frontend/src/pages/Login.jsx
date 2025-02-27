import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      console.log(response);
      if (response.status === 200) {
        console.log(response.data);
        setMessage(response.data.message);
        localStorage.setItem('authToken', response.data.token);
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } catch (error) {
      console.error('Login failed', error);
      setMessage(error.message || 'An error occurred during login');
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
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
