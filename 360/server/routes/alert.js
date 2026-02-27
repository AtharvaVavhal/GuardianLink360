const express = require('express');
const router = express.Router();
const { triggerPanic, verifyCaller, getAlertHistory } = require('../controllers/alertController');

// POST /api/alert/panic
router.post('/panic', triggerPanic);

// POST /api/alert/verify-caller
router.post('/verify-caller', verifyCaller);

// GET /api/alert/history/:seniorPhone
router.get('/history/:seniorPhone', getAlertHistory);

module.exports = router;