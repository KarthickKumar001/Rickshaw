const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vault.controller');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Basic vault operations
router.post('/add', vaultController.addMoney);
router.get('/balance', vaultController.getBalance);
router.get('/transactions', vaultController.getTransactionHistory);
router.get('/transactions/stats', vaultController.getTransactionStats);
router.get('/transactions/:transactionId', vaultController.getTransactionDetails);

// Ride-related operations
router.post('/hold', vaultController.holdMoneyForRide);
router.post('/release/:rideId', vaultController.releaseMoneyToDriver);
router.post('/refund/:rideId', vaultController.refundCancelledRide);

module.exports = router; 