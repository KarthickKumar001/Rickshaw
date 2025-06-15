/**
 * Mock Maps Service for testing without Google Maps API
 */

// Mock coordinates for testing
const mockCoordinates = {
    '123 Main St': { lat: 12.9716, lng: 77.5946 },
    '456 Oak Ave': { lat: 12.9784, lng: 77.6408 },
    '789 Park Rd': { lat: 12.9716, lng: 77.5946 }
};

// Mock distance and duration for testing
const mockDistanceTime = {
    'auto': { distance: 5000, duration: 900 },  // 5km, 15 mins
    'car': { distance: 5000, duration: 900 },
    'moto': { distance: 5000, duration: 900 }
};

// Mock suggestions for testing
const mockSuggestions = [
    '123 Main St, City',
    '123 Main Street, City',
    '123 Main St, Downtown'
];

class MockMapsService {
    /**
     * Get coordinates for an address
     * @param {string} address - The address to get coordinates for
     * @returns {Promise<Object>} Coordinates object with lat and lng
     */
    async getAddressCoordinate(address) {
        // Return mock coordinates or default to a central location
        return mockCoordinates[address] || { lat: 12.9716, lng: 77.5946 };
    }

    /**
     * Get distance and time between two locations
     * @param {string} origin - Starting address
     * @param {string} destination - Destination address
     * @returns {Promise<Object>} Distance and duration object
     */
    async getDistanceTime(origin, destination) {
        // Return mock distance and time
        return {
            distance: {
                text: '5.0 km',
                value: 5000
            },
            duration: {
                text: '15 mins',
                value: 900
            }
        };
    }

    /**
     * Get autocomplete suggestions for an address
     * @param {string} input - The input string to get suggestions for
     * @returns {Promise<Array>} Array of suggestion strings
     */
    async getAutoCompleteSuggestions(input) {
        // Return mock suggestions
        return mockSuggestions;
    }

    /**
     * Calculate fare based on distance and vehicle type
     * @param {number} distance - Distance in meters
     * @param {string} vehicleType - Type of vehicle
     * @returns {number} Calculated fare
     */
    calculateFare(distance, vehicleType) {
        const baseRates = {
            'auto': 30,  // Base rate per km
            'car': 50,
            'moto': 25
        };

        const distanceInKm = distance / 1000;
        return Math.round(baseRates[vehicleType] * distanceInKm);
    }
}

module.exports = new MockMapsService(); 