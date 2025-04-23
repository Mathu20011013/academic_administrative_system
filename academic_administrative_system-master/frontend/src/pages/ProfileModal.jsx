import React, { useState, useEffect } from "react";
import "../styles/ProfileModal.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileModal = ({ userId, role, closeModal }) => {
  const [profileData, setProfileData] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const navigate = useNavigate();

  // Debug log
  console.log("ProfileModal rendered with:", { userId, role });

  // Function to check and debug the authentication token
  const checkAuthToken = () => {
    const token = localStorage.getItem("authToken");
    console.log(
      "Current auth token:",
      token ? `${token.substring(0, 15)}...` : "No token found"
    );

    if (!token) return null;

    try {
      // Basic token structure validation
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid token format - not a valid JWT");
        return null;
      }

      // Decode payload for debugging
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));

      console.log("Decoded token payload:", payload);
      return token;
    } catch (error) {
      console.error("Error examining token:", error);
      return null;
    }
  };

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      // Always check localStorage as fallback
      const id = userId || localStorage.getItem("userId");
      const userRole = role || localStorage.getItem("userRole");

      console.log("Fetching profile with:", { id, userRole });

      if (!id || !userRole) {
        setError("No user ID or role provided");
        setLoading(false);
        return;
      }

      try {
        // No authentication needed for viewing profile
        const response = await axios.get(
          `http://localhost:5000/api/profile/${id}?role=${userRole}`
        );
        console.log("Profile data received:", response.data);
        setProfileData(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching profile:", error);
        handleApiError(error, "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // Also check the auth token on mount
    checkAuthToken();
  }, [userId, role]);

  // Generic API error handler function
  const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);

      if (error.response.status === 401) {
        setError("Authentication error. Please log in again.");
        // Give user a chance to read the message before redirect
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        setError(
          `${defaultMessage}: ${
            error.response.data.error || error.response.statusText
          }`
        );
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
      setError("Server did not respond. Please check your connection.");
    } else {
      console.error("Error setting up request:", error.message);
      setError(`Error: ${error.message}`);
    }
  };

  // Handle profile form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate authentication token before proceeding
    const token = checkAuthToken();
    if (!token) {
      setError(
        "Authentication token is missing or invalid. Please log in again."
      );
      setTimeout(() => handleLogout(), 2000);
      return;
    }

    setLoading(true);

    // Get the current role from state or localStorage
    const currentRole =
      profileData.role || role || localStorage.getItem("userRole");

    // Add role to the data being sent
    const dataToSend = { ...profileData, role: currentRole };

    console.log("Updating profile with data:", dataToSend);

    const id = userId || localStorage.getItem("userId");

    if (!id) {
      setError("No user ID available for update");
      setLoading(false);
      return;
    }

    // Make the API request with authentication
    axios
      .put(`http://localhost:5000/api/profile/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Profile update response:", response.data);
        setSuccessMessage("Profile updated successfully!");
        setIsEditable(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        handleApiError(error, "Update failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle password reset
  const handlePasswordReset = (e) => {
    e.preventDefault();

    // Validate authentication token before proceeding
    const token = checkAuthToken();
    if (!token) {
      setError(
        "Authentication token is missing or invalid. Please log in again."
      );
      setTimeout(() => handleLogout(), 2000);
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    const id = userId || localStorage.getItem("userId");

    if (!id) {
      setError("No user ID available for password reset");
      setLoading(false);
      return;
    }

    console.log("Resetting password for user:", id);

    axios
      .put(
        `http://localhost:5000/api/profile/${id}/reset-password`,
        {
          new_password: passwordData.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Password reset response:", response.data);
        setSuccessMessage("Password updated successfully!");
        setShowPasswordReset(false);
        setPasswordData({ new_password: "", confirm_password: "" });
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Error resetting password:", error);
        handleApiError(error, "Password reset failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle logout (navigate to the login page)
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  // Toggle between profile edit and password reset forms
  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    if (isEditable) setIsEditable(false);
  };

  // For testing - add a dummy profile if no data is received
  const useDummyData = () => {
    const dummyData = {
      username: "Test User",
      email: "test@example.com",
      contact_number: "123-456-7890",
      user_id: userId || localStorage.getItem("userId") || 1,
      role: role || localStorage.getItem("userRole") || "student",
    };

    if (role === "student" || localStorage.getItem("userRole") === "student") {
      dummyData.guardian_name = "Parent Name";
      dummyData.guardian_contact = "987-654-3210";
      dummyData.gender = "Male";
      dummyData.dob = "2000-01-01";
      dummyData.address = "123 Test Street";
    }

    setProfileData(dummyData);
    setLoading(false);
    setError("");
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };
  
  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="modal-header">
          <h2>{showPasswordReset ? "Reset Password" : `Your Profile`}</h2>
          <button onClick={closeModal} className="close-button">
            ×
          </button>
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="error-message">
            {error}
            {loading === false && Object.keys(profileData).length === 0 && (
              <div>
                <button onClick={useDummyData} className="dummy-data-button">
                  Use Test Data
                </button>
              </div>
            )}
          </div>
        )}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="loader">
            <div className="loader-spinner"></div>
            <p>Loading profile data...</p>
          </div>
        )}

        {/* Only render the form if not loading and we have data */}
        {!loading &&
          Object.keys(profileData).length > 0 &&
          !showPasswordReset && (
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    value={profileData.username || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    className={isEditable ? "editable" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={profileData.email || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className={isEditable ? "editable" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    type="text"
                    value={profileData.contact_number || ""}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        contact_number: e.target.value,
                      })
                    }
                    className={isEditable ? "editable" : ""}
                  />
                </div>

                <div className="form-group">
                  <label>Role:</label>
                  <input
                    type="text"
                    value={
                      profileData.role ||
                      role ||
                      localStorage.getItem("userRole") ||
                      ""
                    }
                    disabled={true}
                    className="disabled-field"
                  />
                </div>
              </div>

              {/* Student-specific Fields */}
              {(profileData.role === "student" ||
                role === "student" ||
                localStorage.getItem("userRole") === "student") && (
                <div className="form-section">
                  <h3>Student Information</h3>
                  <div className="form-group">
                    <label>Guardian Name:</label>
                    <input
                      type="text"
                      value={profileData.guardian_name || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          guardian_name: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Guardian Contact:</label>
                    <input
                      type="text"
                      value={profileData.guardian_contact || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          guardian_contact: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender:</label>
                    <select
                      value={profileData.gender || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          gender: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth:</label>
                    <input
                      type="date"
                      value={formatDateForInput(profileData.dob)}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({ ...profileData, dob: e.target.value })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address:</label>
                    <textarea
                      value={profileData.address || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                </div>
              )}

              {/* Instructor-specific Fields */}
              {(profileData.role === "instructor" ||
                role === "instructor" ||
                localStorage.getItem("userRole") === "instructor") && (
                <div className="form-section">
                  <h3>Instructor Information</h3>
                  <div className="form-group">
                    <label>Qualification:</label>
                    <input
                      type="text"
                      value={profileData.qualification || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          qualification: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization:</label>
                    <input
                      type="text"
                      value={profileData.specialization || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          specialization: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio:</label>
                    <textarea
                      value={profileData.bio || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating Average:</label>
                    <div className="rating-display">
                      {profileData.rating_average ? (
                        <div className="stars">
                          {Array(5)
                            .fill()
                            .map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < Math.round(profileData.rating_average)
                                    ? "star filled"
                                    : "star"
                                }
                              >
                                ★
                              </span>
                            ))}
                          <span className="rating-text">
                            {profileData.rating_average}
                          </span>
                        </div>
                      ) : (
                        <span className="no-rating">No ratings yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin-specific Fields */}
              {(profileData.role === "admin" ||
                role === "admin" ||
                localStorage.getItem("userRole") === "admin") && (
                <div className="form-section">
                  <h3>Admin Information</h3>
                  <div className="form-group">
                    <label>Admin Name:</label>
                    <input
                      type="text"
                      value={profileData.admin_name || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          admin_name: e.target.value,
                        })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio:</label>
                    <textarea
                      value={profileData.bio || ""}
                      disabled={!isEditable}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      className={isEditable ? "editable" : ""}
                    />
                  </div>
                </div>
              )}

              <div className="button-group">
                {isEditable ? (
                  <button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditable(true)}
                    className="edit-button"
                  >
                    Edit Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={togglePasswordReset}
                  className="password-button"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="logout-button"
                >
                  Logout
                </button>
              </div>
            </form>
          )}

        {/* Password Reset Form */}
        {!loading && showPasswordReset && (
          <form onSubmit={handlePasswordReset} className="password-form">
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value,
                  })
                }
                required
                minLength="6"
              />
              <small className="form-text">
                Password must be at least 6 characters
              </small>
            </div>
            <div className="form-group">
              <label>Confirm Password:</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirm_password: e.target.value,
                  })
                }
                required
                minLength="6"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={togglePasswordReset}
                className="cancel-button"
              >
                Back to Profile
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
