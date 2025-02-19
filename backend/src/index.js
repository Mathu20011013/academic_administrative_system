// backend/src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(bodyParser.json()); // Parse incoming requests with JSON payloads

app.use('/api/auth', authRoutes); // Handle authentication requests

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
