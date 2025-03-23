const app = require('./app');

const PORT = process.env.PORT || 5001; // Change the port number here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
