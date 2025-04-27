// Initialize Express app and set up routes
const express = require('express');
const path = require('path');
const cors = require('cors');  // Import the cors package
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import other route files here
const forumRoutes = require('./routes/forumRoutes'); // Import the combined forum routes
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Import the upload routes

const app = express();

// Enable CORS for all routes
app.use(cors());  // This will allow requests from all origins

// Alternatively, you can restrict CORS to specific origins like this:
// app.use(cors({
//     origin: 'http://localhost:5173',  // Your React app's URL
// }));

app.use(express.json());

// Use the route files
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/uploads', uploadRoutes); // Add the upload routes

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// The "catchall" handler: for any request that doesn't match one above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

module.exports = app;