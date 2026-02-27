const axios = require('axios');
const logger = require('./logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

const detectScam = async (text) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/analyze`, {
      transcript: text  // P4 uses "transcript" not "text"
    }, {
      timeout: 5000
    });

    const data = response.data;

    const riskScore = data.risk_score ?? 50;
    const isScam = data.is_scam ?? false;
    const reason = data.reason ?? data.verdict ?? 'No reason provided';

    logger.success(`ML detection complete — Risk: ${riskScore}, Scam: ${isScam}`);

    return { riskScore, isScam, reason };

  } catch (error) {
    logger.error(`ML service unreachable: ${error.message}`);
    return {
      riskScore: 50,
      isScam: false,
      reason: 'ML service unavailable — using default score'
    };
  }
};

const fullShieldCheck = async (transcript, amount = 0, callDuration = 0) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/shield`, {
      transcript,
      amount,
      call_duration: callDuration
    }, {
      timeout: 5000
    });

    return response.data;

  } catch (error) {
    logger.error(`ML shield check failed: ${error.message}`);
    return null;
  }
};

module.exports = { detectScam, fullShieldCheck };
