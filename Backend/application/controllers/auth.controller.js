const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
};

// Register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        console.log('Registration - Original password:', password);

        const user = new User({
            name,
            email,
            password, // The model will hash this automatically
            phone,
        });

        const savedUser = await user.save();
        console.log('Registration - Saved hash:', savedUser.password);

        const token = generateToken(savedUser._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                phone: savedUser.phone,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Login - Original password:', password);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login - User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login - Stored hash:', user.password);
        
        // Use the model's comparePassword method
        const isMatch = user.comparePassword(password);
        console.log('Login - Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Register captain
const registerCaptain = async (req, res) => {
    try {
        const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

        if (!name || !email || !password || !phone || !vehicleType || !vehicleNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingCaptain = await Captain.findOne({ email });
        if (existingCaptain) {
            return res.status(400).json({ error: 'Captain already exists' });
        }

        console.log('Captain Registration - Original password:', password);

        const captain = new Captain({
            name,
            email,
            password, // The model will hash this automatically
            phone,
            vehicleType,
            vehicleNumber,
            isAvailable: true
        });

        const savedCaptain = await captain.save();
        console.log('Captain Registration - Saved hash:', savedCaptain.password);

        const token = generateToken(savedCaptain._id);

        res.status(201).json({
            message: 'Captain registered successfully',
            token,
            captain: {
                id: savedCaptain._id,
                name: savedCaptain.name,
                email: savedCaptain.email,
                phone: savedCaptain.phone,
                vehicleType: savedCaptain.vehicleType,
                vehicleNumber: savedCaptain.vehicleNumber,
                isAvailable: savedCaptain.isAvailable
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login captain
const loginCaptain = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        console.log('Captain Login - Original password:', password);

        const captain = await Captain.findOne({ email });
        if (!captain) {
            console.log('Captain Login - Captain not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Captain Login - Stored hash:', captain.password);
        
        // Use the model's comparePassword method
        const isMatch = captain.comparePassword(password);
        console.log('Captain Login - Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(captain._id);

        res.json({
            message: 'Login successful',
            token,
            captain: {
                id: captain._id,
                name: captain.name,
                email: captain.email,
                phone: captain.phone,
                vehicleType: captain.vehicleType,
                vehicleNumber: captain.vehicleNumber,
                isAvailable: captain.isAvailable
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        if (req.userType === 'user') {
            const user = await User.findById(req.user._id).select('-password');
            res.json({ user });
        } else {
            const captain = await Captain.findById(req.user._id).select('-password');
            res.json({ captain });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just send a success message
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export the test function
module.exports = {
    registerUser,
    registerCaptain,
    loginUser,
    loginCaptain,
    getProfile,
    logout
};
