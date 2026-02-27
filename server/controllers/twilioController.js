const logger = require('../utils/logger');

// ───────────────────────────────────────────────────────────
// Send SMS panic alert to guardian
// Called by alertController when senior hits PANIC
// ───────────────────────────────────────────────────────────
const sendSMSAlert = async (guardianPhone, seniorName, alertType) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `🚨 GUARDIANLINK360 ALERT: ${seniorName} triggered a ${alertType} alert. Login to your dashboard immediately.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: guardianPhone,
    });

    logger.success(`SMS alert sent to guardian: ${guardianPhone}`);
    return true;

  } catch (error) {
    logger.error(`SMS alert failed: ${error.message}`);
    return false;
  }
};

// ───────────────────────────────────────────────────────────
// Send WhatsApp panic alert to guardian
// ───────────────────────────────────────────────────────────
const sendWhatsAppAlert = async (guardianPhone, seniorName, alertType) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `🚨 *GUARDIANLINK360 ALERT*\n\n*${seniorName}* triggered a *${alertType}* alert.\n\nLogin to your dashboard immediately.\n\nTime: ${new Date().toLocaleString('en-IN')}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${guardianPhone}`,
    });

    logger.success(`WhatsApp alert sent to guardian: ${guardianPhone}`);
    return true;

  } catch (error) {
    logger.error(`WhatsApp alert failed: ${error.message}`);
    return false;
  }
};

module.exports = { sendSMSAlert, sendWhatsAppAlert };