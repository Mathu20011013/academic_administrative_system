import React, { useState, useEffect } from "react";
import ModalPopup from "../../components/admin/ModalPopup";
import "../../styles/adminStudentPopup.css";

const EditCourseModal = ({ course, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    course_id: "",
    course_name: "",
    syllabus: "",
    price: "",
    instructor_id: "",
    image_url: "",
  });
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (course) {
      console.log("Initializing form with course data:", course);
      setFormData({
        course_id: course["Course ID"],
        course_name: course["Course Name"],
        syllabus: course["Syllabus"],
        price: course["Price"],
        instructor_id: course["Instructor ID"],
        image_url: course["Image URL"],
      });
    }
    
    fetchInstructors();
  }, [course]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/admin/instructors"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setInstructors(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to load instructors");
      setLoading(false);
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
    if (
      !formData.course_name ||
      !formData.syllabus ||
      !formData.price ||
      !formData.instructor_id
    ) {
      alert("Course Name, Syllabus, Price, and Instructor are required!");
      return;
    }

    // Price validation - must be a positive number
    if (parseFloat(formData.price) <= 0) {
      alert("Price must be a positive number!");
      return;
    }

    onSave(formData); // Pass the updated course data back to the parent
  };

  if (loading) {
    return <div className="modal-overlay">Loading...</div>;
  }

  return (
    <ModalPopup title="Edit Course" onClose={onClose}>
      {error && <div className="error-message">{error}</div>}
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="course_name">Course Name</label>
          <input
            type="text"
            id="course_name"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="syllabus">Syllabus</label>
          <textarea
            id="syllabus"
            name="syllabus"
            value={formData.syllabus}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="instructor_id">Instructor</label>
          <select
            id="instructor_id"
            name="instructor_id"
            value={formData.instructor_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Instructor</option>
            {instructors.map((instructor) => (
              <option 
                key={instructor.instructor_id} 
                value={instructor.instructor_id}
              >
                {instructor.Username || instructor.username}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>
        <div className="button-group">
          <button className="btn-save" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </ModalPopup>
  );
};

export default EditCourseModal;
