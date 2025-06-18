const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain'
    },
    pickup: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['auto', 'car', 'moto'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'price_negotiation', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        razorpayOrderId: {
            type: String
        },
        razorpayPaymentId: {
            type: String
        },
        razorpaySignature: {
            type: String
        },
        amount: {
            type: Number
        },
        currency: {
            type: String,
            default: 'INR'
        },
        paymentMethod: {
            type: String,
            enum: ['razorpay', 'cash'],
            default: 'razorpay'
        },
        paymentDate: {
            type: Date
        }
    },
    activeNegotiations: [{
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Captain',
            required: true
        },
        requestedAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    priceNegotiationHistory: [{
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Captain'
        },
        requestedAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
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

// Add indexes for better query performance
rideSchema.index({ status: 1, 'activeNegotiations.status': 1 });
rideSchema.index({ 'activeNegotiations.captain': 1 });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;