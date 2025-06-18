const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['ride_payment', 'wallet_recharge', 'refund', 'driver_payment', 'cancellation_refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    },
    description: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['wallet', 'razorpay', 'cash'],
        default: 'wallet'
    },
    paymentDetails: {
        transactionId: String,
        paymentGateway: String,
        paymentDate: Date
    },
    metadata: {
        pickup: String,
        destination: String,
        distance: Number,
        duration: Number,
        vehicleType: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ ride: 1 });
transactionSchema.index({ type: 1, status: 1 });

// Method to get formatted transaction
transactionSchema.methods.toJSON = function() {
    const transaction = this.toObject();
    transaction.formattedAmount = `₹${transaction.amount.toFixed(2)}`;
    transaction.formattedDate = this.createdAt.toLocaleString();
    return transaction;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 