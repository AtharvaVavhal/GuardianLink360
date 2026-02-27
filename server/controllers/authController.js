const User = require('../models/User');
const logger = require('../utils/logger');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, role, guardianPhone, linkedSeniorPhone } = req.body;

    if (!name || !phone || !role) {
      return res.status(400).json({ success: false, message: 'name, phone, role are required' });
    }

    // Check if already exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const user = await User.create({
      name,
      phone,
      role,
      guardianPhone: guardianPhone || null,
      linkedSeniorPhone: linkedSeniorPhone || null
    });

    logger.success(`New ${role} registered: ${name} (${phone})`);
    res.status(201).json({ success: true, message: 'Registered successfully', user });

  } catch (error) {
    logger.error(`register error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/login
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

    logger.success(`${user.role} logged in: ${user.name}`);
    res.status(200).json({ success: true, message: 'Login successful', user });

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

module.exports = { register, login, getUser };