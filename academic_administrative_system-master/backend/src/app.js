const express = require('express');
const path = require('path');
const cors = require('cors');  // Import the cors package
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const forumRoutes = require('./routes/forumRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const courseRoutes = require('./routes/courseRoutes'); // Add course routes
const submissionRoutes = require('./routes/submissionRoutes') // Add submission routes
const enrollmentRoutes = require('./routes/enrollmentRoutes'); // Add enrollment routes

const courseContentRoutes = require('./routes/courseContentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const classLinkRoutes = require('./routes/classLinkRoutes');
const courseRatingRoutes = require('./routes/courseRatingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const enrollmentController = require('./controllers/enrollmentController');
const adminReportRoutes = require('./routes/adminReportRoutes'); // Add this line with your other routes
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Use the route files
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/uploads', uploadRoutes); // Add the upload routes
app.use('/api/courses', courseRoutes); // Add course routes
app.use('/api/submission', submissionRoutes); // Add submission routes
app.use('/api/enrollments', enrollmentRoutes); // Add enrollment routes
app.use('/api/content', courseContentRoutes); // Add course content routes
app.use('/api/assignment', assignmentRoutes);
app.use('/api/classlink', classLinkRoutes);
app.use('/api/rating', courseRatingRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/materials', require('./routes/materialRoutes')); // Add materials routes
app.use('/api/admin/reports', adminReportRoutes); // Then register the route

app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);


// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build'))); // Ensure the correct path to React build

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get('*', (req, res) => {
  res.status(200).send('API server is running. Frontend needs to be served separately in development.');
});


// Only handle API routes, don't try to serve frontend files
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
  } else {
    res.status(200).send('API server is running. Frontend needs to be served separately in development.');
  }
});

module.exports = app;
