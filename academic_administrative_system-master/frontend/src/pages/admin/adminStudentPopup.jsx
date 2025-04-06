import React, { useState, useEffect } from 'react';
import ModalPopup from '../../components/admin/ModalPopup';
import '../../styles/adminStudentPopup.css';  // Import the modal CSS

const StudentModal = ({ student, onSave, onClose }) => {
  const [formData, setFormData] = useState(student);

  // Re-set form data when the student prop changes
  useEffect(() => {
    setFormData(student);
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Ensure all required fields are filled in
    if (!formData.Username || !formData.Email || !formData.Phone || !formData.Role) {
      alert("All fields are required!");
      return;
    }

    onSave(formData);  // Pass the updated student data back to the parent
  };

  return (
    <ModalPopup title="Edit Student" onClose={onClose}>
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
            value={formData.Phone === null || formData.Phone === "" ? "-" : formData.Phone}
            onChange={handleChange}
            required
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
          />
        </div>
        <div className="modal-buttons">
          <button className="btn-save" onClick={handleSave} aria-label="Save">
            Save
          </button>
          <button className="btn-normal" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
      </div>
    </ModalPopup>
  );
};

export default StudentModal;