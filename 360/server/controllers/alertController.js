const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const User = require('../models/User');
const logger = require('../utils/logger');

// GET /api/dashboard/alerts/:guardianPhone
const getGuardianAlerts = async (req, res) => {
  try {
    const { guardianPhone } = req.params;
    const alerts = await Alert
      .find({ guardianPhone: decodeURIComponent(guardianPhone) })
      .sort({ createdAt: -1 })
      .limit(50);
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
    const incidents = await Incident
      .find({ guardianPhone: decodeURIComponent(guardianPhone) })
      .sort({ createdAt: -1 })
      .limit(50);
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
    const phone = decodeURIComponent(guardianPhone);

    const [totalAlerts, activeAlerts, frozenTransactions, resolvedIncidents] = await Promise.all([
      Alert.countDocuments({ guardianPhone: phone }),
      Alert.countDocuments({ guardianPhone: phone, status: 'ACTIVE' }),
      Incident.countDocuments({ guardianPhone: phone, transactionFrozen: true }),
      Incident.countDocuments({ guardianPhone: phone, status: 'RESOLVED' }),
    ]);

    res.status(200).json({
      success: true,
      stats: { totalAlerts, activeAlerts, frozenTransactions, resolvedIncidents },
    });
  } catch (error) {
    logger.error(`getStats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/dashboard/resolve/:incidentId
const resolveIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const incident = await Incident.findByIdAndUpdate(
      incidentId,
      { status: 'RESOLVED', resolvedBy: 'guardian' },
      { new: true }
    );
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    logger.success(`Incident ${incidentId} resolved`);
    res.status(200).json({ success: true, incident });
  } catch (error) {
    logger.error(`resolveIncident error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getGuardianAlerts, getIncidents, getStats, resolveIncident };