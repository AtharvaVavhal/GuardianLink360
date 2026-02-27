const express = require('express');
const router = express.Router();
const { register, login, getUser, requestOTP, verifyOTP } = require('../controllers/authController');

// ── OTP login (used by P1 Senior App) ─────────────────────
router.post('/otp/request', requestOTP);   // POST /api/auth/otp/request
router.post('/otp/verify', verifyOTP);     // POST /api/auth/otp/verify

// ── Standard routes ────────────────────────────────────────
router.post('/register', register);        // POST /api/auth/register
router.post('/login', login);              // POST /api/auth/login  (Guardian)
router.get('/user/:phone', getUser);       // GET  /api/auth/user/:phone

module.exports = router;