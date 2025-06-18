const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');
const Admin = require('../../admin/models/admin.model');

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

        // Check user type from token
        if (decoded.type === 'admin')
        {
            const admin = await Admin.findById(decoded.id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            req.user = admin;
            req.userType = 'admin';
            return next();
        }

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

/**
 * Admin role middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function isAdmin(req, res, next) {
    if (req.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
}

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = {
    authenticate,
    requireUser,
    requireCaptain,
    authenticateToken,
    isAdmin
}; 