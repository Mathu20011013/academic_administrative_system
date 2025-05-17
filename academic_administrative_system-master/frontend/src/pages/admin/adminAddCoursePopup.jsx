import React, { useState, useEffect } from "react";
import ModalPopup from "../../components/admin/ModalPopup";
import "../../styles/adminStudentPopup.css";

const AddCourseModal = ({ onSave, onClose }) => {
  // Create a new course template matching the database schema
  const newCourseTemplate = {
    course_name: "",
    syllabus: "",
    price: "",
    instructor_id: "",
    image_url: "",
  };

  const [formData, setFormData] = useState(newCourseTemplate);
  const [instructors, setInstructors] = useState([]);
  
  // Add these new states for image handling
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/instructors"
      );
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

  // Add this new function to handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Update the handleSave function to upload image first
  const handleSave = async () => {
    // Keep your existing validation
    if (!formData.course_name || !formData.syllabus || !formData.price || !formData.instructor_id) {
      alert("Please fill in all required fields!");
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      alert("Price must be a positive number!");
      return;
    }

    try {
      let updatedFormData = { ...formData };
      console.log("Before image upload:", updatedFormData); // Debug log

      // Upload image if one is selected
      if (imageFile) {
        setIsUploading(true);
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const response = await fetch("http://localhost:5000/api/admin/courses/upload-image", {
          method: "POST",
          body: imageFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        updatedFormData.image_url = data.imageUrl;
        console.log("Image uploaded, URL:", data.imageUrl); // Debug log
      }

      // Save the course with image URL
      console.log("Saving course with data:", updatedFormData); // Debug log
      onSave(updatedFormData);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ModalPopup title="Add New Course" onClose={onClose} size="medium">
      <div className="modal-form">
        <div className="form-group">
          <label>Course Name</label>
          <input
            type="text"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Syllabus</label>
          <textarea
            name="syllabus"
            value={formData.syllabus}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Instructor</label>
          <select
            name="instructor_id"
            value={formData.instructor_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor["Instructor ID"] || instructor.user_id} 
                      value={instructor["Instructor ID"] || instructor.user_id}>
                {instructor.Username || instructor.full_name || `${instructor.first_name} ${instructor.last_name}`}
              </option>
            ))}
          </select>
        </div>

        {/* Replace only the image_url text input with file upload */}
        <div className="form-group">
          <label>Course Image</label>
          {imagePreview && (
            <div className="image-preview" style={{ marginBottom: '10px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {isUploading && <div className="uploading-text">Uploading...</div>}
        </div>

        {/* Keep your existing buttons */}
        <div className="modal-buttons">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isUploading}
            aria-label="Add Course"
          >
            {isUploading ? "Uploading..." : "Add Course"}
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
