const express = require('express');
const router = express.Router();
const { triggerPanic, verifyCaller, getAlertHistory, scamCheck } = require('../controllers/alertController');

// POST /api/alert/panic
router.post('/panic', triggerPanic);

// POST /api/alert/verify-caller
router.post('/verify-caller', verifyCaller);

// POST /api/alert/scam-check  ← used by ScamChecklist.jsx
router.post('/scam-check', scamCheck);

// GET /api/alert/history/:seniorPhone
router.get('/history/:seniorPhone', getAlertHistory);

module.exports = router;