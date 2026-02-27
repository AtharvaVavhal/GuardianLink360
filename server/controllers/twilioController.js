const logger = require('../utils/logger');

const sendSMSAlert = async (guardianPhone, seniorName, alertType) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `🚨 GURDIANLINK360 ALERT: ${seniorName} triggered a ${alertType} alert. Login to dashboard immediately at http://localhost:3000/guardian`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: guardianPhone
    });

    logger.success(`SMS sent to ${guardianPhone}`);
    return true;

  } catch (error) {
    logger.error(`SMS failed: ${error.message}`);
    return false;
  }
};

const sendWhatsAppAlert = async (guardianPhone, seniorName, alertType) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `🚨 *GURDIANLINK360 ALERT*\n\n*${seniorName}* triggered a *${alertType}* alert.\n\nLogin to dashboard immediately.\n\nTime: ${new Date().toLocaleString('en-IN')}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${guardianPhone}`
    });

    logger.success(`WhatsApp sent to ${guardianPhone}`);
    return true;

  } catch (error) {
    logger.error(`WhatsApp failed: ${error.message}`);
    return false;
  }
};

module.exports = { sendSMSAlert, sendWhatsAppAlert };