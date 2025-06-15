const Vault = require('../models/vault.model');
const User = require('../models/user.model');
const Captain = require('../models/captain.model');
const Transaction = require('../models/transaction.model');
const Ride = require('../models/ride.model');

class VaultService {
    // Create or get user vault
    static async getUserVault(userId) {
        let vault = await Vault.findOne({ user: userId });
        if (!vault) {
            vault = new Vault({ user: userId });
            await vault.save();
        }
        return vault;
    }

    // Add money to vault
    static async addMoney(userId, amount, description) {
        const vault = await this.getUserVault(userId);
        vault.balance += amount;
        await vault.save();

        // Create transaction record
        await this.createTransaction({
            user: userId,
            type: 'wallet_recharge',
            amount,
            status: 'completed',
            description,
            paymentMethod: 'razorpay'
        });

        return vault;
    }

    // Hold money for ride
    static async holdMoneyForRide(userId, rideId, amount) {
        const vault = await this.getUserVault(userId);
        if (vault.balance < amount) {
            throw new Error('Insufficient balance');
        }

        const ride = await Ride.findById(rideId);
        if (!ride) {
            throw new Error('Ride not found');
        }

        vault.balance -= amount;
        vault.holdAmount += amount;
        await vault.save();

        // Create transaction record
        await this.createTransaction({
            user: userId,
            type: 'ride_payment',
            amount,
            status: 'pending',
            ride: rideId,
            description: `Payment held for ride from ${ride.pickup} to ${ride.destination}`,
            paymentMethod: 'wallet',
            metadata: {
                pickup: ride.pickup,
                destination: ride.destination,
                vehicleType: ride.vehicleType
            }
        });

        return vault;
    }

    // Release money to driver after ride completion
    static async releaseMoneyToDriver(rideId) {
        const ride = await Ride.findById(rideId).populate('user');
        if (!ride) {
            throw new Error('Ride not found');
        }

        const vault = await this.getUserVault(ride.user._id);
        vault.holdAmount -= ride.fare;
        await vault.save();

        // Create transaction record
        await this.createTransaction({
            user: ride.user._id,
            type: 'driver_payment',
            amount: ride.fare,
            status: 'completed',
            ride: rideId,
            description: `Payment released to driver for ride from ${ride.pickup} to ${ride.destination}`,
            paymentMethod: 'wallet',
            metadata: {
                pickup: ride.pickup,
                destination: ride.destination,
                vehicleType: ride.vehicleType
            }
        });

        return vault;
    }

    // Refund money for cancelled ride
    static async refundCancelledRide(rideId) {
        const ride = await Ride.findById(rideId).populate('user');
        if (!ride) {
            throw new Error('Ride not found');
        }

        const vault = await this.getUserVault(ride.user._id);
        vault.balance += ride.fare;
        vault.holdAmount -= ride.fare;
        await vault.save();

        // Create transaction record
        await this.createTransaction({
            user: ride.user._id,
            type: 'cancellation_refund',
            amount: ride.fare,
            status: 'completed',
            ride: rideId,
            description: `Refund for cancelled ride from ${ride.pickup} to ${ride.destination}`,
            paymentMethod: 'wallet',
            metadata: {
                pickup: ride.pickup,
                destination: ride.destination,
                vehicleType: ride.vehicleType
            }
        });

        return vault;
    }

    // Get vault balance
    static async getVaultBalance(userId) {
        const vault = await this.getUserVault(userId);
        return {
            balance: vault.balance,
            holdAmount: vault.holdAmount,
            availableBalance: vault.balance - vault.holdAmount
        };
    }

    // Get transaction history
    static async getTransactionHistory(userId, filters = {}) {
        const query = { user: userId };
        
        // Apply filters
        if (filters.type) query.type = filters.type;
        if (filters.status) query.status = filters.status;
        if (filters.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
        if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .populate('ride', 'pickup destination fare status')
            .limit(filters.limit || 50)
            .skip(filters.skip || 0);

        const total = await Transaction.countDocuments(query);

        return {
            transactions,
            total,
            hasMore: total > (filters.skip || 0) + transactions.length
        };
    }

    static async createTransaction(data) {
        const transaction = new Transaction(data);
        await transaction.save();
        return transaction;
    }

    static async getTransactionStats(userId) {
        const stats = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyStats = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        return {
            byType: stats,
            monthly: monthlyStats
        };
    }
}

module.exports = VaultService; 