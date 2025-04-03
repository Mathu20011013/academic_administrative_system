import React, { useState, useEffect } from "react";
import ModalPopup from '../../components/admin/ModalPopup';
import '../../styles/adminStudentPopup.css';

const AddCourseModal = ({ onSave, onClose }) => {
  // Create a new course template
  const newCourseTemplate = {
    "Title": "",
    "Description": "",
    "Price": "",
    "Duration": "",
    "Instructor ID": "",
    "Category": "",
    "Status": "active"
  };

  const [formData, setFormData] = useState(newCourseTemplate);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/instructors");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Ensure all required fields are filled in
    if (!formData.Title || !formData.Description || !formData.Price || !formData["Instructor ID"]) {
      alert("Title, Description, Price and Instructor are required!");
      return;
    }

    // Price validation - must be a positive number
    if (parseFloat(formData.Price) <= 0) {
      alert("Price must be a positive number!");
      return;
    }

    onSave(formData);  // Pass the new course data back to the parent
  };

  return (
    <ModalPopup title="Add New Course" onClose={onClose} size="medium">
      <div className="modal-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="Title"
            value={formData.Title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="Price"
            value={formData.Price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Duration (in weeks)</label>
          <input
            type="number"
            name="Duration"
            value={formData.Duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Instructor</label>
          <select
            name="Instructor ID"
            value={formData["Instructor ID"]}
            onChange={handleChange}
            required
          >
            <option value="">Select Instructor</option>
            {instructors.map(instructor => (
              <option key={instructor['User ID']} value={instructor['User ID']}>
                {instructor.Username}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="Category"
            value={formData.Category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            name="Status"
            value={formData.Status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="modal-buttons">
          <button className="btn-save" onClick={handleSave} aria-label="Add Course">
            Add Course
          </button>
          <button className="btn-cancel" onClick={onClose} aria-label="Cancel">
            Cancel
          </button>
        </div>
      </div>
    </ModalPopup>
  );
};

export default AddCourseModal;