import React from "react";
import "../styles/table.css"; // Import the CSS file for styling

const Table = ({ data, columns, style }) => {
  // Add error handling for undefined data or columns
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="table-container">No data available</div>;
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return <div className="table-container">No columns defined</div>;
  }

  const tableStyle = {
    padding: "20px", // Add padding around the table
    ...style, // Merge with any additional styles passed as props
  };

  return (
    <div style={tableStyle} className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={row.Status === "Inactive" ? "inactive-row" : ""}>
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex}
                  className={column.key === "Status" ? `status-${row.Status?.toLowerCase()}` : ""}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
