import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout"; // Adjust the import path
import Table from "../../components/table"; // Adjust the import path
import Modal from "../admin/adminStudentPopup"; // Import modal component to handle editing

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/students"); // Ensure the URL is correct
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched student data:", data); // Log data to check if it's fetched correctly
        setStudents(data); // Set the data in state
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  // Handle clicking the Edit button
  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true); // Open the modal to edit the student
  };

  // Handle deleting a student
  const handleDeleteClick = async (user_id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/students/${user_id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error deleting student with ID: ${user_id}`);
      }
      setStudents(students.filter(student => student['User ID'] !== user_id)); // Remove deleted student from state
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Handle saving edited student information
  const handleSaveChanges = async (updatedStudent) => {
    console.log("Saving the following updated student:", updatedStudent); // Log data to ensure correct fields

    const payload = {
      username: updatedStudent.Username,
      email: updatedStudent.Email,
      contact_number: updatedStudent.Phone,
      role: updatedStudent.Role,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/admin/students/${updatedStudent['User ID']}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Send the correct payload
      });

      if (!response.ok) {
        throw new Error("Error updating student data");
      }

      setStudents(students.map(student => student['User ID'] === updatedStudent['User ID'] ? updatedStudent : student));
      setShowModal(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  // Enhance student data to include action buttons (Edit, Delete)
  const enhancedStudents = students.map((student) => ({
    ...student,
    // Actions: (
    //   <div style={{ display: "flex", gap: "8px" }}>
    //     <button className="btn-edit" onClick={() => handleEditClick(student)}>
    //       Edit
    //     </button>
    //     <button className="btn-delete" onClick={() => handleDeleteClick(student['User ID'])}>
    //       Delete
    //     </button>
    //   </div>
    // ),
  }));

  // Define the columns for the student table (including Actions column)
  const studentColumns = [
    { header: "User ID", key: "User ID" },
    { header: "Username", key: "Username" },
    { header: "Email", key: "Email" },
    { header: "Phone", key: "Phone" },
   // { header: "Role", key: "Role" },
    { header: "Signup Date", key: "Signup Date" },
    // { header: "Actions", key: "Actions" }, // Action column for buttons
  ];

  return (
    <Layout>
      <div className="admin-home-container">
        <Table data={enhancedStudents} columns={studentColumns} />
        {showModal && <Modal student={selectedStudent} onSave={handleSaveChanges} onClose={() => setShowModal(false)} />}
      </div>
    </Layout>
  );
};

export default AdminStudents;
