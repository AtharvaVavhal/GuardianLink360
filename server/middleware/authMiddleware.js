const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    const phone = req.headers['x-user-phone'];
    if (!phone) {
      return res.status(401).json({ success: false, message: 'No phone provided' });
    }
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Auth failed' });
  }
};

module.exports = { protect };