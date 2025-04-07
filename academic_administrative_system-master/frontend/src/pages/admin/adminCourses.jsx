import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout";
import Table from "../../components/table";
import EditCourseModal from "../admin/adminEditCoursePopup";
import AddCourseModal from "../admin/adminAddCoursePopup";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/courses");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleAddNewClick = () => {
    setShowAddModal(true);
  };

  const handleDeleteClick = async (course_id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/courses/${course_id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error deleting course with ID: ${course_id}`);
      }
      setCourses(courses.filter(course => course['Course ID'] !== course_id));
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course: " + error.message);
    }
  };

  const handleSaveChanges = async (updatedCourse) => {
    const payload = {
      title: updatedCourse.Title,
      description: updatedCourse.Description,
      price: updatedCourse.Price,
      duration: updatedCourse.Duration,
      instructor_id: updatedCourse['Instructor ID'],
      category: updatedCourse.Category,
      status: updatedCourse.Status
    };

    try {
      const response = await fetch(`http://localhost:5000/api/admin/courses/${updatedCourse['Course ID']}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating course data`);
      }

      fetchCourses();
      setShowEditModal(false);
      alert("Course updated successfully!");
    } catch (error) {
      console.error(`Error updating course:`, error);
      alert("Failed to update course: " + error.message);
    }
  };

  const handleAddCourse = async (newCourse) => {
    const payload = {
      title: newCourse.Title,
      description: newCourse.Description,
      price: newCourse.Price,
      duration: newCourse.Duration,
      instructor_id: newCourse['Instructor ID'],
      category: newCourse.Category,
      status: newCourse.Status || "active"
    };

    try {
      const response = await fetch("http://localhost:5000/api/admin/courses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error adding course");
      }

      fetchCourses();
      setShowAddModal(false);
      alert("Course added successfully!");
    } catch (error) {
      console.error(`Error adding course:`, error);
      alert("Failed to add course: " + error.message);
    }
  };

  const enhancedCourses = courses.map((course) => ({
    ...course,
    Actions: (
      <div className="modal-buttons">
        <button className="btn-edit" onClick={() => handleEditClick(course)} aria-label="Edit">
          Edit
        </button>
        <button className="btn-delete" onClick={() => handleDeleteClick(course['Course ID'])} aria-label="Delete">
          Delete
        </button>
      </div>
    ),
  }));

  const courseColumns = [
    { header: "Course ID", key: "Course ID" },
    { header: "Course Name", key: "Course Name" },
    { header: "Syllabus", key: "Syllabus" },
    { header: "Price", key: "Price" },
    { header: "Instructor ID", key: "Instructor ID" },
    { header: "Actions", key: "Actions" },
  ];

  return (
    <Layout>
      <div className="admin-home-container" style={{ backgroundColor: "transparent", boxShadow: "none" }}>
        <div className="table-container" style={{ position: "relative", zIndex: 1, backgroundColor: "transparent", boxShadow: "none" }}>
          {/* Add New Course Button */}
          <button 
            onClick={handleAddNewClick}
            className="add-button"
            style={{
              marginBottom: "20px", // Adjusting the margin for spacing
              padding: "10px 20px", // Increased padding for better button size
              backgroundColor: "#007BFF", // Button color set to blue (like "Add New Instructor")
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              position: "absolute", // Positioned at the top-right of the table
              top: "0px",
              right: "90px",
              zIndex: 2,
            }}
          >
            Add New Course
          </button>

          {/* Table */}
          <Table data={enhancedCourses} columns={courseColumns} />
        </div>

        {showEditModal && (
          <EditCourseModal 
            course={selectedCourse} 
            onSave={handleSaveChanges} 
            onClose={() => setShowEditModal(false)} 
          />
        )}
        
        {showAddModal && (
          <AddCourseModal 
            onSave={handleAddCourse} 
            onClose={() => setShowAddModal(false)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminCourses;
