const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const { User, Captain, Ride } = require('./setup-mongodb');

// Test database operations
async function testDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rickshaw');
        console.log('Connected to MongoDB');

        // Create a test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            phone: '1234567890'
        });
        await user.save();
        console.log('Test user created:', user);

        // Create a test captain
        const captain = new Captain({
            name: 'Test Captain',
            email: 'captain@example.com',
            password: hashedPassword,
            phone: '9876543210',
            vehicleType: 'auto',
            vehicleNumber: 'ABC123',
            currentLocation: {
                type: 'Point',
                coordinates: [72.8777, 19.0760] // Mumbai coordinates
            }
        });
        await captain.save();
        console.log('Test captain created:', captain);

        // Create a test ride
        const ride = new Ride({
            user: user._id,
            captain: captain._id,
            pickup: {
                address: 'Mumbai Central',
                coordinates: [72.8352, 18.9698]
            },
            destination: {
                address: 'Bandra Kurla Complex',
                coordinates: [72.8347, 19.0544]
            },
            status: 'pending',
            fare: {
                base: 150,
                final: 150
            },
            distance: 10.5,
            duration: 30,
            vehicleType: 'auto'
        });
        await ride.save();
        console.log('Test ride created:', ride);

        // Test queries
        console.log('\nTesting queries:');

        // Find user by email
        const foundUser = await User.findOne({ email: 'test@example.com' });
        console.log('Found user:', foundUser);

        // Find captain by vehicle type
        const foundCaptain = await Captain.findOne({ vehicleType: 'auto' });
        console.log('Found captain:', foundCaptain);

        // Find rides by status
        const pendingRides = await Ride.find({ status: 'pending' });
        console.log('Pending rides:', pendingRides);

        // Find nearby captains (within 5km)
        const nearbyCaptains = await Captain.find({
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [72.8352, 18.9698]
                    },
                    $maxDistance: 5000 // 5km in meters
                }
            }
        });
        console.log('Nearby captains:', nearbyCaptains);

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the tests
testDatabase(); 