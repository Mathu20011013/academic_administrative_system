import React from "react";
import "../styles/table.css"; // Import the CSS file for styling

const Table = ({ data, columns, style }) => {
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
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
