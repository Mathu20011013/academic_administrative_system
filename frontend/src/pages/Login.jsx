// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirecting after login
import '../styles/AuthPage.css'; // Ensure your styles are imported

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // For navigating after successful login

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulating login logic here (replace with actual API call)
      if (email === 'test@example.com' && password === 'password') {
        setMessage('Login successful!');
        setTimeout(() => {
          navigate('/dashboard'); // Redirect after successful login
        }, 2000);
      } else {
        setMessage('Invalid credentials.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image">
        <img src="/assets/background.jpg" alt="Background" />
      </div>
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
        <p>or you can</p>
        <p>
          Need an Account? <a href="/signup">Sign Up</a>
        </p>
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
