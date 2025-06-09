const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');

/**
 * Authentication middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
async function authenticate(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        console.log('Decoded token:', decoded);

        // Check if user exists
        const user = await User.findById(decoded.id);
        if (user) {
            req.user = user;
            req.userType = 'user';
            return next();
        }

        // Check if captain exists
        const captain = await Captain.findById(decoded.id);
        if (captain) {
            req.user = captain;
            req.userType = 'captain';
            return next();
        }

        throw new Error('User not found');
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Please authenticate' });
    }
}

/**
 * User role middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function requireUser(req, res, next) {
    if (req.userType !== 'user') {
        return res.status(403).json({ error: 'Access denied. User role required.' });
    }
    next();
}

/**
 * Captain role middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function requireCaptain(req, res, next) {
    if (req.userType !== 'captain') {
        return res.status(403).json({ error: 'Access denied. Captain role required.' });
    }
    next();
}

module.exports = {
    authenticate,
    requireUser,
    requireCaptain
}; 