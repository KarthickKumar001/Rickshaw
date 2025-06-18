const Razorpay = require('razorpay');
const crypto = require('crypto');
const Ride = require('../models/ride.model');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new payment order
exports.createPayment = async (req, res) => {
    try {
        const { rideId } = req.params;
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.status !== 'completed') {
            return res.status(400).json({ message: 'Ride must be completed before payment' });
        }

        if (ride.payment.status === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: ride.fare * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `ride_${rideId}`,
            notes: {
                rideId: rideId
            }
        });

        // Update ride with order ID
        ride.payment.razorpayOrderId = order.id;
        ride.payment.status = 'processing';
        await ride.save();

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

// Verify and complete payment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            rideId
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update ride payment details
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.payment.status = 'completed';
        ride.payment.razorpayPaymentId = razorpay_payment_id;
        ride.payment.razorpaySignature = razorpay_signature;
        ride.payment.paymentDate = new Date();
        await ride.save();

        res.status(200).json({
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { rideId } = req.params;
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json({
            status: ride.payment.status,
            amount: ride.fare,
            paymentId: ride.payment.razorpayPaymentId,
            paymentDate: ride.payment.paymentDate
        });
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ message: 'Error fetching payment status', error: error.message });
    }
}; 