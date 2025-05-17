import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout";
import Table from "../../components/table";
import EditCourseModal from "../admin/adminEditCoursePopup";
import AddCourseModal from "../admin/adminAddCoursePopup";
import '../../styles/scrollbar.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/courses?showInactive=true");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const coursesArray = Array.isArray(data) ? data : (data.courses && Array.isArray(data.courses)) ? data.courses : [];
      setCourses(coursesArray);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError(error.message);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleEditClick to ensure syllabus field is included
  const handleEditClick = (course) => {
    // Make sure we have consistent field names for the edit modal
    const courseWithConsistentFields = {
      course_id: course.course_id || course["Course ID"],
      course_name: course.course_name || course["Course Name"],
      syllabus: course.syllabus || course["Syllabus"] || "",
      price: course.price || course["Price"],
      instructor_id: course.instructor_id || course["Instructor ID"],
      image_url: course.image_url || course["Image URL"] || "",
      instructor_name: course.instructor_name || course["Instructor Name"] || ""
    };
    
    console.log("Editing course:", courseWithConsistentFields); // Debug log
    setSelectedCourse(courseWithConsistentFields);
    setShowEditModal(true);
  };

  const handleAddNewClick = () => {
    setShowAddModal(true);
  };

  const handleToggleStatus = async (course_id, currentStatus) => {
    try {
      if (!course_id) {
        console.error("Course ID is undefined:", course_id);
        alert("Cannot update course: Course ID is undefined");
        return;
      }
      
      const newStatus = !currentStatus;
      const response = await fetch(`http://localhost:5000/api/admin/courses/${course_id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Error updating status for course with ID: ${course_id}`);
      }

      setCourses(courses.map(course => 
        course["Course ID"] === course_id ? { ...course, is_active: newStatus } : course
      ));
      
      alert(`Course ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchCourses();
    } catch (error) {
      console.error("Error updating course status:", error);
      alert("Failed to update course status: " + error.message);
    }
  };

  // Update the handleSaveChanges function
  const handleSaveChanges = async (updatedCourse) => {
    console.log("Received updated course:", updatedCourse); // Debug log
    
    const payload = {
      course_name: updatedCourse.course_name,
      syllabus: updatedCourse.syllabus,
      price: updatedCourse.price,
      instructor_id: updatedCourse.instructor_id,
      image_url: updatedCourse.image_url,
    };
    
    console.log("Sending payload to backend:", payload); // Debug log

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/courses/${updatedCourse.course_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error("Error updating course data");
      }

      fetchCourses();
      setShowEditModal(false);
      alert("Course updated successfully!");
    } catch (error) {
      console.error(`Error updating course:`, error);
      alert("Failed to update course: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleAddCourse function
  const handleAddCourse = async (newCourse) => {
    console.log("Received new course:", newCourse); // Debug log
    
    const payload = {
      course_name: newCourse.course_name,
      syllabus: newCourse.syllabus,
      price: newCourse.price,
      instructor_id: newCourse.instructor_id,
      image_url: newCourse.image_url,
    };
    
    console.log("Sending payload to backend:", payload); // Debug log

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error("Error adding course");
      }

      fetchCourses();
      setShowAddModal(false);
      alert("Course added successfully!");
    } catch (error) {
      console.error(`Error adding course:`, error);
      alert("Failed to add course: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the columns array to ensure correct mapping
  const columns = [
    { key: "Course ID", header: "Course ID" },
    { key: "Course Name", header: "Course Name" },
    { key: "Syllabus", header: "Syllabus" },
    { key: "Instructor Name", header: "Instructor Name" },
    { key: "Price", header: "Price" },
    { key: "Status", header: "Status" },
    { key: "Actions", header: "Actions" }
  ];

  // Update the enhancedCourses mapping to ensure proper display of syllabus
  const enhancedCourses = courses.map((course) => {
    console.log("Processing course:", course); // Debug log
    return {
      ...course,
      // Display a truncated syllabus with tooltip
      "Syllabus": (
        <div 
          title={course.syllabus || course["Syllabus"] || "No syllabus available"}
          style={{ 
            maxWidth: "200px", 
            overflow: "hidden", 
            textOverflow: "ellipsis", 
            whiteSpace: "nowrap" 
          }}
        >
          {(course.syllabus || course["Syllabus"]) 
            ? ((course.syllabus || course["Syllabus"]).length > 50 
                ? `${(course.syllabus || course["Syllabus"]).substring(0, 50)}...` 
                : (course.syllabus || course["Syllabus"]))
            : "N/A"}
        </div>
      ),
      "Status": course.is_active ? "Active" : "Inactive",
      "Actions": (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn-edit"
            onClick={() => handleEditClick(course)}
          >
            Edit
          </button>
          <button
            className={course.is_active ? "btn-delete" : "btn-edit"}
            onClick={() => handleToggleStatus(course["Course ID"], course.is_active)}
          >
            {course.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      )
    };
  });

  return (
    <Layout>
      <div className="admin-courses-container" style={{ backgroundColor: "transparent", boxShadow: "none" }}>
        <div className="table-container" style={{ position: "relative", zIndex: 1, backgroundColor: "transparent", boxShadow: "none" }}>
          <button
            onClick={handleAddNewClick}
            className="add-button"
            style={{
              marginBottom: "20px",
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              position: "absolute",
              top: "0px",
              right: "110px",
              zIndex: 2,
              height: "50px", 
              width: "200px",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            Add New Course
          </button>

          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">
              Error: {error}
              <button onClick={fetchCourses}>Try Again</button>
            </div>
          ) : (
            <Table data={enhancedCourses} columns={columns} />
          )}

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
      </div>
    </Layout>
  );
};

export default AdminCourses;
