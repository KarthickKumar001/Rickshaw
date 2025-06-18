const mongoose = require('mongoose');

const driverDocumentSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain',
        required: true
    },
    documents: {
        drivingLicense: {
            number: {
                type: String,
                required: true
            },
            image: {
                type: String, // URL to stored image
                required: true
            },
            expiryDate: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            verificationNotes: String,
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            verifiedAt: Date
        },
        vehicleRegistration: {
            number: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            expiryDate: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            verificationNotes: String,
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            verifiedAt: Date
        },
        vehicleInsurance: {
            policyNumber: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            expiryDate: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            verificationNotes: String,
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            verifiedAt: Date
        }
    },
    overallStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
driverDocumentSchema.index({ driver: 1 });
driverDocumentSchema.index({ 'documents.drivingLicense.status': 1 });
driverDocumentSchema.index({ 'documents.vehicleRegistration.status': 1 });
driverDocumentSchema.index({ 'documents.vehicleInsurance.status': 1 });
driverDocumentSchema.index({ overallStatus: 1 });

const DriverDocument = mongoose.model('DriverDocument', driverDocumentSchema);

module.exports = DriverDocument; 