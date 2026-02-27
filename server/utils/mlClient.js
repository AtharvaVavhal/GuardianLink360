const axios = require('axios');
const logger = require('./logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * Call P4's Flask scam detection API
 * @param {string} text - call transcript or caller details
 * @returns {{ riskScore: number, isScam: boolean, reason: string }}
 */
const detectScam = async (text) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/detect`, {
      text
    }, {
      timeout: 5000 // 5 second timeout — don't let P4 slow down P3
    });

    const { riskScore, isScam, reason } = response.data;

    logger.success(`ML detection complete — Risk: ${riskScore}, Scam: ${isScam}`);

    return {
      riskScore: riskScore ?? 50,
      isScam: isScam ?? false,
      reason: reason ?? 'No reason provided'
    };

  } catch (error) {
    // If P4 is down, don't crash P3 — fallback gracefully
    logger.error(`ML service unreachable: ${error.message}`);
    return {
      riskScore: 50,
      isScam: false,
      reason: 'ML service unavailable — using default score'
    };
  }
};

module.exports = { detectScam };