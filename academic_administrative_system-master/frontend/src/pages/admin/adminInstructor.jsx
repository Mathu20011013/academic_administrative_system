import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout";
import Table from "../../components/table";
import Modal from "../admin/adminInstructorPopup";
import AddInstructorModal from "../admin/adminAddInstructorPopup";

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
      console.log("Fetched instructor data:", data);
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  // Handle clicking the Edit button
  const handleEditClick = (instructor) => {
    setSelectedInstructor(instructor);
    setShowEditModal(true);
  };

  // Handle clicking Add New Instructor button
  const handleAddNewClick = () => {
    setShowAddModal(true);
  };

  // Handle deleting an instructor
  const handleDeleteClick = async (user_id) => {
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
    }
  };

  // Handle saving edited instructor information
  const handleSaveChanges = async (updatedInstructor) => {
    console.log("Saving instructor:", updatedInstructor);

    const payload = {
      username: updatedInstructor.Username,
      email: updatedInstructor.Email,
      contact_number: updatedInstructor.Phone,
      qualification: updatedInstructor.Qualification,
      specialization: updatedInstructor.Specialization,
      role: updatedInstructor.Role,
    };

    try {
      // Edit existing instructor
      const response = await fetch(`http://localhost:5000/api/admin/instructors/${updatedInstructor['User ID']}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating instructor data`);
      }

      // Refresh the instructor list after successful update
      fetchInstructors();
      setShowEditModal(false);
    } catch (error) {
      console.error(`Error updating instructor:`, error);
      alert("Failed to update instructor: " + error.message);
    }
  };

  // Handle adding a new instructor
  const handleAddInstructor = async (newInstructor) => {
    console.log("Adding new instructor:", newInstructor);

    const payload = {
      username: newInstructor.Username,
      email: newInstructor.Email,
      password: newInstructor.Password, // Include password in the payload
      contact_number: newInstructor.Phone,
      qualification: newInstructor.Qualification,
      specialization: newInstructor.Specialization,
      role: newInstructor.Role,
    };

    try {
      // Add new instructor
      const response = await fetch("http://localhost:5000/api/admin/instructors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error adding instructor");
      }

      // Refresh the instructor list after successful addition
      fetchInstructors();
      setShowAddModal(false);
      alert("Instructor added successfully!");
    } catch (error) {
      console.error(`Error adding instructor:`, error);
      alert("Failed to add instructor: " + error.message);
    }
  };

  // Enhance instructor data to include action buttons
  const enhancedInstructors = instructors.map((instructor) => ({
    ...instructor,
    Actions: (
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => handleEditClick(instructor)}>Edit</button>
        <button onClick={() => handleDeleteClick(instructor['User ID'])}>Delete</button>
      </div>
    ),
  }));

  // Define the columns for the instructor table
  const instructorColumns = [
    { header: "User ID", key: "User ID" },
    { header: "Username", key: "Username" },
    { header: "Email", key: "Email" },
    { header: "Phone", key: "Phone" },
    { header: "Qualification", key: "Qualification" },
    { header: "Specialization", key: "Specialization" },
    { header: "Role", key: "Role" },
    { header: "Signup Date", key: "Signup Date" },
    { header: "Actions", key: "Actions" },
  ];

  return (
    <Layout>
      <div className="admin-home-container">
        <div className="table-box">
          <button 
            onClick={handleAddNewClick}
            className="add-instructor-button"
          >
            Add New Instructor
          </button>
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
            onSave={handleAddInstructor} 
            onClose={() => setShowAddModal(false)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default AdminInstructors;