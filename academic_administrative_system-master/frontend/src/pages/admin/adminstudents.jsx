import React, { useEffect, useState } from "react";
import Layout from "../../components/admin/ad-Layout"; // Adjust the import path
import Table from "../../components/table"; // Adjust the import path

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

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

  // Define the columns for the student table
  const studentColumns = [
    { header: "User ID", key: "User ID" },  // Ensure this matches the alias in the SQL query
    { header: "Username", key: "Username" },  // Ensure this matches the alias in the SQL query
    { header: "Email", key: "Email" },  // Ensure this matches the alias in the SQL query
    { header: "Phone", key: "Phone" },  // Ensure this matches the alias in the SQL query
    { header: "Role", key: "Role" },  // Ensure this matches the alias in the SQL query
    { header: "Signup Date", key: "Signup Date" }  // Ensure this matches the alias in the SQL query
  ];

  // Define the styles for the table container
  const tableStyle = {
    paddingLeft: "20px",
    paddingRight: "20px"
  };

  return (
    <Layout>
      <div className="admin-home-container">
        <h2>Admin Students</h2>
        <Table data={students} columns={studentColumns} /> {/* Pass columns and data */}
      </div>
    </Layout>
  );
};

export default AdminStudents;
