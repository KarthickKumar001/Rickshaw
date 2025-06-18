const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const { validatePriceAdjustment, validatePriceResponse } = require('../validators/ride.validator');
const { authenticate, requireUser, requireCaptain } = require('../middleware/auth');
const Ride = require('../models/ride.model');

// Public routes
router.post('/calculate-fare', rideController.calculateFare);

// Protected routes
router.use(authenticate);

// User routes
router.post('/',
    requireUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isIn(['auto', 'car', 'moto']).withMessage('Invalid vehicle type'),
    rideController.createRide
);

router.get('/get-fare',
    requireUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
);

router.post('/:rideId/price-response', validatePriceResponse, rideController.respondToPriceRequest);

router.get('/:rideId/negotiations', requireUser, rideController.getSortedNegotiations);

router.post('/:rideId/accept-captain', requireUser, rideController.acceptCaptainRequest);

router.post('/:rideId/reject-all', requireUser, rideController.rejectAllNegotiations);

// Captain routes
router.post('/:rideId/price-adjustment', 
    requireCaptain,
    (req, res, next) => {
        try {
            const validatedData = validatePriceAdjustment(req.body);
            req.body = validatedData;
            next();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    rideController.requestPriceAdjustment
);

router.post('/:rideId/confirm', requireCaptain, rideController.confirmRide);
router.post('/:rideId/start', requireCaptain, rideController.startRide);
router.post('/:rideId/end', requireCaptain, rideController.endRide);

// Get all rides
router.get('/', async (req, res) => {
    try {
        const rides = await Ride.find();
        res.json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;