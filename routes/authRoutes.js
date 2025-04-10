const express = require('express');
const router = express.Router();
const { registerUser, loginUser, registerAdmin } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/register-admin', registerAdmin);
router.post('/login', loginUser);

module.exports = router; 