const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const User = require('../models/User');
const logger = require('../utils/logger');

// GET /api/dashboard/alerts/:guardianPhone
const getGuardianAlerts = async (req, res) => {
  try {
    const { guardianPhone } = req.params;
    const alerts = await Alert.find({ guardianPhone })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    logger.error(`getGuardianAlerts error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/dashboard/incidents/:guardianPhone
const getIncidents = async (req, res) => {
  try {
    const { guardianPhone } = req.params;
    const incidents = await Incident.find({ guardianPhone })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, incidents });
  } catch (error) {
    logger.error(`getIncidents error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/dashboard/stats/:guardianPhone
const getStats = async (req, res) => {
  try {
    const { guardianPhone } = req.params;

    const totalAlerts = await Alert.countDocuments({ guardianPhone });
    const activeAlerts = await Alert.countDocuments({ guardianPhone, status: 'ACTIVE' });
    const frozenTransactions = await Incident.countDocuments({ guardianPhone, transactionFrozen: true });
    const resolvedIncidents = await Incident.countDocuments({ guardianPhone, status: 'RESOLVED' });

    res.status(200).json({
      success: true,
      stats: { totalAlerts, activeAlerts, frozenTransactions, resolvedIncidents }
    });
  } catch (error) {
    logger.error(`getStats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getGuardianAlerts, getIncidents, getStats };