const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
        enum: ['bike', 'auto', 'car']
    },
    vehicleNumber: {
        type: String,
        required: true,
        trim: true
    },
    socketId: {
        type: String,
    },
    status: {
        type: String,
        enum: [ 'active', 'inactive' ],
        default: 'inactive',
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
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
    documents: {
        license: String,
        vehicleRegistration: String,
        insurance: String
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Create index for geospatial queries
captainSchema.index({ currentLocation: '2dsphere' })

// Hash password before saving
captainSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it's modified (or new)
        if (!this.isModified('password')) return next()
        
        // Generate a salt
        const salt = await bcrypt.genSalt(10)
        console.log('Generated salt:', salt)
        
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(this.password, salt)
        console.log('Original password:', this.password)
        console.log('Hashed password:', hashedPassword)
        
        // Replace the plain text password with the hash
        this.password = hashedPassword
        next()
    } catch (error) {
        next(error)
    }
})

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    return token
}

// Method to compare passwords
captainSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing passwords:')
        console.log('Stored hash:', this.password)
        console.log('Input password:', candidatePassword)
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password)
        console.log('Password match:', isMatch)
        
        return isMatch
    } catch (error) {
        console.error('Password comparison error:', error)
        throw error
    }
}

const captainModel = mongoose.model('Captain', captainSchema)

module.exports = captainModel