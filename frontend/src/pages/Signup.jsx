// frontend/src/pages/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import '../styles/AuthPage.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { username, email, password });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login'); // Redirect to login after successful signup
      }, 2000);
    } catch (error) {
      setMessage(error.response.data.error); // Show error message if signup fails
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image">
        <img src="/assets/background.jpg" alt="Background" />
      </div>
      <div className="auth-form">
        <h2>ERROR TO CLEVER</h2>
        <p>Join us and get more benefits. We promise to keep your data safely.</p>
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Sign Up</button>
        </form>
        <p>or you can</p>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default Signup; // Default export
