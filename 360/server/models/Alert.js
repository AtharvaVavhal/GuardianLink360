const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  seniorPhone: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  type: {
    type: String,
    enum: ['PANIC', 'VERIFY_CALLER', 'SUSPICIOUS_CALL', 'TRANSACTION_FLAG'],
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED'],
    default: 'ACTIVE'
  },
  riskScore: { type: Number, default: 0 },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);