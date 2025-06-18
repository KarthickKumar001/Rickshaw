const mongoose = require('mongoose');
const Ride = require('../models/ride.model');

class MockRideService {
    constructor() {
        this.rideIdCounter = 1;
    }

    /**
     * Calculate ride fare
     * @param {string} pickup - Pickup address
     * @param {string} destination - Destination address
     * @param {string} vehicleType - Vehicle type
     * @returns {Promise<Object>} Fare details
     */
    async calculateRideFare(pickup, destination, vehicleType) {
        // Mock fare calculation logic
        const baseFare = {
            auto: 50,
            car: 100,
            moto: 30
        };

        const fare = baseFare[vehicleType] || 50;
        return {
            fare,
            currency: 'INR',
            estimatedTime: '15 mins'
        };
    }

    /**
     * Create a new ride
     * @param {string} userId - User ID
     * @param {Object} rideData - Ride data
     * @returns {Promise<Object>} Created ride
     */
    async createRide(userId, rideData) {
        try {
            console.log('Creating ride with data:', { userId, ...rideData });
            
            const fare = await this.calculateRideFare(
                rideData.pickup,
                rideData.destination,
                rideData.vehicleType
            );

            const ride = new Ride({
                user: userId,
                pickup: rideData.pickup,
                destination: rideData.destination,
                vehicleType: rideData.vehicleType,
                fare: fare.fare,
                status: 'pending',
                activeNegotiations: [],
                priceNegotiationHistory: []
            });

            const savedRide = await ride.save();
            console.log('Created ride with ID:', savedRide._id);
            
            return savedRide;
        } catch (error) {
            console.error('Error creating ride:', error);
            throw error;
        }
    }

    /**
     * Request price adjustment from captain
     * @param {string} rideId - Ride ID
     * @param {string} captainId - Captain ID
     * @param {number} requestedAmount - Requested amount
     * @returns {Promise<Object>} Updated ride
     */
    async requestPriceAdjustment(rideId, captainId, requestedAmount) {
        try {
            console.log('Requesting price adjustment:', {
                rideId,
                captainId,
                requestedAmount
            });

            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                console.error('Ride not found:', rideId);
                throw new Error('Ride not found');
            }

            console.log('Found ride:', ride);

            // Initialize arrays if they don't exist
            if (!ride.activeNegotiations) {
                ride.activeNegotiations = [];
            }
            if (!ride.priceNegotiationHistory) {
                ride.priceNegotiationHistory = [];
            }

            // Check if captain already has an active negotiation
            const existingNegotiation = ride.activeNegotiations.find(
                n => n.captain.toString() === captainId.toString()
            );

            if (existingNegotiation) {
                throw new Error('You already have an active negotiation for this ride');
            }

            // Create negotiation object
            const negotiation = {
                captain: captainId,
                requestedAmount,
                status: 'pending',
                timestamp: new Date()
            };

            // Add to active negotiations
            ride.activeNegotiations.push(negotiation);
            ride.priceNegotiationHistory.push(negotiation);
            ride.status = 'price_negotiation';

            const updatedRide = await ride.save();
            console.log('Updated ride with negotiation:', updatedRide);

            return updatedRide;
        } catch (error) {
            console.error('Error in requestPriceAdjustment:', error);
            throw error;
        }
    }

    /**
     * Get sorted list of captain negotiations
     * @param {string} rideId - Ride ID
     * @returns {Promise<Array>} Sorted negotiations
     */
    async getSortedNegotiations(rideId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                throw new Error('Ride not found');
            }

            if (!ride.activeNegotiations || ride.activeNegotiations.length === 0) {
                return [];
            }

            return ride.activeNegotiations.sort((a, b) => a.requestedAmount - b.requestedAmount);
        } catch (error) {
            console.error('Error getting sorted negotiations:', error);
            throw error;
        }
    }

    /**
     * Accept captain's price request
     * @param {string} rideId - Ride ID
     * @param {string} captainId - Captain ID
     * @returns {Promise<Object>} Updated ride
     */
    async acceptCaptainRequest(rideId, captainId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }
            if (!mongoose.Types.ObjectId.isValid(captainId)) {
                throw new Error('Invalid captain ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                throw new Error('Ride not found');
            }

            const negotiation = ride.activeNegotiations.find(
                n => n.captain.toString() === captainId.toString()
            );

            if (!negotiation) {
                throw new Error('No pending negotiation found for this captain');
            }

            // Update negotiation status
            negotiation.status = 'accepted';
            ride.fare = negotiation.requestedAmount;
            ride.status = 'accepted';
            ride.captain = captainId;

            // Clear other active negotiations
            ride.activeNegotiations = ride.activeNegotiations.filter(
                n => n.captain.toString() === captainId.toString()
            );

            const updatedRide = await ride.save();
            return updatedRide;
        } catch (error) {
            console.error('Error accepting captain request:', error);
            throw error;
        }
    }

    /**
     * Reject all negotiations
     * @param {string} rideId - Ride ID
     * @returns {Promise<Object>} Updated ride
     */
    async rejectAllNegotiations(rideId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                throw new Error('Ride not found');
            }

            // Mark all active negotiations as rejected
            ride.activeNegotiations.forEach(negotiation => {
                negotiation.status = 'rejected';
            });

            // Clear active negotiations
            ride.activeNegotiations = [];
            ride.status = 'pending';

            const updatedRide = await ride.save();
            return updatedRide;
        } catch (error) {
            console.error('Error rejecting negotiations:', error);
            throw error;
        }
    }

    /**
     * Confirm ride by captain
     * @param {string} rideId - Ride ID
     * @param {string} captainId - Captain ID
     * @returns {Promise<Object>} Updated ride
     */
    async confirmRide(rideId, captainId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }
            if (!mongoose.Types.ObjectId.isValid(captainId)) {
                throw new Error('Invalid captain ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                throw new Error('Ride not found');
            }

            if (ride.captain.toString() !== captainId.toString()) {
                throw new Error('You are not assigned to this ride');
            }

            ride.status = 'confirmed';
            const updatedRide = await ride.save();
            return updatedRide;
        } catch (error) {
            console.error('Error confirming ride:', error);
            throw error;
        }
    }

    /**
     * Start ride
     * @param {string} rideId - Ride ID
     * @param {string} captainId - Captain ID
     * @returns {Promise<Object>} Updated ride
     */
    async startRide(rideId, captainId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }
            if (!mongoose.Types.ObjectId.isValid(captainId)) {
                throw new Error('Invalid captain ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                throw new Error('Ride not found');
            }

            if (ride.captain.toString() !== captainId.toString()) {
                throw new Error('You are not assigned to this ride');
            }

            ride.status = 'in_progress';
            ride.startTime = new Date();
            const updatedRide = await ride.save();
            return updatedRide;
        } catch (error) {
            console.error('Error starting ride:', error);
            throw error;
        }
    }

    /**
     * End ride
     * @param {string} rideId - Ride ID
     * @param {string} captainId - Captain ID
     * @returns {Promise<Object>} Updated ride
     */
    async endRide(rideId, captainId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(rideId)) {
                throw new Error('Invalid ride ID format');
            }
            if (!mongoose.Types.ObjectId.isValid(captainId)) {
                throw new Error('Invalid captain ID format');
            }

            const ride = await Ride.findById(rideId);
            if (!ride) {
                throw new Error('Ride not found');
            }

            if (ride.captain.toString() !== captainId.toString()) {
                throw new Error('You are not assigned to this ride');
            }

            ride.status = 'completed';
            ride.endTime = new Date();
            const updatedRide = await ride.save();
            return updatedRide;
        } catch (error) {
            console.error('Error ending ride:', error);
            throw error;
        }
    }
}

module.exports = new MockRideService(); 