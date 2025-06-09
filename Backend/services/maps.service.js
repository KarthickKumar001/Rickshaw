/**
 * Mock Maps Service for testing without Google Maps API
 */

const axios = require('axios');
const captainModel = require('../models/captain.model');

// Original Maps Service (commented out for testing)
/*
module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }
            return response.data.rows[0].elements[0];
        } else {
            throw new Error('Unable to fetch distance and time');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    // radius in km
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6371]
            }
        }
    });
    return captains;
}
*/

// Mock Maps Service for testing
const mockCoordinates = {
    '123 Main St': { lat: 12.9716, lng: 77.5946 },
    '456 Oak Ave': { lat: 12.9784, lng: 77.6408 },
    '789 Park Rd': { lat: 12.9716, lng: 77.5946 }
};

const mockDistanceTime = {
    'auto': { distance: 5000, duration: 900 },  // 5km, 15 mins
    'car': { distance: 5000, duration: 900 },
    'moto': { distance: 5000, duration: 900 }
};

const mockSuggestions = [
    '123 Main St, City',
    '123 Main Street, City',
    '123 Main St, Downtown'
];

module.exports.getAddressCoordinate = async (address) => {
    return mockCoordinates[address] || { lat: 12.9716, lng: 77.5946 };
};

module.exports.getDistanceTime = async (origin, destination) => {
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
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    return mockSuggestions;
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    // Return mock captains
    return [];
};

module.exports.calculateFare = (distance, vehicleType) => {
    const baseRates = {
        'auto': 30,  // Base rate per km
        'car': 50,
        'moto': 25
    };

    const distanceInKm = distance / 1000;
    return Math.round(baseRates[vehicleType] * distanceInKm);
};