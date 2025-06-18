const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

// Create payment order
router.post('/create/:rideId', authenticate, paymentController.createPayment);

// Verify payment
router.post('/verify', authenticate, paymentController.verifyPayment);

// Get payment status
router.get('/status/:rideId', authenticate, paymentController.getPaymentStatus);

module.exports = router; 