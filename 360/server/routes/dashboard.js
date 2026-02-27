const express = require('express');
const router = express.Router();
const { getGuardianAlerts, getIncidents, getStats } = require('../controllers/dashboardController');

// GET /api/dashboard/alerts/:guardianPhone
router.get('/alerts/:guardianPhone', getGuardianAlerts);

// GET /api/dashboard/incidents/:guardianPhone
router.get('/incidents/:guardianPhone', getIncidents);

// GET /api/dashboard/stats/:guardianPhone
router.get('/stats/:guardianPhone', getStats);

module.exports = router;