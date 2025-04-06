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
      console.log("Fetched course data:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Handle clicking the Edit button
  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  // Handle clicking Add New Course button
  const handleAddNewClick = () => {
    setShowAddModal(true);
  };

  // Handle deleting a course
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

  // Handle saving edited course information
  const handleSaveChanges = async (updatedCourse) => {
    console.log("Saving course:", updatedCourse);

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
      // Edit existing course
      const response = await fetch(`http://localhost:5000/api/admin/courses/${updatedCourse['Course ID']}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating course data`);
      }

      // Refresh the course list after successful update
      fetchCourses();
      setShowEditModal(false);
      alert("Course updated successfully!");
    } catch (error) {
      console.error(`Error updating course:`, error);
      alert("Failed to update course: " + error.message);
    }
  };

  // Handle adding a new course
  const handleAddCourse = async (newCourse) => {
    console.log("Adding new course:", newCourse);

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
      // Add new course
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

      // Refresh the course list after successful addition
      fetchCourses();
      setShowAddModal(false);
      alert("Course added successfully!");
    } catch (error) {
      console.error(`Error adding course:`, error);
      alert("Failed to add course: " + error.message);
    }
  };

  // Enhance course data to include action buttons
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

  // Define the columns for the course table
  const courseColumns = [
    { header: "Course ID", key: "Course ID" },
    { header: "Course Name", key: "Course Name" }, // Updated to match backend response
    { header: "Syllabus", key: "Syllabus" },
    { header: "Price", key: "Price" },
    { header: "Instructor ID", key: "Instructor ID" },
    { header: "Actions", key: "Actions" },
  ];

  return (
    <Layout>
      <div className="admin-home-container">
        <div className="table-container" style={{ position: "relative", zIndex: 1 }}>
          <button 
            onClick={handleAddNewClick}
            className="add-button"
          >
            Add New Course
          </button>
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
