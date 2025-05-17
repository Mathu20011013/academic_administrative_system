import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import AdminLayout from '../../components/admin/ad-Layout';
import api from '../../../api'; // or wherever you're importing from
import '../../styles/AdminReports.css';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('month');
  
  // Report data states
  const [revenueData, setRevenueData] = useState(null);
  const [instructorData, setInstructorData] = useState(null);
  const [enrollmentTrendData, setEnrollmentTrendData] = useState(null);
  const [userBaseData, setUserBaseData] = useState(null);

  // Fetch report data based on selected report and timeframe
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        console.log("Fetching report data for:", activeReport);
        
        switch (activeReport) {
          case 'revenue':
            console.log("Fetching revenue data...");
            const revenueResponse = await api.get(`/admin/reports/revenue?timeFrame=${timeFrame}`);
            console.log("Revenue API Response:", revenueResponse.data);
            setRevenueData(revenueResponse.data);
            break;
          
          case 'instructor':
            console.log("Fetching instructor data...");
            const instructorResponse = await api.get(`/admin/reports/instructor-performance`);
            console.log("Instructor API Response:", instructorResponse.data);
            setInstructorData(instructorResponse.data);
            break;
          
          case 'enrollment':
            console.log("Fetching enrollment data...");
            const enrollmentResponse = await api.get(`/admin/reports/enrollment-trends?months=6`);
            console.log("Enrollment API Response:", enrollmentResponse.data);
            setEnrollmentTrendData(enrollmentResponse.data);
            break;
          
          case 'users':
            try {
              const usersResponse = await api.get(`/admin/reports/user-base`);
              console.log("User Base API Response:", usersResponse);
              console.log("User Base Data:", usersResponse.data);
              
              // Ensure the data is in the expected format
              const userData = {
                studentCount: Number(usersResponse.data?.studentCount || 0),
                instructorCount: Number(usersResponse.data?.instructorCount || 0),
                courseCount: Number(usersResponse.data?.courseCount || 0)
              };
              
              console.log("Processed User Data:", userData);
              setUserBaseData(userData);
            } catch (error) {
              console.error("Error fetching user data:", error);
              setError("Failed to load user data");
            }
            break;
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Failed to load report data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [activeReport, timeFrame]);

  // Add this right after your useState declarations
  useEffect(() => {
    console.log("API file being used:", api);
    console.log("API baseURL:", api.defaults.baseURL);
    
    // Test API directly
    const testAPI = async () => {
      try {
        console.log("Making direct API test call...");
        const response = await fetch('/api/admin/reports/user-base');
        const data = await response.json();
        console.log("Direct API test result:", data);
      } catch (err) {
        console.error("Direct API test failed:", err);
      }
    };
    
    testAPI();
  }, []);

  // Add this near the top of your component
  useEffect(() => {
    console.log("API baseURL:", api.defaults.baseURL);
    
    // Example to show full URL that will be generated
    const exampleURL = new URL("/admin/reports/user-base", api.defaults.baseURL);
    console.log("Full URL example:", exampleURL.toString());
  }, []);

  // Export report as PDF
  const exportAsPDF = async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;
    
    try {
      const canvas = await html2canvas(reportElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      
      // Add header
      pdf.setFontSize(18);
      pdf.text("Academic Administrative System", 14, 22);
      
      // Add report title
      pdf.setFontSize(14);
      const reportTitle = getReportTitle();
      pdf.text(reportTitle, 14, 30);
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);
      
      // Add image
      const imgWidth = 260;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      pdf.addImage(imgData, 'PNG', 14, 45, imgWidth, imgHeight);
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(10);
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.width - 30, pdf.internal.pageSize.height - 10);
      }
      
      // Save PDF
      pdf.save(`${activeReport}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Export report as CSV
  const exportAsCSV = () => {
    let csvContent = "";
    let data = [];
    let headers = [];
    
    switch (activeReport) {
      case 'revenue':
        headers = ["Course", "Revenue"];
        if (revenueData && revenueData.courses) {
          data = revenueData.courses.map(course => [course.name, course.revenue]);
        }
        break;
        
      case 'instructor':
        headers = ["Instructor", "Total Enrollments"];
        if (instructorData && instructorData.instructors) {
          data = instructorData.instructors.map(instructor => [
            instructor.name, instructor.totalEnrollments
          ]);
        }
        break;
        
      case 'enrollment':
        if (enrollmentTrendData && enrollmentTrendData.months && enrollmentTrendData.courses) {
          headers = ["Month", ...enrollmentTrendData.courses.map(c => c.name)];
          data = enrollmentTrendData.months.map((month, idx) => {
            return [
              month,
              ...enrollmentTrendData.courses.map(course => course.enrollments[idx])
            ];
          });
        }
        break;
        
      case 'users':
        headers = ["User Type", "Count"];
        if (userBaseData) {
          data = [
            ["Students", userBaseData.studentCount],
            ["Instructors", userBaseData.instructorCount]
          ];
        }
        break;
        
      default:
        break;
    }
    
    // Add headers to CSV
    csvContent += headers.join(",") + "\n";
    
    // Add data rows to CSV
    data.forEach(row => {
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeReport}-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get proper report title
  const getReportTitle = () => {
    switch (activeReport) {
      case 'revenue':
        return 'Monthly Revenue Report';
      case 'instructor':
        return 'Instructor Enrollment Performance';
      case 'enrollment':
        return 'Course Enrollment Trends';
      case 'users':
        return 'User Base Overview';
      default:
        return 'Report';
    }
  };

  // Render Revenue Report
  const renderRevenueReport = () => {
    if (!revenueData) return <div className="loading-indicator">Loading revenue data...</div>;
    
    // Make sure all values have defaults
    const courses = revenueData.courses || [];
    const totalRevenue = revenueData.totalRevenue || 0;
    const totalEnrollments = revenueData.totalEnrollments || 0;
    
    // Update your barData to use the safe courses variable
    const barData = {
      labels: courses.map(course => course?.name || 'Unknown Course'),
      datasets: [
        {
          label: 'Revenue',
          data: courses.map(course => course?.revenue || 0),
          backgroundColor: 'rgba(255, 140, 0, 0.7)', // Orange color
          borderColor: 'rgba(255, 140, 0, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="report-section">
        <div className="report-summary">
          <h3>Monthly Revenue Report</h3>
          <p>
            This report shows the revenue generated from course enrollments where payment status is 'completed'. 
            The total revenue for the period is <strong>${(totalRevenue || 0).toFixed(2)}</strong>.
          </p>
        </div>
        
        <div className="chart-container">
          <Bar 
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Revenue by Course'
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `$${context.raw.toFixed(2)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value;
                    }
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="data-table">
          <h4>Revenue Details</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Revenue</th>
                <th>Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {/* Use the safe 'courses' variable instead of revenueData.courses */}
              {courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.name || 'Unknown Course'}</td>
                  <td>${(course.revenue || 0).toFixed(2)}</td>
                  <td>{course.enrollments || 0}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${(totalRevenue || 0).toFixed(2)}</strong></td>
                <td><strong>{totalEnrollments || 0}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Instructor Performance Report
  const renderInstructorReport = () => {
    if (!instructorData) return <div className="loading-indicator">Loading instructor data...</div>;
    
    // Add defensive checks for the instructors array
    const instructors = instructorData.instructors || [];
    const totalEnrollments = instructorData.totalEnrollments || 0;
    
    const barData = {
      // Use the safe 'instructors' variable instead of instructorData.instructors
      labels: instructors.map(instructor => instructor.name || 'Unknown Instructor'),
      datasets: [
        {
          label: 'Total Enrollments',
          data: instructors.map(instructor => instructor.totalEnrollments || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="report-section">
        <div className="report-summary">
          <h3>Instructor Enrollment Performance</h3>
          <p>
            This report shows the number of students enrolled in courses taught by each instructor. 
            The total number of enrollments across all instructors is <strong>{totalEnrollments}</strong>.
          </p>
        </div>
        
        <div className="chart-container">
          {instructors.length > 0 ? (
            <Bar 
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Enrollments by Instructor'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="no-data-message">
              No instructor enrollment data available.
            </div>
          )}
        </div>
        
        <div className="data-table">
          <h4>Instructor Course Enrollments</h4>
          {instructors.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Instructor</th>
                  <th>Course</th>
                  <th>Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => (
                  // Make sure instructor.courses exists before mapping
                  (instructor.courses || []).map((course, idx) => (
                    <tr key={`${instructor.id}-${idx}`}>
                      {idx === 0 ? (
                        <td rowSpan={(instructor.courses || []).length}>{instructor.name || 'Unknown'}</td>
                      ) : null}
                      <td>{course.name || 'Unknown Course'}</td>
                      <td>{course.enrollments || 0}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              No instructor enrollment data available.
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Enrollment Trends Report
  const renderEnrollmentTrendsReport = () => {
    if (!enrollmentTrendData) return <div className="loading-indicator">Loading enrollment trend data...</div>;
    
    const months = enrollmentTrendData.months || [];
    const courses = enrollmentTrendData.courses || [];
    
    const lineData = {
      labels: months,
      datasets: courses.map((course, index) => ({
        label: course.name,
        data: course.enrollments,
        borderColor: getColorByIndex(index),
        backgroundColor: getColorByIndex(index, 0.1),
        tension: 0.1,
        fill: false
      }))
    };
    
    function getColorByIndex(index, alpha = 1) {
      const colors = [
        `rgba(255, 99, 132, ${alpha})`,    // Red
        `rgba(54, 162, 235, ${alpha})`,    // Blue
        `rgba(255, 206, 86, ${alpha})`,    // Yellow
        `rgba(75, 192, 192, ${alpha})`,    // Green
        `rgba(153, 102, 255, ${alpha})`,   // Purple
        `rgba(255, 159, 64, ${alpha})`,    // Orange
        `rgba(199, 199, 199, ${alpha})`,   // Grey
      ];
      
      return colors[index % colors.length];
    }
    
    return (
      <div className="report-section">
        <div className="report-summary">
          <h3>Course Enrollment Trends</h3>
          <p>
            This report shows the enrollment trends for courses over the last 6 months. 
            It helps identify which courses are growing in popularity and which ones might need attention.
          </p>
        </div>
        
        <div className="chart-container">
          <Line 
            data={lineData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Enrollment Trends (Last 6 Months)'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Enrollments'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Month'
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="data-table">
          <h4>Monthly Enrollment Data</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                {courses.map(course => (
                  <th key={course.id}>{course.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month, monthIndex) => (
                <tr key={monthIndex}>
                  <td>{month}</td>
                  {courses.map(course => (
                    <td key={`${course.id}-${monthIndex}`}>{course.enrollments[monthIndex]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render User Base Report
  const renderUserBaseReport = () => {
    if (!userBaseData) return <div className="loading-indicator">Loading user base data...</div>;
    
    const studentCount = userBaseData.studentCount || 0;
    const instructorCount = userBaseData.instructorCount || 0;
    const courseCount = userBaseData.courseCount || 0;
    
    const pieData = {
      labels: ['Students', 'Instructors'],
      datasets: [
        {
          data: [studentCount, instructorCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div className="report-section">
        <div className="report-summary">
          <h3>User Base Overview</h3>
          <p>
            This report provides an overview of the current user base in the system. 
            There are currently <strong>{studentCount}</strong> students and 
            <strong> {instructorCount}</strong> instructors registered.
          </p>
        </div>
        
        <div className="chart-container">
          <Pie 
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                },
                title: {
                  display: true,
                  text: 'User Distribution'
                }
              }
            }}
          />
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon student-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="stat-content">
              <h4>Total Students</h4>
              <div className="stat-value">{studentCount}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon instructor-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="stat-content">
              <h4>Total Instructors</h4>
              <div className="stat-value">{instructorCount}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon course-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-content">
              <h4>Total Courses</h4>
              <div className="stat-value">{courseCount}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-reports-container">
        <div className="reports-header">
          <h2>Administrative Reports</h2>
          <p>Generate and view reports about courses, revenue, enrollments, and users</p>
        </div>
        
        <div className="reports-tabs">
          <button 
            className={`report-tab ${activeReport === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveReport('revenue')}
          >
            <i className="fas fa-chart-line"></i> Revenue Report
          </button>
          <button 
            className={`report-tab ${activeReport === 'instructor' ? 'active' : ''}`}
            onClick={() => setActiveReport('instructor')}
          >
            <i className="fas fa-chalkboard-teacher"></i> Instructor Performance
          </button>
          <button 
            className={`report-tab ${activeReport === 'enrollment' ? 'active' : ''}`}
            onClick={() => setActiveReport('enrollment')}
          >
            <i className="fas fa-chart-area"></i> Enrollment Trends
          </button>
          <button 
            className={`report-tab ${activeReport === 'users' ? 'active' : ''}`}
            onClick={() => setActiveReport('users')}
          >
            <i className="fas fa-users"></i> User Base
          </button>
        </div>
        
        {activeReport === 'revenue' && (
          <div className="time-selector">
            <label>Time Period:</label>
            <select 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
              className="form-select"
            >
              <option value="month">This Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading report data...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div id="report-content" className="report-content">
            {activeReport === 'revenue' && renderRevenueReport()}
            {activeReport === 'instructor' && renderInstructorReport()}
            {activeReport === 'enrollment' && renderEnrollmentTrendsReport()}
            {activeReport === 'users' && renderUserBaseReport()}
            
            <div className="export-options">
              <h4>Export Options</h4>
              <div className="export-buttons">
                <button 
                  className="btn export-btn pdf-btn"
                  onClick={exportAsPDF}
                >
                  <i className="far fa-file-pdf"></i> Export as PDF
                </button>
                <button 
                  className="btn export-btn csv-btn"
                  onClick={exportAsCSV}
                >
                  <i className="far fa-file-excel"></i> Export as CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;