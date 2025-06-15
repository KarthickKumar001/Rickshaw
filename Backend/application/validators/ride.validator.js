const Joi = require('joi');

const rideRequestSchema = Joi.object({
    pickup: Joi.string().required().messages({
        'string.empty': 'Pickup location is required',
        'any.required': 'Pickup location is required'
    }),
    destination: Joi.string().required().messages({
        'string.empty': 'Destination location is required',
        'any.required': 'Destination location is required'
    }),
    vehicleType: Joi.string().valid('auto', 'car', 'moto').required().messages({
        'string.empty': 'Vehicle type is required',
        'any.required': 'Vehicle type is required',
        'any.only': 'Vehicle type must be one of: auto, car, moto'
    }),
    negotiatedFare: Joi.number().min(0).when('vehicleType', {
        is: 'auto',
        then: Joi.number().min(0),
        otherwise: Joi.forbidden().messages({
            'any.unknown': 'Fare negotiation is only available for auto rides'
        })
    })
});

const priceAdjustmentSchema = Joi.object({
    requestedAmount: Joi.number().required().messages({
        'number.base': 'Requested amount must be a number',
        'any.required': 'Requested amount is required'
    })
});

const priceResponseSchema = Joi.object({
    accept: Joi.boolean().required().messages({
        'boolean.base': 'Accept must be a boolean',
        'any.required': 'Accept is required'
    })
});

function validateRideRequest(data) {
    return rideRequestSchema.validate(data, { abortEarly: false });
}

function validatePriceAdjustment(data) {
    const { error, value } = priceAdjustmentSchema.validate(data, { abortEarly: false });
    if (error) {
        throw error;
    }
    return value;
}

function validatePriceResponse(data) {
    return priceResponseSchema.validate(data, { abortEarly: false });
}

module.exports = {
    validateRideRequest,
    validatePriceAdjustment,
    validatePriceResponse
}; 