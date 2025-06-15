const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it's modified (or new)
        if (!this.isModified('password')) return next();

        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        console.log('Generated salt:', salt);

        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(this.password, salt);
        console.log('Original password:', this.password);
        console.log('Hashed password:', hashedPassword);

        // Replace the plain text password with the hash
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing passwords:');
        console.log('Stored hash:', this.password);
        console.log('Input password:', candidatePassword);
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;