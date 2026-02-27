const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { sendSMSAlert, sendWhatsAppAlert } = require('./twilioController');
const logger = require('../utils/logger');

// POST /api/alert/panic
const triggerPanic = async (req, res) => {
  try {
    const { seniorPhone } = req.body;

    if (!seniorPhone) {
      return res.status(400).json({ success: false, message: 'seniorPhone is required' });
    }

    // 1. Find senior
    const senior = await User.findOne({ phone: seniorPhone, role: 'senior' });
    if (!senior) {
      return res.status(404).json({ success: false, message: 'Senior not found' });
    }

    // 2. Save alert to MongoDB
    const alert = await Alert.create({
      seniorPhone: senior.phone,
      guardianPhone: senior.guardianPhone,
      type: 'PANIC',
      riskScore: 100,
      details: 'PANIC button manually triggered by senior citizen'
    });

    // 3. Save incident
    await Incident.create({
      seniorPhone: senior.phone,
      guardianPhone: senior.guardianPhone,
      alertType: 'PANIC',
      riskScore: 100,
      status: 'OPEN'
    });

    // 4. Send SMS + WhatsApp
    await sendSMSAlert(senior.guardianPhone, senior.name, 'PANIC');
    await sendWhatsAppAlert(senior.guardianPhone, senior.name, 'PANIC');

    // 5. Emit real-time Socket.io event to guardian dashboard
    const io = req.app.get('io');
    io.to(senior.guardianPhone).emit('panic-alert', {
      seniorName: senior.name,
      seniorPhone: senior.phone,
      alertId: alert._id,
      riskScore: 100,
      type: 'PANIC',
      timestamp: new Date()
    });

    logger.success(`PANIC alert triggered for ${senior.name}`);
    res.status(200).json({ success: true, message: 'PANIC alert sent', alert });

  } catch (error) {
    logger.error(`triggerPanic error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/alert/verify-caller
const verifyCaller = async (req, res) => {
  try {
    const { seniorPhone, callerName, callerBadge, callerDepartment } = req.body;

    if (!seniorPhone || !callerName) {
      return res.status(400).json({ success: false, message: 'seniorPhone and callerName required' });
    }

    // Simulate fake officer database check
    const knownScamPhrases = [
      'cbi', 'narcotics', 'digital arrest', 'cyber crime',
      'money laundering', 'ied', 'enforcement directorate'
    ];

    const isScam = knownScamPhrases.some(phrase =>
      callerName.toLowerCase().includes(phrase) ||
      (callerDepartment && callerDepartment.toLowerCase().includes(phrase))
    );

    const result = {
      isVerified: !isScam,
      riskScore: isScam ? 95 : 10,
      message: isScam
        ? '⚠️ WARNING: This caller matches known scam patterns. NO legitimate officer will call like this.'
        : '✅ No immediate red flags. But stay cautious — real officers never demand money on calls.'
    };

    // Save alert if scam detected
    if (isScam) {
      const senior = await User.findOne({ phone: seniorPhone });
      if (senior) {
        await Alert.create({
          seniorPhone: senior.phone,
          guardianPhone: senior.guardianPhone,
          type: 'VERIFY_CALLER',
          riskScore: 95,
          details: `Suspicious caller: ${callerName} from ${callerDepartment}`
        });

        const io = req.app.get('io');
        io.to(senior.guardianPhone).emit('scam-detected', {
          seniorName: senior.name,
          callerName,
          callerDepartment,
          riskScore: 95,
          timestamp: new Date()
        });

        await sendSMSAlert(senior.guardianPhone, senior.name, 'SUSPICIOUS CALLER DETECTED');
      }
    }

    res.status(200).json({ success: true, ...result });

  } catch (error) {
    logger.error(`verifyCaller error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/alert/history/:seniorPhone
const getAlertHistory = async (req, res) => {
  try {
    const { seniorPhone } = req.params;
    const alerts = await Alert.find({ seniorPhone }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    logger.error(`getAlertHistory error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { triggerPanic, verifyCaller, getAlertHistory };