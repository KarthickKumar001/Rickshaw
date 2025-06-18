const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['credit', 'debit', 'hold', 'release'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const vaultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    holdAmount: {
        type: Number,
        default: 0
    },
    transactions: [transactionSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Method to add money to vault
vaultSchema.methods.addMoney = async function(amount, description) {
    this.balance += amount;
    this.transactions.push({
        type: 'credit',
        amount: amount,
        description: description || 'Money added to vault'
    });
    this.updatedAt = new Date();
    return this.save();
};

// Method to hold money for a ride
vaultSchema.methods.holdMoney = async function(amount, rideId) {
    if (this.balance < amount) {
        throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    this.holdAmount += amount;
    this.transactions.push({
        type: 'hold',
        amount: amount,
        rideId: rideId,
        description: 'Amount held for ride'
    });
    this.updatedAt = new Date();
    return this.save();
};

// Method to release held money to driver
vaultSchema.methods.releaseMoney = async function(rideId) {
    const transaction = this.transactions.find(t => 
        t.rideId && t.rideId.toString() === rideId.toString() && t.type === 'hold'
    );
    
    if (!transaction) {
        throw new Error('No held amount found for this ride');
    }

    this.holdAmount -= transaction.amount;
    this.transactions.push({
        type: 'release',
        amount: transaction.amount,
        rideId: rideId,
        description: 'Amount released to driver'
    });
    this.updatedAt = new Date();
    return this.save();
};

// Method to refund held money
vaultSchema.methods.refundHeldMoney = async function(rideId) {
    const transaction = this.transactions.find(t => 
        t.rideId && t.rideId.toString() === rideId.toString() && t.type === 'hold'
    );
    
    if (!transaction) {
        throw new Error('No held amount found for this ride');
    }

    this.balance += transaction.amount;
    this.holdAmount -= transaction.amount;
    this.transactions.push({
        type: 'credit',
        amount: transaction.amount,
        rideId: rideId,
        description: 'Refund for cancelled ride'
    });
    this.updatedAt = new Date();
    return this.save();
};

// Method to get transaction history
vaultSchema.methods.getTransactionHistory = function() {
    return this.transactions.sort((a, b) => b.createdAt - a.createdAt);
};

const Vault = mongoose.model('Vault', vaultSchema);

module.exports = Vault; 