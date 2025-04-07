import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout";
import Table from "../../components/table";
import Modal from "../admin/adminInstructorPopup";
import AddInstructorModal from "../admin/adminAddInstructorPopup";
import '../../styles/scrollbar.css'; // Adjust the path according to your project structure

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleEditClick = (instructor) => {
    setSelectedInstructor(instructor);
    setShowEditModal(true);
  };

  const handleAddNewClick = () => {
    setShowAddModal(true);
  };

  const handleDeleteClick = async (user_id) => {
    if (confirm("Are you sure you want to delete this instructor?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/instructors/${user_id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Error deleting instructor with ID: ${user_id}`);
        }
        setInstructors(instructors.filter(instructor => instructor['User ID'] !== user_id));
      } catch (error) {
        console.error("Error deleting instructor:", error);
        alert("Failed to delete instructor: " + error.message);
      }
    }
  };

  const handleSaveChanges = async (updatedInstructor) => {
    const payload = {
      username: updatedInstructor.Username,
      email: updatedInstructor.Email,
      contact_number: updatedInstructor.Phone,
      qualification: updatedInstructor.Qualification,
      specialization: updatedInstructor.Specialization,
      bio: updatedInstructor.Bio,
      role: updatedInstructor.Role,
      password: updatedInstructor.Password,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/instructors/${updatedInstructor["User ID"]}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating instructor data`);
      }

      fetchInstructors();
      setShowEditModal(false);
      alert("Instructor updated successfully!");
    } catch (error) {
      console.error(`Error updating instructor:`, error);
      alert("Failed to update instructor: " + error.message);
    }
  };

  const maskPassword = (password) => {
    return password ? "*".repeat(password.length) : "******";
  };

  const enhancedInstructors = instructors.map((instructor) => ({
    ...instructor,
    Password: maskPassword(instructor.Password),
    Actions: (
      <div style={{ display: "flex", gap: "8px" }}>
        <button className="btn-edit" onClick={() => handleEditClick(instructor)} aria-label="Edit">
          Edit
        </button>
        <button
          className="btn-delete"
          onClick={() => handleDeleteClick(instructor["User ID"])}
          aria-label="Delete"
        >
          Delete
        </button>
      </div>
    ),
  }));

  const instructorColumns = [
    { header: "User ID", key: "User ID" },
    { header: "Username", key: "Username" },
    { header: "Email", key: "Email" },
    { header: "Phone", key: "Phone" },
    { header: "Qualification", key: "Qualification" },
    { header: "Specialization", key: "Specialization" },
    { header: "Bio", key: "Bio" },
    { header: "Role", key: "Role" },
    { header: "Password", key: "Password" },
    { header: "Actions", key: "Actions" },
  ];

  return (
    <Layout>
      <div className="admin-home-container" style={{ backgroundColor: "transparent", boxShadow: "none" }}>
        <div className="table-container" style={{ position: "relative", zIndex: 1, backgroundColor: "transparent", boxShadow: "none" }}>
          {/* Add New Instructor Button - styled similar to Add New Course button */}
          <button
            onClick={handleAddNewClick}
            className="add-button"
            style={{
              marginBottom: "20px", // Adjusting the margin for spacing
              padding: "10px 20px", // Increased padding for better button size
              backgroundColor: "#007BFF", // Button color set to blue (like "Add New Course")
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
            Add New Instructor
          </button>

          {/* Table */}
          <Table data={enhancedInstructors} columns={instructorColumns} />
        </div>

        {showEditModal && (
          <Modal
            instructor={selectedInstructor}
            onSave={handleSaveChanges}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {showAddModal && (
          <AddInstructorModal
            onSave={handleSaveChanges}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminInstructors;
