import React, { useState, useEffect } from 'react';
import '../../styles/adminStudentPopup.css';  // Reusing the same styling

const Modal = ({ instructor, onSave, onClose }) => {
  const [formData, setFormData] = useState(instructor);

  // Re-set form data when the instructor prop changes
  useEffect(() => {
    setFormData(instructor);
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Ensure all required fields are filled in
    if (!formData.Username || !formData.Email || !formData.Role) {
      alert("Username, Email, and Role are required!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      alert("Please enter a valid email address!");
      return;
    }

    onSave(formData);  // Pass the updated instructor data back to the parent
  };

  const handleClose = () => {
    onClose();  // Call the onClose function passed as a prop to close the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Instructor</h2>
        <div className="modal-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="Phone"
              value={formData.Phone === null || formData.Phone === "" ? "" : formData.Phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              name="Qualification"
              value={formData.Qualification || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              name="Specialization"
              value={formData.Specialization || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              required
              readOnly={true} // Make role field read-only for instructors
            />
          </div>
          <div className="modal-buttons">
            <button className="btn-save" onClick={handleSave} aria-label="Save">
              Save
            </button>
            <button className="btn-normal" onClick={handleClose} aria-label="Close">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;