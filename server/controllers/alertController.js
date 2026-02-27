const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { sendSMSAlert, sendWhatsAppAlert } = require('./twilioController');
const { detectScam } = require('../utils/mlClient');
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

    // 2. Call P4 ML service for risk score
    const mlResult = await detectScam(`PANIC button triggered by senior citizen ${senior.name}`);

    // 3. Save alert to MongoDB
    const alert = await Alert.create({
      seniorPhone: senior.phone,
      guardianPhone: senior.guardianPhone,
      type: 'PANIC',
      riskScore: mlResult.riskScore || 100,
      details: `PANIC button manually triggered by senior citizen. ML Reason: ${mlResult.reason}`
    });

    // 4. Save incident
    await Incident.create({
      seniorPhone: senior.phone,
      guardianPhone: senior.guardianPhone,
      alertType: 'PANIC',
      riskScore: mlResult.riskScore || 100,
      status: 'OPEN'
    });

    // 5. Send SMS + WhatsApp
    await sendSMSAlert(senior.guardianPhone, senior.name, 'PANIC');
    await sendWhatsAppAlert(senior.guardianPhone, senior.name, 'PANIC');

    // 6. Emit real-time Socket.io event to guardian dashboard
    const io = req.app.get('io');
    io.to(senior.guardianPhone).emit('panic-alert', {
      seniorName: senior.name,
      seniorPhone: senior.phone,
      alertId: alert._id,
      riskScore: mlResult.riskScore || 100,
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

    // 1. Call P4 ML service with caller details
    const mlText = `Caller: ${callerName}, Department: ${callerDepartment || 'Unknown'}, Badge: ${callerBadge || 'Unknown'}`;
    const mlResult = await detectScam(mlText);

    // 2. Also run local keyword check as backup
    const knownScamPhrases = [
      'cbi', 'narcotics', 'digital arrest', 'cyber crime',
      'money laundering', 'ied', 'enforcement directorate'
    ];

    const localScamDetected = knownScamPhrases.some(phrase =>
      callerName.toLowerCase().includes(phrase) ||
      (callerDepartment && callerDepartment.toLowerCase().includes(phrase))
    );

    // 3. Combine ML + local detection (either one flags = scam)
    const isScam = mlResult.isScam || localScamDetected;
    const riskScore = isScam ? Math.max(mlResult.riskScore, 85) : mlResult.riskScore;

    const result = {
      isVerified: !isScam,
      riskScore,
      message: isScam
        ? '⚠️ WARNING: This caller matches known scam patterns. NO legitimate officer will call like this.'
        : '✅ No immediate red flags. But stay cautious — real officers never demand money on calls.'
    };

    // 4. Save alert if scam detected
    if (isScam) {
      const senior = await User.findOne({ phone: seniorPhone });
      if (senior) {
        await Alert.create({
          seniorPhone: senior.phone,
          guardianPhone: senior.guardianPhone,
          type: 'VERIFY_CALLER',
          riskScore,
          details: `Suspicious caller: ${callerName} from ${callerDepartment}. ML: ${mlResult.reason}`
        });

        const io = req.app.get('io');
        io.to(senior.guardianPhone).emit('scam-detected', {
          seniorName: senior.name,
          callerName,
          callerDepartment,
          riskScore,
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