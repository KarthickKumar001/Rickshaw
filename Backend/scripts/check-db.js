const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rickshaw');
        console.log('Connected to MongoDB');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => console.log('-', collection.name));

        // Count documents in each collection
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`\nDocuments in ${collection.name}: ${count}`);

            // Show sample documents
            const sample = await mongoose.connection.db.collection(collection.name).find().limit(1).toArray();
            if (sample.length > 0) {
                console.log('Sample document:', JSON.stringify(sample[0], null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

checkDatabase(); 