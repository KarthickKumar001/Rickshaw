const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rickshaw')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const captainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['auto', 'bike', 'car']
    },
    vehicleNumber: {
        type: String,
        required: true,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRides: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

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
        address: String,
        coordinates: {
            type: [Number],
            required: true
        }
    },
    destination: {
        address: String,
        coordinates: {
            type: [Number],
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'price_negotiation'],
        default: 'pending'
    },
    fare: {
        base: {
            type: Number,
            required: true
        },
        final: {
            type: Number
        },
        captainRequested: {
            type: Number
        }
    },
    distance: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['auto', 'bike', 'car'],
        required: true
    },
    priceNegotiationHistory: [{
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Captain'
        },
        requestedAmount: Number,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes
captainSchema.index({ currentLocation: '2dsphere' });
rideSchema.index({ 'pickup.coordinates': '2dsphere' });
rideSchema.index({ 'destination.coordinates': '2dsphere' });

// Create models
const User = mongoose.model('User', userSchema);
const Captain = mongoose.model('Captain', captainSchema);
const Ride = mongoose.model('Ride', rideSchema);

// Export models
module.exports = {
    User,
    Captain,
    Ride
}; 