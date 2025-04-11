import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout";
import Table from "../../components/table";
import Modal from "../admin/adminInstructorPopup";
import AddInstructorModal from "../admin/adminAddInstructorPopup";
import '../../styles/scrollbar.css';

const AdminInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/instructors");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
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
    if (window.confirm("Are you sure you want to delete this instructor?")) {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/admin/instructors/${user_id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Error deleting instructor with ID: ${user_id}`);
        }
        setInstructors(instructors.filter(instructor => instructor['User ID'] !== user_id));
        alert("Instructor deleted successfully!");
      } catch (error) {
        console.error("Error deleting instructor:", error);
        alert("Failed to delete instructor: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function for updating an existing instructor
  const handleUpdateInstructor = async (updatedInstructor) => {
    const userId = updatedInstructor["User ID"];
    
    if (!userId) {
      console.error("Error: Cannot update instructor without User ID");
      alert("Failed to update: Missing User ID");
      return;
    }
    
    const payload = {
      username: updatedInstructor.Username,
      email: updatedInstructor.Email,
      contact_number: updatedInstructor.Phone,
      qualification: updatedInstructor.Qualification,
      specialization: updatedInstructor.Specialization,
      bio: updatedInstructor.Bio,
      role: updatedInstructor.Role,
    };

    // Only include password if it was changed
    if (updatedInstructor.Password && updatedInstructor.Password !== "******") {
      payload.password = updatedInstructor.Password;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/admin/instructors/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error updating instructor data`);
      }

      fetchInstructors();
      setShowEditModal(false);
      alert("Instructor updated successfully!");
    } catch (error) {
      console.error(`Error updating instructor:`, error);
      alert("Failed to update instructor: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated function for adding a new instructor
  const handleAddInstructor = async (newInstructorData) => {
    try {
      setIsLoading(true);
      // Prepare the payload according to your backend expectations
      const payload = {
        username: newInstructorData.Username,
        email: newInstructorData.Email,
        password: newInstructorData.Password,
        contact_number: newInstructorData.Phone || null,
        qualification: newInstructorData.Qualification || null,
        specialization: newInstructorData.Specialization || null,
        bio: newInstructorData.Bio || null,
        role: 'instructor'
      };

      console.log("Sending data to add instructor:", payload);
      
      const response = await fetch("http://localhost:5000/api/admin/instructors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      let errorMessage = "Failed to add instructor";
      
      if (!response.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      alert("Instructor added successfully!");
      fetchInstructors(); // Refresh the instructor list
      setShowAddModal(false); // Close the modal
    } catch (error) {
      console.error("Error adding instructor:", error);
      alert("Failed to add instructor: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const maskPassword = (password) => {
    return password ? "*".repeat(Math.min(password.length, 6)) : "******";
  };

  const enhancedInstructors = instructors.map((instructor) => ({
    ...instructor,
    "Instructor ID": instructor["Instructor ID"],
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
    { header: "Instructor ID", key: "Instructor ID" },
    { header: "Username", key: "Username" },
    { header: "Email", key: "Email" },
    { header: "Phone", key: "Phone" },
    { header: "Qualification", key: "Qualification" },
    { header: "Specialization", key: "Specialization" },
    { header: "Bio", key: "Bio" },
    { header: "Role", key: "Role" },
    { header: "Rating", key: "Rating" },
    { header: "Actions", key: "Actions" },
  ];

  return (
    <Layout>
      <div className="admin-home-container" style={{ backgroundColor: "transparent", boxShadow: "none" }}>
        {isLoading && <div className="loading-spinner">Loading...</div>}
        {error && <div className="error-message">Error: {error}</div>}
        
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
              height: "50px", // Set the height
              width: "200px",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            Add New Instructor
          </button>

          <Table data={enhancedInstructors} columns={instructorColumns} />
        </div>

        {showEditModal && (
          <Modal
            instructor={selectedInstructor}
            onSave={handleUpdateInstructor}
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