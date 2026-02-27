const express = require('express');
const router = express.Router();
const { register, login, getUser } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/user/:phone
router.get('/user/:phone', getUser);

module.exports = router;