const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'support'],
        default: 'admin'
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_drivers', 'manage_rides', 'manage_admins', 'view_reports']
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin; 