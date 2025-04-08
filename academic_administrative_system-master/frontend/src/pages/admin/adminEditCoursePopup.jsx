import React, { useState, useEffect } from "react";
import ModalPopup from '../../components/admin/ModalPopup';
import '../../styles/adminStudentPopup.css';

const EditCourseModal = ({ course, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    course_name: '',
    syllabus: '',
    price: '',
    instructor_id: '',
  });
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    if (course) {
      setFormData({
        course_id: course['Course ID'], // Add this line
        course_name: course['Course Name'],
        syllabus: course['Syllabus'],
        price: course['Price'],
        instructor_id: course['Instructor ID'],
      });
    }
    fetchInstructors();
  }, [course]);

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
    if (!formData.course_name || !formData.syllabus || !formData.price || !formData.instructor_id) {
      alert("Course Name, Syllabus, Price, and Instructor are required!");
      return;
    }

    // Price validation - must be a positive number
    if (parseFloat(formData.price) <= 0) {
      alert("Price must be a positive number!");
      return;
    }

    onSave(formData);  // Pass the updated course data back to the parent
  };

  return (
    <ModalPopup title="Edit Course" onClose={onClose} size="medium">
      <div className="modal-form">
        <div className="form-group">
          <label>Course Name</label>
          <input
            type="text"
            name="course_name"
            value={formData.course_name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Syllabus</label>
          <textarea
            name="syllabus"
            value={formData.syllabus || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Instructor</label>
          <select
            name="instructor_id"
            value={formData.instructor_id || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select Instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor['User ID']} value={instructor['User ID']}>
                {instructor.Username}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-buttons">
          <button className="btn-save" onClick={handleSave} aria-label="Save Changes">
            Save Changes
          </button>
          <button className="btn-cancel" onClick={onClose} aria-label="Cancel">
            Cancel
          </button>
        </div>
      </div>
    </ModalPopup>
  );
};

export default EditCourseModal;
