const express = require('express');
const router = express.Router();
const { getGuardianAlerts, getIncidents, getStats, resolveIncident } = require('../controllers/dashboardController');

// GET /api/dashboard/alerts/:guardianPhone
router.get('/alerts/:guardianPhone', getGuardianAlerts);

// GET /api/dashboard/incidents/:guardianPhone
router.get('/incidents/:guardianPhone', getIncidents);

// GET /api/dashboard/stats/:guardianPhone
router.get('/stats/:guardianPhone', getStats);

// POST /api/dashboard/resolve/:incidentId  ← used by GuardianDashboard
router.post('/resolve/:incidentId', resolveIncident);

module.exports = router;