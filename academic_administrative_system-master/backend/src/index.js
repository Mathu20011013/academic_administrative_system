const app = require('./app');
const db = require('./config/db');

// Load environment variables from .env
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
