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
  const [exportLoading, setExportLoading] = useState(false);
  
  // Report data states
  const [revenueData, setRevenueData] = useState(null);
  const [instructorData, setInstructorData] = useState([]);
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

  // Update your data fetching for revenue report
  useEffect(() => {
    if (activeReport === 'revenue') {
      const fetchRevenueData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/admin/reports/revenue');
          console.log("Revenue API response:", response.data);
          if (response.data && Array.isArray(response.data)) {
            setRevenueData(response.data);
          } else {
            console.error("Invalid revenue data format:", response.data);
            setRevenueData([]);
          }
        } catch (error) {
          console.error("Error fetching revenue data:", error);
          setRevenueData([]);
        }
      };
      
      fetchRevenueData();
    }
  }, [activeReport]);

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

  // Export report as PDF with better formatting for A4 paper
  const exportAsPDF = async () => {
    try {
      // Show loading indicator
      setExportLoading(true);
      console.log("Starting PDF export for:", activeReport);
      
      // Force any charts to render/update before capturing
      // This is crucial for ensuring charts are fully rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Setup PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      
      // Add report title and date
      pdf.setFontSize(18);
      pdf.text("Error To Clever", margin, margin);
      pdf.setFontSize(14);
      
      // Use the correct report title based on active report
      let reportTitle = "Report";
      if (activeReport === 'revenue') reportTitle = "Revenue Report";
      if (activeReport === 'instructor') reportTitle = "Instructor Performance Report";
      if (activeReport === 'enrollment') reportTitle = "Enrollment Trends Report";
      if (activeReport === 'users') reportTitle = "User Base Report";
      
      pdf.text(reportTitle, margin, margin + 30);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 50);
      
      let currentY = margin + 70;
      
      // DIRECTLY EXTRACT DATA FROM STATE VARIABLES
      // This is more reliable than trying to extract from DOM
      
      if (activeReport === 'revenue' && revenueData) {
        // REVENUE REPORT
        const courses = revenueData.courses || [];
        const totalRevenue = revenueData.totalRevenue || 0;
        const totalEnrollments = revenueData.totalEnrollments || 0;
        
        if (courses.length > 0) {
          // Add table header
          pdf.setFontSize(14);
          pdf.text("Revenue Details", margin, currentY);
          currentY += 25;
          
          // Create table headers
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, currentY - 15, pageWidth - 2 * margin, 20, 'F');
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text("Course", margin + 5, currentY);
          pdf.text("Revenue", margin + 280, currentY);
          pdf.text("Enrollments", margin + 380, currentY);
          
          currentY += 10;
          
          // Draw table content
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          
          courses.forEach((course, index) => {
            // Alternate row colors
            if (index % 2 === 1) {
              pdf.setFillColor(248, 248, 248);
              pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
            }
            
            let courseName = course.name || "Unknown Course";
            if (courseName.length > 35) {
              courseName = courseName.substring(0, 32) + '...';
            }
            
            pdf.text(courseName, margin + 5, currentY + 5);
            pdf.text(`LKR${(course.revenue || 0).toFixed(2)}`, margin + 280, currentY + 5);
            pdf.text(`${course.enrollments || 0}`, margin + 380, currentY + 5);
            
            currentY += 20;
            
            // Add new page if needed
            if (currentY > pageHeight - margin - 40) {
              pdf.addPage();
              currentY = margin;
            }
          });
          
          // Draw total row
          pdf.setFillColor(230, 230, 230);
          pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
          
          pdf.setFont('helvetica', 'bold');
          pdf.text("Total", margin + 5, currentY + 5);
          pdf.text(`LKR${(totalRevenue).toFixed(2)}`, margin + 280, currentY + 5);
          pdf.text(`${totalEnrollments}`, margin + 380, currentY + 5);
          
          // Add chart on a new page
          try {
            const chartCanvas = document.querySelector('.revenue-chart canvas');
            if (chartCanvas) {
              pdf.addPage();
              currentY = margin;
              
              pdf.setFontSize(14);
              pdf.text("Revenue Distribution", margin, currentY);
              currentY += 30;
              
              const chartImg = chartCanvas.toDataURL('image/png');
              const imgWidth = pageWidth - (margin * 2);
              const imgHeight = imgWidth * 0.6;
              
              pdf.addImage(chartImg, 'PNG', margin, currentY, imgWidth, imgHeight);
            }
          } catch (chartError) {
            console.error("Could not add revenue chart to PDF:", chartError);
          }
        } else {
          pdf.text("No revenue data available.", margin, currentY);
        }
      }
      else if (activeReport === 'instructor' && instructorData) {
        // INSTRUCTOR REPORT
        const instructors = instructorData.instructors || [];
        
        if (instructors.length > 0) {
          // Add table header
          pdf.setFontSize(14);
          pdf.text("Instructor Performance", margin, currentY);
          currentY += 25;
          
          // Create summary table first
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, currentY - 15, pageWidth - 2 * margin, 20, 'F');
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text("Instructor", margin + 5, currentY);
          pdf.text("Total Enrollments", margin + 280, currentY);
          
          currentY += 10;
          
          // Draw table content
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          
          instructors.forEach((instructor, index) => {
            // Alternate row colors
            if (index % 2 === 1) {
              pdf.setFillColor(248, 248, 248);
              pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
            }
            
            pdf.text(instructor.name || "Unknown Instructor", margin + 5, currentY + 5);
            pdf.text(`${instructor.totalEnrollments || 0}`, margin + 280, currentY + 5);
            
            currentY += 20;
            
            // Add new page if needed
            if (currentY > pageHeight - margin - 40) {
              pdf.addPage();
              currentY = margin;
            }
          });
          
          // Add detailed table on a new page
          pdf.addPage();
          currentY = margin;
          
          pdf.setFontSize(14);
          pdf.text("Instructor Course Details", margin, currentY);
          currentY += 25;
          
          // Create detailed table headers
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, currentY - 15, pageWidth - 2 * margin, 20, 'F');
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text("Instructor", margin + 5, currentY);
          pdf.text("Course", margin + 180, currentY);
          pdf.text("Enrollments", margin + 380, currentY);
          
          currentY += 10;
          
          // Draw detailed table content
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          
          instructors.forEach(instructor => {
            const instructorName = instructor.name || "Unknown";
            
            (instructor.courses || []).forEach((course, courseIndex) => {
              // Alternate row colors
              if (courseIndex % 2 === 1) {
                pdf.setFillColor(248, 248, 248);
                pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
              }
              
              // Only show instructor name on first course
              if (courseIndex === 0) {
                pdf.text(instructorName, margin + 5, currentY + 5);
              }
              
              let courseName = course.name || "Unknown Course";
              if (courseName.length > 25) {
                courseName = courseName.substring(0, 22) + '...';
              }
              
              pdf.text(courseName, margin + 180, currentY + 5);
              pdf.text(`${course.enrollments || 0}`, margin + 380, currentY + 5);
              
              currentY += 20;
              
              // Add new page if needed
              if (currentY > pageHeight - margin - 40) {
                pdf.addPage();
                currentY = margin;
                
                // Re-add headers on new page
                pdf.setFillColor(240, 240, 240);
                pdf.rect(margin, currentY - 15, pageWidth - 2 * margin, 20, 'F');
                
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.text("Instructor", margin + 5, currentY);
                pdf.text("Course", margin + 180, currentY);
                pdf.text("Enrollments", margin + 380, currentY);
                
                currentY += 15;
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
              }
            });
          });
          
          // Add chart on a new page
          try {
            const chartCanvas = document.querySelector('.instructor-chart canvas');
            if (chartCanvas) {
              pdf.addPage();
              currentY = margin;
              
              pdf.setFontSize(14);
              pdf.text("Instructor Performance Chart", margin, currentY);
              currentY += 30;
              
              const chartImg = chartCanvas.toDataURL('image/png');
              const imgWidth = pageWidth - (margin * 2);
              const imgHeight = imgWidth * 0.6;
              
              pdf.addImage(chartImg, 'PNG', margin, currentY, imgWidth, imgHeight);
            }
          } catch (chartError) {
            console.error("Could not add instructor chart to PDF:", chartError);
          }
        } else {
          pdf.text("No instructor data available.", margin, currentY);
        }
      }
      else if (activeReport === 'enrollment' && enrollmentTrendData) {
        // ENROLLMENT REPORT
        const months = enrollmentTrendData.months || [];
        const courses = enrollmentTrendData.courses || [];
        // You may add PDF export logic for enrollment trends here if needed
        pdf.text("Enrollment Trends PDF export not implemented.", margin, currentY);
      }
      else if (activeReport === 'users' && userBaseData) {
        // USERS REPORT
        const studentCount = userBaseData.studentCount || 0;
        const instructorCount = userBaseData.instructorCount || 0;
        const courseCount = userBaseData.courseCount || 0;
        
        // Add table header
        pdf.setFontSize(14);
        pdf.text("User Base Overview", margin, currentY);
        currentY += 25;
        
        // Create table headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, currentY - 15, pageWidth - 2 * margin, 20, 'F');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text("User Type", margin + 5, currentY);
        pdf.text("Count", margin + 280, currentY);
        
        currentY += 10;
        
        // Draw table content
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Student row
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
        pdf.text("Students", margin + 5, currentY + 5);
        pdf.text(`${studentCount}`, margin + 280, currentY + 5);
        currentY += 20;
        
        // Instructor row
        pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
        pdf.text("Instructors", margin + 5, currentY + 5);
        pdf.text(`${instructorCount}`, margin + 280, currentY + 5);
        currentY += 20;
        
        // Course row
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
        pdf.text("Total Courses", margin + 5, currentY + 5);
        pdf.text(`${courseCount}`, margin + 280, currentY + 5);
        currentY += 40;
        
        // Add summary text
        pdf.setFontSize(11);
        pdf.text(`The system currently has ${studentCount} students and ${instructorCount} instructors registered.`, 
                 margin, currentY);
        currentY += 20;
        pdf.text(`There are ${courseCount} courses available in the system.`, 
                 margin, currentY);
        
        // Add chart on a new page
        try {
          const chartCanvas = document.querySelector('.users-chart canvas');
          if (chartCanvas) {
            pdf.addPage();
            currentY = margin;
            
            pdf.setFontSize(14);
            pdf.text("User Distribution Chart", margin, currentY);
            currentY += 30;
            
            const chartImg = chartCanvas.toDataURL('image/png');
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = imgWidth * 0.6;
            
            pdf.addImage(chartImg, 'PNG', margin, currentY, imgWidth, imgHeight);
          }
        } catch (chartError) {
          console.error("Could not add user chart to PDF:", chartError);
        }
      }
      else {
        // No data available for selected report
        pdf.setFontSize(14);
        pdf.text(`No data available for ${activeReport} report. Please check your data and try again.`, margin, currentY);
      }
      
      // Add page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 60, pageHeight - margin);
      }
      
      // Save the PDF with the correct report name
      pdf.save(`${activeReport}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setExportLoading(false);
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

  // Get chart instance by selector
  const getChartInstance = (selector) => {
    const canvas = document.querySelector(selector);
    if (!canvas) return null;
    
    return window.Chart?.getChart(canvas) || null;
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
            The total revenue for the period is <strong>LKR {(totalRevenue || 0).toFixed(2)}</strong>.
          </p>
        </div>
        
        {/* Revenue Chart with specific class name for PDF export */}
        <div className="chart-container revenue-chart">
          <Bar 
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              animation: false, // Disable animations for more reliable capture
            }}
          />
        </div>
        
        <div className="data-table">
          <h4>Revenue Details</h4>
          <table className="table revenue-table">
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
                  <td>LKR {(course.revenue || 0).toFixed(2)}</td>
                  <td>{course.enrollments || 0}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td><strong>Total</strong></td>
                <td><strong>LKR {(totalRevenue || 0).toFixed(2)}</strong></td>
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
        
        <div className="chart-container instructor-chart">
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
            <table className="table instructor-table">
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
    
    console.log("Enrollment chart data:", { months, courses });
    courses.forEach((course, i) => {
      console.log(`Course ${course.name} enrollments:`, course.enrollments);
    });
    
    const lineData = {
      labels: months,
      datasets: courses.map((course, index) => {
        // Ensure enrollment data is an array and has values
        const enrollmentData = Array.isArray(course.enrollments) ? 
          course.enrollments : 
          months.map(() => 0); // Default to zeros if no data
          
        // Debug log to help troubleshoot
        console.log(`${course.name} enrollment data:`, enrollmentData);
        
        return {
          label: course.name || 'Unknown Course',
          data: enrollmentData,
          borderColor: getColorByIndex(index),
          backgroundColor: getColorByIndex(index, 0.1),
          tension: 0.1,
          fill: false,
          // Force points to be visible even if value is zero
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2,
          pointBackgroundColor: getColorByIndex(index), // Solid color points
          pointBorderColor: '#fff', // White border around points
          pointBorderWidth: 1
        };
      })
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
        
        <div className="chart-container enrollment-chart">
          <Line 
            data={lineData}
            options={{
              responsive: true,
              animation: false, // Disable animations for better rendering
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Enrollment Trends (Last 6 Months)'
                },
                tooltip: {
                  intersect: false,
                  mode: 'index'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  // IMPORTANT: Set fixed minimum and maximum to ensure values are visible
                  min: -0.2,  // Slightly below zero to give space
                  max: 3,     // Set a fixed maximum to give enough scale
                  ticks: {
                    // Force y-axis to show specific values
                    callback: function(value) {
                      if (value === 0 || value === 1 || value === 2) {
                        return value;
                      }
                    },
                    stepSize: 1
                  },
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
              },
              elements: {
                point: {
                  radius: 6,           // Increased from 4 to 6
                  borderWidth: 2,      // Add border to make points more visible
                  hoverRadius: 8,      // Larger on hover
                  backgroundColor: function(context) {
                    // Make points have solid fill color to stand out
                    const index = context.dataIndex;
                    const value = context.dataset.data[index];
                    if (value === 0 || value === 1) {
                      return context.dataset.borderColor;
                    }
                    return context.dataset.backgroundColor;
                  }
                },
                line: {
                  tension: 0.1,
                  borderWidth: 2       // Thicker lines
                }
              }
            }}
          />
        </div>
        
        <div className="data-table">
          <h4>Monthly Enrollment Data</h4>
          <table className="table enrollment-table">
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
        
        <div className="chart-container users-chart" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Bar
            data={{
              labels: ['Students per Course', 'Students per Instructor', 'Courses per Instructor'],
              datasets: [
                {
                  data: [
                    (studentCount / courseCount).toFixed(2),
                    (studentCount / instructorCount).toFixed(2),
                    (courseCount / instructorCount).toFixed(2)
                  ],
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                  ],
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                },
                title: {
                  display: true,
                  text: 'System Utilization Metrics'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Value'
                  }
                }
              }
            }}
            height={300}
            width={500}
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
        
        <div className="data-table">
          <h4>User Base Details</h4>
          <table className="table users-table">
            <thead>
              <tr>
                <th>User Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Students</td>
                <td>{studentCount}</td>
              </tr>
              <tr>
                <td>Instructors</td>
                <td>{instructorCount}</td>
              </tr>
              <tr>
                <td>Total Courses</td>
                <td>{courseCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Add this function to your component
  const exportUserBaseReport = async () => {
    try {
      setExportLoading(true);
      console.log("Starting User Base PDF export");
      
      // Get the current user base data
      console.log("User base data:", userBaseData);
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      
      // Add report title and date
      pdf.setFontSize(18);
      pdf.text("", margin, margin);
      pdf.setFontSize(14);
      pdf.text("User Base Report", margin, margin + 30);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 50);
      
      let currentY = margin + 70;
      
      // Process user data
      if (userBaseData) {
        // Get counts with fallback to 0 if properties don't exist
        const studentCount = userBaseData.studentCount || 0;
        const instructorCount = userBaseData.instructorCount || 0; 
        const courseCount = userBaseData.courseCount || 0;
        
        // Add table header
        pdf.setFontSize(14);
        pdf.text("User Base Overview", margin, currentY);
        currentY += 25;
        
        // Create table headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, currentY - 15, pageWidth - 2 * margin, 20, 'F');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text("User Type", margin + 5, currentY);
        pdf.text("Count", margin + 280, currentY);
        
        currentY += 10;
        
        // Draw table content
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        
        // Student row
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
        pdf.setTextColor(0, 0, 0); // Ensure text is black
        pdf.text("Students", margin + 5, currentY + 5);
        pdf.text(`${studentCount}`, margin + 280, currentY + 5);
        currentY += 20;
        
        // Instructor row - FIXED: Make sure this is visible
        pdf.setFillColor(255, 255, 255); // White background instead of default
        pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
        pdf.setTextColor(0, 0, 0); // Ensure text is black
        pdf.text("Instructors", margin + 5, currentY + 5);
        pdf.text(`${instructorCount}`, margin + 280, currentY + 5);
        currentY += 20;
        
        // Course row
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, currentY - 5, pageWidth - 2 * margin, 20, 'F');
        pdf.setTextColor(0, 0, 0); // Ensure text is black
        pdf.text("Total Courses", margin + 5, currentY + 5);
        pdf.text(`${courseCount}`, margin + 280, currentY + 5);
        currentY += 40;
        
        // Add summary text
        pdf.setTextColor(0, 0, 0); // Ensure text is black
        pdf.setFontSize(11);
        pdf.text(`The system currently has ${studentCount} students and ${instructorCount} instructors registered.`, 
                 margin, currentY);
        currentY += 20;
        pdf.text(`There are ${courseCount} courses available in the system.`, 
                 margin, currentY);
        
        // Try to add the pie chart
        try {
          const chartCanvas = document.querySelector('.users-chart canvas');
          if (chartCanvas) {
            // Give chart time to render if needed
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Get chart image
            const chartImg = chartCanvas.toDataURL('image/png');
            
            pdf.addPage();
            currentY = margin;
            
            pdf.setFontSize(14);
            pdf.text("User Distribution Chart", margin, currentY);
            currentY += 30;
            
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = imgWidth * 0.6;
            
            pdf.addImage(chartImg, 'PNG', margin, currentY, imgWidth, imgHeight);
          }
        } catch (chartError) {
          console.error("Could not add user chart to PDF:", chartError);
        }
      } else {
        // No user data available
        pdf.setFontSize(14);
        pdf.text("No user base data available. Please check your data and try again.", margin, currentY);
      }
      
      // Add page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 60, pageHeight - margin);
      }
      
      // Save the PDF
      pdf.save(`users-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error generating User Base PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    if (activeReport === 'revenue') {
      console.log("Revenue data for rendering:", revenueData);
    } else if (activeReport === 'instructor') {
      console.log("Instructor data for rendering:", instructorData);
    } else if (activeReport === 'enrollment') {
      console.log("Enrollment data for rendering:", enrollmentTrendData);
    } else if (activeReport === 'users') {
      console.log("User data for rendering:", userBaseData);
    }
  }, [activeReport, revenueData, instructorData, enrollmentTrendData, userBaseData]);

  return (
    <AdminLayout>
      <div className="admin-reports-container">
        <div className="reports-header">
          <h2>Administrative Reports</h2>
          <p>View and analyze system performance metrics</p>
        </div>
        
        <div className="reports-tabs">
          <div className={`report-tab ${activeReport === 'revenue' ? 'active' : ''}`} onClick={() => setActiveReport('revenue')}>
            Revenue Report
          </div>
          <div className={`report-tab ${activeReport === 'instructor' ? 'active' : ''}`} onClick={() => setActiveReport('instructor')}>
            Instructor Performance
          </div>
          <div className={`report-tab ${activeReport === 'enrollment' ? 'active' : ''}`} onClick={() => setActiveReport('enrollment')}>
            Enrollment Trends
          </div>
          <div className={`report-tab ${activeReport === 'users' ? 'active' : ''}`} onClick={() => setActiveReport('users')}>
            User Base
          </div>
        </div>
        
        {/* Report content section - where the actual reports are displayed */}
        <div id="report-content" className="report-content">
          {activeReport === 'revenue' && renderRevenueReport()}
          {activeReport === 'instructor' && renderInstructorReport()}
          {activeReport === 'enrollment' && renderEnrollmentTrendsReport()}
          {activeReport === 'users' && renderUserBaseReport()}
        </div>
        
        {/* ONLY ONE export options section */}
        <div className="export-options">
          <h3>Export Options</h3>
          <div className="export-buttons">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                console.log("Export button clicked, active report:", activeReport);
                if (activeReport === 'users') {
                  exportUserBaseReport();
                } else {
                  exportAsPDF();
                }
              }}
              disabled={exportLoading}
            >
              {exportLoading ? "Generating PDF..." : "Export as PDF"}
            </button>
            <button 
              className="btn btn-success" 
              onClick={() => exportAsCSV()}
            >
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;