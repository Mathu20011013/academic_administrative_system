//defining routes for signup and login
const express = require('express'); //import express.js library
const { signup, login } = require('../controllers/authController'); //import signup and login functions from authController.js

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
