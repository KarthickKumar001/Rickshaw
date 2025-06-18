const realMapService = require('../services/maps.service');
const mockMapService = require('../services/mock.maps.service');
const realRideService = require('../services/ride.service');
const mockRideService = require('../services/mock.ride.service');

// Use mock services in development if USE_MOCK_SERVICES is true
const useMockServices = process.env.USE_MOCK_SERVICES === 'true';

module.exports = {
    mapService: useMockServices ? mockMapService : realMapService,
    rideService: useMockServices ? mockRideService : realRideService
}; 