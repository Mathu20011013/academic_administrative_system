import React, { useState } from 'react';
import ModalPopup from '../../components/admin/ModalPopup';
import '../../styles/adminStudentPopup.css';  // Reusing the same styling

const AddInstructorModal = ({ onSave, onClose }) => {
  // Create a new instructor template
  const newInstructorTemplate = {
    "Username": "",
    "Email": "",
    "Phone": "",
    "Password": "",
    "Qualification": "",
    "Specialization": "",
    "Bio": "",
    "Role": "instructor"
  };

  const [formData, setFormData] = useState(newInstructorTemplate);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Ensure all required fields are filled in
    if (!formData.Username || !formData.Email || !formData.Password) {
      alert("Username, Email, and Password are required!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      alert("Please enter a valid email address!");
      return;
    }

    // Password validation - at least 6 characters
    if (formData.Password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    onSave(formData);  // Pass the new instructor data back to the parent
  };

  return (
    <ModalPopup title="Add New Instructor" onClose={onClose}>
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
          <label>Password</label>
          <input
            type="password"
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="Phone"
            value={formData.Phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Qualification</label>
          <input
            type="text"
            name="Qualification"
            value={formData.Qualification}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Specialization</label>
          <input
            type="text"
            name="Specialization"
            value={formData.Specialization}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="Bio"
            value={formData.Bio}
            onChange={handleChange}
            rows="4"
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
            readOnly={true} // Make role field read-only
          />
        </div>
        <div className="modal-buttons">
          <button className="btn-save" onClick={handleSave} aria-label="Add Instructor">
            Add
          </button>
          <button className="btn-normal" onClick={onClose} aria-label="Close">
            Cancel
          </button>
        </div>
      </div>
    </ModalPopup>
  );
};

export default AddInstructorModal;