/**
 * Utility functions for role-based authentication
 * Allows multiple role sessions in the same browser
 */

// Store token with role prefix to avoid collisions
export const storeToken = (role, token) => {
  localStorage.setItem(`token_${role}`, token);
  // Also store in the original location for backward compatibility
  localStorage.setItem('authToken', token);
};

// Store user ID with role prefix
export const storeUserId = (role, userId) => {
  localStorage.setItem(`userId_${role}`, userId);
  // Also store in the original location for backward compatibility
  localStorage.setItem('userId', userId);
};

// Get token for specific role
export const getToken = (role) => {
  return localStorage.getItem(`token_${role}`);
};

// Get user ID for specific role
export const getUserId = (role) => {
  return localStorage.getItem(`userId_${role}`);
};

// Get current active role
export const getCurrentRole = () => {
  return localStorage.getItem('userRole') || '';
};

// Handle login with role-specific storage
export const handleLogin = (userData, token) => {
  const { role, user_id } = userData;
  
  // Store role-specific tokens
  storeToken(role, token);
  storeUserId(role, user_id);
  
  // Store current role
  localStorage.setItem('currentRole', role);
  
  // Keep existing localStorage functionality for backward compatibility
  localStorage.setItem('userRole', role);
  localStorage.setItem('userId', user_id);
  localStorage.setItem('authToken', token);
};

// Handle logout for current role only
export const handleLogout = () => {
  const currentRole = localStorage.getItem('userRole');
  if (currentRole) {
    localStorage.removeItem(`token_${currentRole}`);
    localStorage.removeItem(`userId_${currentRole}`);
  }
  
  // Clear the standard items for backward compatibility
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('currentRole');
};