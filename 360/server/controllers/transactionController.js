const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { sendSMSAlert } = require('./twilioController');
const logger = require('../utils/logger');

// Active cooling periods stored in memory
const coolingPeriods = {};

// POST /api/transaction/flag
const flagTransaction = async (req, res) => {
  try {
    const { seniorPhone, amount, bankName, accountNumber } = req.body;

    if (!seniorPhone || !amount) {
      return res.status(400).json({ success: false, message: 'seniorPhone and amount required' });
    }

    const senior = await User.findOne({ phone: seniorPhone, role: 'senior' });
    if (!senior) {
      return res.status(404).json({ success: false, message: 'Senior not found' });
    }

    // High risk if amount > 10000
    const isHighRisk = amount >= 10000;
    const coolingMinutes = 30;
    const coolingUntil = new Date(Date.now() + coolingMinutes * 60 * 1000);

    if (isHighRisk) {
      // Store cooling period
      coolingPeriods[seniorPhone] = coolingUntil;

      // Save alert
      await Alert.create({
        seniorPhone: senior.phone,
        guardianPhone: senior.guardianPhone,
        type: 'TRANSACTION_FLAG',
        riskScore: 90,
        details: `High-risk transaction of ₹${amount} flagged. Cooling period: 30 mins.`
      });

      // Update incident
      await Incident.findOneAndUpdate(
        { seniorPhone: senior.phone, status: 'OPEN' },
        { transactionAmount: amount, transactionFrozen: true },
        { new: true }
      );

      // Alert guardian via Socket.io
      const io = req.app.get('io');
      io.to(senior.guardianPhone).emit('transaction-flagged', {
        seniorName: senior.name,
        amount,
        bankName,
        coolingUntil,
        message: `⚠️ Transaction of ₹${amount} FROZEN for 30 minutes. Guardian approval required.`
      });

      // Send SMS
      await sendSMSAlert(
        senior.guardianPhone,
        senior.name,
        `TRANSACTION FREEZE — ₹${amount} blocked`
      );

      logger.warn(`Transaction FROZEN for ${senior.name}: ₹${amount}`);

      return res.status(200).json({
        success: true,
        frozen: true,
        message: `Transaction of ₹${amount} has been frozen for 30 minutes. Guardian approval required.`,
        coolingUntil,
        requiresApproval: true
      });
    }

    res.status(200).json({
      success: true,
      frozen: false,
      message: 'Transaction amount is within safe limits.',
      requiresApproval: false
    });

  } catch (error) {
    logger.error(`flagTransaction error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/transaction/approve
const approveTransaction = async (req, res) => {
  try {
    const { seniorPhone, guardianPhone } = req.body;

    // Verify guardian
    const guardian = await User.findOne({ phone: guardianPhone, role: 'guardian' });
    if (!guardian) {
      return res.status(403).json({ success: false, message: 'Only guardian can approve' });
    }

    // Remove cooling period
    delete coolingPeriods[seniorPhone];

    const io = req.app.get('io');
    io.to(guardianPhone).emit('transaction-approved', {
      seniorPhone,
      approvedBy: guardian.name,
      timestamp: new Date()
    });

    logger.success(`Transaction approved by guardian: ${guardian.name}`);
    res.status(200).json({ success: true, message: 'Transaction approved by guardian' });

  } catch (error) {
    logger.error(`approveTransaction error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { flagTransaction, approveTransaction };