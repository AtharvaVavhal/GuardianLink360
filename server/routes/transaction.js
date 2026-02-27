const express = require('express');
const router = express.Router();
const { flagTransaction, approveTransaction } = require('../controllers/transactionController');

// POST /api/transaction/flag
router.post('/flag', flagTransaction);

// POST /api/transaction/approve
router.post('/approve', approveTransaction);

module.exports = router;