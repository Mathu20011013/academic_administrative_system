const db = require('../config/db');

// Get revenue report data
exports.getRevenueReport = (req, res) => {
  const timeFrame = req.query.timeFrame || 'month';
  
  let timeCondition;
  if (timeFrame === 'month') {
    timeCondition = "AND MONTH(p.payment_date) = MONTH(CURRENT_DATE()) AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())";
  } else if (timeFrame === 'quarter') {
    timeCondition = "AND p.payment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)";
  } else if (timeFrame === 'year') {
    timeCondition = "AND YEAR(p.payment_date) = YEAR(CURRENT_DATE())";
  }
  
  const query = `
    SELECT 
      c.course_id,
      c.course_name,
      SUM(p.amount) as revenue,
      COUNT(p.payment_id) as enrollments
    FROM payments p
    JOIN course c ON p.course_id = c.course_id
    WHERE p.payment_status = 'completed' ${timeCondition}
    GROUP BY c.course_id
    ORDER BY revenue DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching revenue report:", err);
      return res.status(500).json({ message: "Error fetching revenue report", error: err.message });
    }
    
    // Always initialize with default values
    let totalRevenue = 0;
    let totalEnrollments = 0;
    
    // Make sure results is an array before mapping
    const courses = Array.isArray(results) ? results.map(row => {
      const revenue = parseFloat(row.revenue) || 0;
      const enrollments = parseInt(row.enrollments) || 0;
      
      totalRevenue += revenue;
      totalEnrollments += enrollments;
      
      return {
        id: row.course_id,
        name: row.course_name || 'Unknown Course',
        revenue: revenue,
        enrollments: enrollments
      };
    }) : [];
    
    // Always return a properly structured response
    res.status(200).json({
      timeFrame,
      courses,
      totalRevenue,
      totalEnrollments
    });
  });
};

// Get instructor performance data
exports.getInstructorPerformance = (req, res) => {
  const query = `
    SELECT 
      i.instructor_id,
      u.username as instructor_name,
      c.course_id,
      c.course_name,
      COUNT(e.enrollment_id) as course_enrollments
    FROM instructor i
    JOIN user u ON i.user_id = u.user_id
    JOIN course c ON i.instructor_id = c.instructor_id
    LEFT JOIN enrollment e ON c.course_id = e.course_id
    GROUP BY i.instructor_id, c.course_id
    ORDER BY i.instructor_id, course_enrollments DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching instructor performance:", err);
      return res.status(500).json({ message: "Error fetching instructor performance", error: err.message });
    }
    
    // Process the results into the desired format
    const instructorsMap = new Map();
    let totalEnrollments = 0;
    
    results.forEach(row => {
      const enrollments = parseInt(row.course_enrollments);
      totalEnrollments += enrollments;
      
      if (!instructorsMap.has(row.instructor_id)) {
        instructorsMap.set(row.instructor_id, {
          id: row.instructor_id,
          name: row.instructor_name,
          totalEnrollments: 0,
          courses: []
        });
      }
      
      const instructor = instructorsMap.get(row.instructor_id);
      instructor.courses.push({
        id: row.course_id,
        name: row.course_name,
        enrollments: enrollments
      });
      
      instructor.totalEnrollments += enrollments;
    });
    
    // Convert Map to array and sort by total enrollments
    const instructors = Array.from(instructorsMap.values())
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments);
    
    res.status(200).json({
      instructors,
      totalEnrollments
    });
  });
};

// Get enrollment trends data
exports.getEnrollmentTrends = (req, res) => {
  const months = parseInt(req.query.months) || 6;
  
  const query = `
    SELECT 
      c.course_id,
      c.course_name,
      DATE_FORMAT(e.enrollment_date, '%Y-%m') as month,
      COUNT(e.enrollment_id) as enrollments
    FROM course c
    LEFT JOIN enrollment e ON c.course_id = e.course_id
    WHERE e.enrollment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${months} MONTH)
    GROUP BY c.course_id, month
    ORDER BY month, c.course_id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching enrollment trends:", err);
      return res.status(500).json({ message: "Error fetching enrollment trends", error: err.message });
    }
    
    // Get distinct courses and months
    const courseMap = new Map();
    const monthsSet = new Set();
    
    results.forEach(row => {
      const courseId = row.course_id;
      const month = row.month;
      
      monthsSet.add(month);
      
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          id: courseId,
          name: row.course_name,
          enrollmentsByMonth: {}
        });
      }
      
      courseMap.get(courseId).enrollmentsByMonth[month] = parseInt(row.enrollments);
    });
    
    // Sort months
    const sortedMonths = Array.from(monthsSet).sort();
    
    // Format data for chart
    const courses = Array.from(courseMap.values()).map(course => {
      const enrollments = sortedMonths.map(month => 
        course.enrollmentsByMonth[month] || 0
      );
      
      return {
        id: course.id,
        name: course.name,
        enrollments
      };
    });
    
    // Format month labels to be more readable
    const monthLabels = sortedMonths.map(monthStr => {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });
    
    res.status(200).json({
      months: monthLabels,
      courses
    });
  });
};

// Get user base overview
exports.getUserBaseOverview = (req, res) => {
  console.log("getUserBaseOverview called");
  
  const queries = {
    studentCount: "SELECT COUNT(*) as count FROM student",
    instructorCount: "SELECT COUNT(*) as count FROM instructor",
    courseCount: "SELECT COUNT(*) as count FROM course"
  };
  
  const data = {};
  
  // Execute all queries and collect results
  const promiseChain = Object.entries(queries).reduce(
    (chain, [key, query]) => chain.then(() => new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          return reject(err);
        }
        data[key] = results[0].count;
        resolve();
      });
    })),
    Promise.resolve()
  );
  
  // Send response after all queries are complete
  promiseChain
    .then(() => {
      console.log("Sending user base data:", data);
      res.status(200).json(data);
    })
    .catch(err => {
      console.error("Error fetching user base overview:", err);
      res.status(500).json({ message: "Error fetching user base data", error: err.message });
    });
};