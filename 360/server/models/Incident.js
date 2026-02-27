const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  seniorPhone: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  alertType: { type: String, required: true },
  riskScore: { type: Number, default: 0 },
  callerDetails: { type: String, default: 'Unknown' },
  transactionAmount: { type: Number, default: 0 },
  transactionFrozen: { type: Boolean, default: false },
  resolvedBy: { type: String, default: 'system' },
  status: {
    type: String,
    enum: ['OPEN', 'RESOLVED', 'ESCALATED'],
    default: 'OPEN'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', incidentSchema);