const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendMessageToSocketId } = require('../../socket.service');

// Constants for fare calculation
const FARE_CONSTANTS = {
    BASE_FARE: {
        auto: 30,
        car: 50,
        moto: 20
    },
    PER_KM_RATE: {
        auto: 10,
        car: 15,
        moto: 8
    },
    PER_MINUTE_RATE: {
        auto: 2,
        car: 3,
        moto: 1.5
    },
    AUTO_FARE_ADJUSTMENT: {
        MIN: -50  // Only minimum limit is enforced
    },
    // Maximum allowed distance in kilometers
    MAX_DISTANCE: 100,
    // Maximum allowed duration in minutes
    MAX_DURATION: 180
};

/**
 * Validate distance and time constraints
 * @param {Object} distanceAndTime - Distance and time information
 * @throws {Error} If distance or time exceeds limits
 */
function validateDistanceAndTime(distanceAndTime) {
    const distanceInKm = distanceAndTime.distance.value / 1000;
    const durationInMinutes = distanceAndTime.duration.value / 60;

    if (distanceInKm > FARE_CONSTANTS.MAX_DISTANCE) {
        throw new Error(`Distance exceeds maximum allowed limit of ${FARE_CONSTANTS.MAX_DISTANCE} km`);
    }

    if (durationInMinutes > FARE_CONSTANTS.MAX_DURATION) {
        throw new Error(`Duration exceeds maximum allowed limit of ${FARE_CONSTANTS.MAX_DURATION} minutes`);
    }
}

/**
 * Calculate ride fare based on distance and time
 * @param {string} pickupLocation - Pickup location
 * @param {string} destinationLocation - Destination location
 * @returns {Promise<Object>} Fare details
 */
async function calculateRideFare(pickupLocation, destinationLocation) {
    try {
        if (!pickupLocation || !destinationLocation) {
            throw new Error('Pickup and destination locations are required');
        }

        // Validate location format
        if (typeof pickupLocation !== 'string' || typeof destinationLocation !== 'string') {
            throw new Error('Invalid location format');
        }

        // Get distance and time information
        const distanceAndTime = await mapService.getDistanceTime(pickupLocation, destinationLocation);
        
        // Validate distance and time constraints
        validateDistanceAndTime(distanceAndTime);

        const distanceInKm = distanceAndTime.distance.value / 1000;
        const timeInMinutes = distanceAndTime.duration.value / 60;
        
        // Calculate fares for all vehicle types in a single pass
        const calculatedFares = Object.keys(FARE_CONSTANTS.BASE_FARE).reduce((acc, vehicleType) => {
            // Calculate base fare components
            const distanceFare = distanceInKm * FARE_CONSTANTS.PER_KM_RATE[vehicleType];
            const timeFare = timeInMinutes * FARE_CONSTANTS.PER_MINUTE_RATE[vehicleType];
            const baseFare = FARE_CONSTANTS.BASE_FARE[vehicleType];
            
            // Calculate total fare with proper rounding
            acc[vehicleType] = Math.round(baseFare + distanceFare + timeFare);
            return acc;
        }, {});

        return {
            baseFares: calculatedFares,
            minimumFare: { auto: calculatedFares.auto + FARE_CONSTANTS.AUTO_FARE_ADJUSTMENT.MIN },
            distance: {
                value: distanceInKm,
                unit: 'km',
                text: `${distanceInKm.toFixed(1)} km`
            },
            duration: {
                value: timeInMinutes,
                unit: 'minutes',
                text: `${Math.round(timeInMinutes)} minutes`
            }
        };
    } catch (error) {
        if (error.message.includes('ZERO_RESULTS')) {
            throw new Error('No route found between the specified locations');
        }
        if (error.message.includes('OVER_QUERY_LIMIT')) {
            throw new Error('Map service query limit exceeded. Please try again later');
        }
        throw new Error(`Failed to calculate fare: ${error.message}`);
    }
}

/**
 * Generate a random OTP for ride verification
 * @param {number} length - Length of OTP
 * @returns {string} Generated OTP
 */
function generateRideOtp(length) {
    return crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length)).toString();
}

/**
 * Create a new ride
 * @param {Object} rideData - Ride data
 * @returns {Promise<Object>} Created ride
 */
async function createRide({ user, pickup, destination, vehicleType, negotiatedFare }) {
    try {
        if (!user || !pickup || !destination || !vehicleType) {
            throw new Error('All required fields must be provided');
        }

        // Validate vehicle type
        if (!FARE_CONSTANTS.BASE_FARE[vehicleType]) {
            throw new Error('Invalid vehicle type');
        }

        const fareDetails = await calculateRideFare(pickup, destination);
        const baseFare = fareDetails.baseFares[vehicleType];
        
        if (vehicleType === 'auto' && negotiatedFare) {
            const minimumAllowedFare = fareDetails.minimumFare.auto;
            
            if (negotiatedFare < minimumAllowedFare) {
                throw new Error(`Auto fare cannot be less than ${minimumAllowedFare}`);
            }
        } else if (negotiatedFare && vehicleType !== 'auto') {
            throw new Error('Fare negotiation is only available for auto rides');
        }

        const ride = await rideModel.create({
            user,
            pickup,
            destination,
            otp: generateRideOtp(6),
            fare: {
                base: baseFare,
                negotiated: vehicleType === 'auto' ? (negotiatedFare || baseFare) : baseFare,
                final: vehicleType === 'auto' ? (negotiatedFare || baseFare) : baseFare
            },
            vehicleType,
            status: 'pending',
            distance: fareDetails.distance,
            duration: fareDetails.duration,
            priceNegotiationHistory: [{
                requestedBy: 'user',
                amount: negotiatedFare || baseFare,
                status: 'accepted'
            }],
            activeNegotiations: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return ride;
    } catch (error) {
        throw new Error(`Failed to create ride: ${error.message}`);
    }
}

/**
 * Request price adjustment from captain
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Updated ride
 */
async function requestPriceAdjustment({ rideId, captain, requestedAmount }) {
    try {
        if (!rideId || !requestedAmount) {
            throw new Error('Ride ID and requested amount are required');
        }

        const ride = await rideModel.findOne({
            _id: rideId,
            status: 'pending'
        });

        if (!ride) {
            throw new Error('Ride not found or not in pending state');
        }

        // Check if captain already has an active negotiation
        const existingNegotiation = ride.activeNegotiations.find(
            neg => neg.captain.toString() === captain.toString()
        );

        if (existingNegotiation) {
            throw new Error('You already have an active negotiation for this ride');
        }

        // Add price negotiation history
        ride.priceNegotiationHistory.push({
            captain,
            requestedBy: 'captain',
            amount: requestedAmount,
            status: 'pending',
            timestamp: new Date()
        });

        // Add to active negotiations
        ride.activeNegotiations.push({
            captain,
            requestedAmount,
            status: 'pending',
            timestamp: new Date()
        });

        ride.status = 'price_negotiation';
        ride.updatedAt = new Date();
        await ride.save();

        return ride;
    } catch (error) {
        throw new Error(`Failed to request price adjustment: ${error.message}`);
    }
}

/**
 * Get sorted list of captain negotiations
 * @param {string} rideId - Ride ID
 * @returns {Promise<Array>} Sorted list of negotiations
 */
async function getSortedNegotiations(rideId) {
    try {
        const ride = await rideModel.findById(rideId)
            .populate({
                path: 'activeNegotiations.captain',
                select: 'name rating experience vehicleDetails'
            });

        if (!ride) {
            throw new Error('Ride not found');
        }

        // Sort negotiations based on price, rating, and experience
        const sortedNegotiations = ride.activeNegotiations
            .filter(neg => neg.status === 'pending')
            .sort((a, b) => {
                // First sort by price (ascending)
                if (a.requestedAmount !== b.requestedAmount) {
                    return a.requestedAmount - b.requestedAmount;
                }
                
                // Then by rating (descending)
                if (a.captain.rating !== b.captain.rating) {
                    return b.captain.rating - a.captain.rating;
                }
                
                // Finally by experience (descending)
                return b.captain.experience - a.captain.experience;
            });

        return sortedNegotiations;
    } catch (error) {
        throw new Error(`Failed to get sorted negotiations: ${error.message}`);
    }
}

/**
 * Accept a captain's price request
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Updated ride
 */
async function acceptCaptainRequest({ rideId, user, captainId }) {
    try {
        if (!rideId || !captainId) {
            throw new Error('Ride ID and captain ID are required');
        }

        const ride = await rideModel.findOne({
            _id: rideId,
            user: user._id,
            status: 'price_negotiation'
        });

        if (!ride) {
            throw new Error('Ride not found or not in price negotiation state');
        }

        // Find the captain's negotiation
        const negotiation = ride.activeNegotiations.find(
            neg => neg.captain.toString() === captainId && neg.status === 'pending'
        );

        if (!negotiation) {
            throw new Error('No pending negotiation found for this captain');
        }

        // Update all negotiations
        ride.activeNegotiations.forEach(neg => {
            neg.status = neg.captain.toString() === captainId ? 'accepted' : 'rejected';
        });

        // Update negotiation history
        ride.priceNegotiationHistory.push({
            captain: captainId,
            requestedBy: 'user',
            amount: negotiation.requestedAmount,
            status: 'accepted',
            timestamp: new Date()
        });

        // Update ride details
        ride.fare.final = negotiation.requestedAmount;
        ride.captain = captainId;
        ride.status = 'pending';
        ride.updatedAt = new Date();
        await ride.save();

        return ride;
    } catch (error) {
        throw new Error(`Failed to accept captain request: ${error.message}`);
    }
}

/**
 * Reject all negotiations and reset ride
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Updated ride
 */
async function rejectAllNegotiations({ rideId, user }) {
    try {
        if (!rideId) {
            throw new Error('Ride ID is required');
        }

        const ride = await rideModel.findOne({
            _id: rideId,
            user: user._id,
            status: 'price_negotiation'
        });

        if (!ride) {
            throw new Error('Ride not found or not in price negotiation state');
        }

        // Update all negotiations to rejected
        ride.activeNegotiations.forEach(neg => {
            neg.status = 'rejected';
        });

        // Add to negotiation history
        ride.priceNegotiationHistory.push({
            requestedBy: 'user',
            amount: ride.fare.base,
            status: 'rejected',
            timestamp: new Date()
        });

        // Reset ride state
        ride.status = 'pending';
        ride.fare.final = ride.fare.base;
        ride.activeNegotiations = [];
        ride.updatedAt = new Date();
        await ride.save();

        return ride;
    } catch (error) {
        throw new Error(`Failed to reject negotiations: ${error.message}`);
    }
}

/**
 * Confirm a ride by captain
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Confirmed ride
 */
async function confirmRide({ rideId, captain }) {
    try {
        if (!rideId) {
            throw new Error('Ride ID is required');
        }

        const ride = await rideModel.findOneAndUpdate(
            { 
                _id: rideId, 
                status: 'pending',
                $or: [
                    { 'fare.captainRequested': null },
                    { 'fare.captainRequested': { $exists: false } }
                ]
            },
            { 
                status: 'accepted',
                captain: captain._id,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('user').populate('captain').select('+otp');

        if (!ride) {
            throw new Error('Ride not found or already confirmed');
        }

        return ride;
    } catch (error) {
        throw new Error(`Failed to confirm ride: ${error.message}`);
    }
}

/**
 * Start a ride
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Started ride
 */
async function startRide({ rideId, otp, captain }) {
    try {
        if (!rideId || !otp) {
            throw new Error('Ride ID and OTP are required');
        }

        const ride = await rideModel.findOne({
            _id: rideId,
            captain: captain._id,
            status: 'accepted'
        }).populate('user').populate('captain').select('+otp');

        if (!ride) {
            throw new Error('Ride not found or not in accepted state');
        }

        if (ride.otp !== otp) {
            throw new Error('Invalid OTP');
        }

        const updatedRide = await rideModel.findByIdAndUpdate(
            rideId,
            { 
                status: 'ongoing',
                startTime: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        ).populate('user').populate('captain');

        return updatedRide;
    } catch (error) {
        throw new Error(`Failed to start ride: ${error.message}`);
    }
}

/**
 * End a ride
 * @param {Object} params - Parameters
 * @returns {Promise<Object>} Completed ride
 */
async function endRide({ rideId, captain }) {
    try {
        if (!rideId) {
            throw new Error('Ride ID is required');
        }

        const ride = await rideModel.findOne({
            _id: rideId,
            captain: captain._id,
            status: 'ongoing'
        }).populate('user').populate('captain');

        if (!ride) {
            throw new Error('Ride not found or not in ongoing state');
        }

        const updatedRide = await rideModel.findByIdAndUpdate(
            rideId,
            { 
                status: 'completed',
                endTime: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        ).populate('user').populate('captain');

        return updatedRide;
    } catch (error) {
        throw new Error(`Failed to end ride: ${error.message}`);
    }
}

// Mock Ride Service for testing
class MockRideService {
    constructor() {
        this.rides = new Map();
        this.rideCounter = 1;
    }

    async calculateRideFare(pickup, destination) {
        const distanceTime = await mapService.getDistanceTime(pickup, destination);
        
        return {
            auto: mapService.calculateFare(distanceTime.distance.value, 'auto'),
            car: mapService.calculateFare(distanceTime.distance.value, 'car'),
            moto: mapService.calculateFare(distanceTime.distance.value, 'moto')
        };
    }

    async createRide(rideData) {
        const { pickup, destination, vehicleType, user } = rideData;
        
        const distanceTime = await mapService.getDistanceTime(pickup, destination);
        const baseFare = mapService.calculateFare(distanceTime.distance.value, vehicleType);
        
        const ride = {
            _id: `ride_${this.rideCounter++}`,
        user,
        pickup,
        destination,
            vehicleType,
            fare: {
                base: baseFare,
                final: baseFare
            },
            distance: distanceTime.distance.value,
            duration: distanceTime.duration.value,
            status: 'pending',
            priceNegotiationHistory: [],
            createdAt: new Date()
        };

        this.rides.set(ride._id, ride);
    return ride;
}

    async requestPriceAdjustment({ rideId, captain, requestedAmount }) {
        const ride = this.rides.get(rideId);
        
        if (!ride) {
            throw new Error('Ride not found');
        }

        if (ride.status !== 'pending') {
            throw new Error('Cannot adjust price for this ride');
        }

        ride.priceNegotiationHistory.push({
            captain,
            requestedAmount,
            timestamp: new Date()
        });

        ride.status = 'price_negotiation';
        this.rides.set(rideId, ride);

        return ride;
    }

    async getSortedNegotiations(rideId) {
        const ride = this.rides.get(rideId);
        
        if (!ride) {
            throw new Error('Ride not found');
        }

        return ride.priceNegotiationHistory.sort((a, b) => a.requestedAmount - b.requestedAmount);
    }

    async acceptCaptainRequest({ rideId, user, captainId }) {
        const ride = this.rides.get(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

        if (ride.user !== user) {
            throw new Error('Not authorized');
        }

        const negotiation = ride.priceNegotiationHistory.find(n => 
            n.captain === captainId
        );

        if (!negotiation) {
            throw new Error('Negotiation not found');
        }

        ride.captain = captainId;
        ride.fare.final = negotiation.requestedAmount;
        ride.status = 'accepted';
        this.rides.set(rideId, ride);

    return ride;
    }

    async rejectAllNegotiations({ rideId, user }) {
        const ride = this.rides.get(rideId);
        
        if (!ride) {
            throw new Error('Ride not found');
        }

        if (ride.user !== user) {
            throw new Error('Not authorized');
        }

        ride.priceNegotiationHistory = [];
        ride.status = 'pending';
        this.rides.set(rideId, ride);

        return ride;
    }

    async confirmRide({ rideId, captain }) {
        const ride = this.rides.get(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

        if (ride.captain !== captain) {
            throw new Error('Not authorized');
        }

        ride.status = 'confirmed';
        this.rides.set(rideId, ride);

        return ride;
    }

    async startRide({ rideId, captain, otp }) {
        const ride = this.rides.get(rideId);
        
        if (!ride) {
            throw new Error('Ride not found');
        }

        if (ride.captain !== captain) {
            throw new Error('Not authorized');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

        ride.status = 'in_progress';
        ride.startTime = new Date();
        this.rides.set(rideId, ride);

    return ride;
}

    async endRide({ rideId, captain }) {
        const ride = this.rides.get(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

        if (ride.captain !== captain) {
            throw new Error('Not authorized');
        }

        ride.status = 'completed';
        ride.endTime = new Date();
        this.rides.set(rideId, ride);

    return ride;
}
}

module.exports = new MockRideService();

