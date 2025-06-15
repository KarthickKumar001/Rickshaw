const { rideService } = require('../config/services');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../../socket.service');
const rideModel = require('../models/ride.model');
const { validateRideRequest } = require('../validators/ride.validator');
const mongoose = require('mongoose');

/**
 * Create a new ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createRide(req, res) {
    try {
        const { error } = validateRideRequest(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const ride = await rideService.createRide(req.user._id, req.body);
        res.status(201).json(ride);
    } catch (error) {
        console.error('Error creating ride:', error);
        res.status(400).json({ error: error.message });
    }
}

/**
 * Calculate ride fare
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function calculateFare(req, res) {
    try {
        const { pickup, destination } = req.body;
        const fareDetails = await rideService.calculateRideFare(pickup, destination);
        res.json(fareDetails);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Get fare for a ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getFare(req, res) {
    try {
        const { pickup, destination } = req.query;
        const fareDetails = await rideService.calculateRideFare(pickup, destination);
        res.json(fareDetails);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Request price adjustment
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function requestPriceAdjustment(req, res) {
    try {
        const { rideId } = req.params;
        const { requestedAmount } = req.body;
        const captainId = req.user._id;

        // Validate rideId format
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }

        console.log('Price adjustment request:', {
            rideId,
            captainId,
            requestedAmount
        });

        const ride = await rideService.requestPriceAdjustment(rideId, captainId, requestedAmount);
        
        console.log('Price adjustment response:', {
            rideId: ride.id,
            status: ride.status,
            activeNegotiations: ride.activeNegotiations
        });

        res.json({
            success: true,
            message: 'Price adjustment request sent successfully',
            data: ride
        });
    } catch (error) {
        console.error('Price adjustment error:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Failed to process price adjustment request'
        });
    }
}

/**
 * Get sorted negotiations
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getSortedNegotiations(req, res) {
    try {
        const { rideId } = req.params;
        
        // Validate rideId format
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }

        const negotiations = await rideService.getSortedNegotiations(rideId);
        res.json(negotiations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Accept captain request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function acceptCaptainRequest(req, res) {
    try {
        const { rideId } = req.params;
        const { captainId } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }
        if (!mongoose.Types.ObjectId.isValid(captainId)) {
            return res.status(400).json({ error: 'Invalid captain ID format' });
        }

        const ride = await rideService.acceptCaptainRequest(rideId, captainId);
        res.json(ride);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Reject all negotiations
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function rejectAllNegotiations(req, res) {
    try {
        const { rideId } = req.params;

        // Validate rideId format
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }

        const ride = await rideService.rejectAllNegotiations(rideId);
        res.json(ride);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Confirm ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function confirmRide(req, res) {
    try {
        const { rideId } = req.params;

        // Validate rideId format
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }

        const ride = await rideService.confirmRide(rideId, req.user._id);
        res.json(ride);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Start ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function startRide(req, res) {
    try {
        const { rideId } = req.params;

        // Validate rideId format
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }

        const ride = await rideService.startRide(rideId, req.user._id);
        res.json(ride);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * End ride
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function endRide(req, res) {
    try {
        const { rideId } = req.params;

        // Validate rideId format
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid ride ID format' });
        }

        const ride = await rideService.endRide(rideId, req.user._id);
        res.json(ride);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/**
 * Respond to a captain's price request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function respondToPriceRequest(req, res) {
    try {
        const { rideId } = req.params;
        const { captainId, accepted } = req.body;

        if (!captainId) {
            return res.status(400).json({ error: 'Captain ID is required' });
        }

        const ride = await rideService.respondToPriceRequest({
            rideId,
            user: req.user._id,
            captainId,
            accepted
        });

        res.json(ride);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createRide,
    calculateFare,
    getFare,
    requestPriceAdjustment,
    getSortedNegotiations,
    acceptCaptainRequest,
    rejectAllNegotiations,
    confirmRide,
    startRide,
    endRide,
    respondToPriceRequest
};