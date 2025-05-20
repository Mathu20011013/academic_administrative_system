import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const validatePassword = (value) => {
    // Reset any previous error
    setPasswordError('');
    
    // Check minimum length
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(value)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    
    // Check for at least one number
    if (!/[0-9]/.test(value)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setMessage("Password does not meet strength requirements");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    try {
      // Include role as 'student' in the request body
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: 'student',  // Always set the role to 'student'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Signup response:', data);
      
      setMessage(data.message);
      setIsSuccess(true);
      
      // Store the token
      localStorage.setItem('authToken', data.token);
      
      // Extract and store user ID and role from the token
      if (data.token) {
        const base64Url = data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        console.log('Token payload:', payload);
        
        // Store user data from token
        localStorage.setItem('userId', payload.id);
        localStorage.setItem('userRole', payload.role);
        localStorage.setItem('userEmail', payload.email);
        localStorage.setItem('userName', payload.username);
      }
      
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Signup failed', error);
      setMessage(error.message || 'An error occurred during signup');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-image">
          <img src="/assets/Signuppageimg.png" alt="Signup" className="signup-img" />
        </div>
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
            <div className="password-field">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                  validatePassword(newPassword);
                }}
                required
                className={passwordError ? "input-error" : ""}
              />
              {passwordError && <span className="error-message">{passwordError}</span>}
              
              {/* Password strength indicator */}
              {password && (
                <div className="password-strength-meter">
                  <div className="strength-bars">
                    <span className={passwordStrength >= 1 ? "active" : ""}></span>
                    <span className={passwordStrength >= 2 ? "active" : ""}></span>
                    <span className={passwordStrength >= 3 ? "active" : ""}></span>
                    <span className={passwordStrength >= 4 ? "active" : ""}></span>
                    <span className={passwordStrength >= 5 ? "active" : ""}></span>
                  </div>
                  <span className="strength-text">
                    {passwordStrength === 0 && "Enter password"}
                    {passwordStrength === 1 && "Very Weak"}
                    {passwordStrength === 2 && "Weak"}
                    {passwordStrength === 3 && "Medium"}
                    {passwordStrength === 4 && "Strong"}
                    {passwordStrength === 5 && "Very Strong"}
                  </span>
                </div>
              )}
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <p className="auth-alt-text">or you can</p>
          <p>
            Already have an account? <a href="/login">Log In</a>
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