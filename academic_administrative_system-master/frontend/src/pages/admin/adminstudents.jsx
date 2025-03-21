import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout"; // Adjust the import path
import Table from "../../components/table"; // Adjust the import path

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Update the fetch URL to the backend server (localhost:5000)
        const response = await fetch("http://localhost:5000/api/students"); 
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

  // Define the columns for the student table
  const studentColumns = [
    { header: "User ID", key: "User ID" },
    { header: "Username", key: "Username" },
    { header: "Email", key: "email" },
    { header: "Phone", key: "phone" },
    { header: "Address", key: "address" },
    { header: "DOB", key: "dob" },
    { header: "Gender", key: "gender" },
    { header: "Guardian Name", key: "Guardian Name" },
    { header: "Guardian Contact", key: "Guardian Contact" },
    { header: "Role", key: "role" },
    { header: "Created At", key: "created_at" }
  ];

  // Define the styles for the table container
  const tableStyle = {
    paddingLeft: "20px",
    paddingRight: "20px"
  };

  return (
    <Layout>
      <div className="admin-home-container">
        <Table data={students} columns={studentColumns} style={tableStyle} /> {/* Pass columns, data, and styles */}
      </div>
    </Layout>
  );
};

export default AdminStudents;
