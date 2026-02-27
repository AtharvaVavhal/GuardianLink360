const User = require('../models/User');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

// In-memory OTP store: { phone -> { otp, expiresAt } }
// For production, move this to Redis or MongoDB
const otpStore = new Map();

// ── Helper: generate 6-digit OTP ──────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: sign JWT ───────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_change_this',
    { expiresIn: '30d' }
  );

// ── Helper: send OTP via Twilio SMS ───────────────────────
const sendOTPviaSMS = async (phone, otp) => {
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `Your ShieldSenior login code is: ${otp}\n\nThis code expires in 10 minutes. Do NOT share it with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

// ───────────────────────────────────────────────────────────
// POST /api/auth/otp/request
// Body: { phone: "+911234567890" }
// ───────────────────────────────────────────────────────────
const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'phone is required' });
    }

    // Check user exists
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not registered. Please ask your guardian to register you first.',
      });
    }

    // Generate OTP + store with 10-min expiry
    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send via Twilio
    await sendOTPviaSMS(phone, otp);

    logger.success(`OTP sent to ${phone}`);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    logger.error(`requestOTP error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Could not send OTP. Please try again.' });
  }
};

// ───────────────────────────────────────────────────────────
// POST /api/auth/otp/verify
// Body: { phone: "+911234567890", otp: "123456" }
// ───────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'phone and otp are required' });
    }

    // Check OTP exists in store
    const record = otpStore.get(phone);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this number. Please request a new code.' });
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
    }

    // Check code matches
    if (record.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Wrong code. Please check and try again.' });
    }

    // Valid — clear OTP and return JWT
    otpStore.delete(phone);

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const token = signToken(user);

    logger.success(`${user.role} verified OTP and logged in: ${user.name}`);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        guardianPhone: user.guardianPhone,
      },
    });

  } catch (error) {
    logger.error(`verifyOTP error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ───────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, phone, role, guardianPhone?, linkedSeniorPhone? }
// ───────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, phone, role, guardianPhone, linkedSeniorPhone } = req.body;

    if (!name || !phone || !role) {
      return res.status(400).json({ success: false, message: 'name, phone, role are required' });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const user = await User.create({
      name,
      phone,
      role,
      guardianPhone: guardianPhone || null,
      linkedSeniorPhone: linkedSeniorPhone || null,
    });

    logger.success(`New ${role} registered: ${name} (${phone})`);
    res.status(201).json({ success: true, message: 'Registered successfully', user });

  } catch (error) {
    logger.error(`register error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ───────────────────────────────────────────────────────────
// POST /api/auth/login  (Guardian login — password or simple)
// Body: { phone }
// ───────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'phone is required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    const token = signToken(user);

    logger.success(`${user.role} logged in: ${user.name}`);
    res.status(200).json({ success: true, message: 'Login successful', token, user });

  } catch (error) {
    logger.error(`login error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/user/:phone
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error(`getUser error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getUser, requestOTP, verifyOTP };