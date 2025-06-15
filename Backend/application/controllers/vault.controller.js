const VaultService = require('../services/vault.service');

// Add money to vault
exports.addMoney = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user._id;

        const vault = await VaultService.addMoney(userId, amount, description);
        res.status(200).json({
            message: 'Money added successfully',
            vault
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get vault balance
exports.getBalance = async (req, res) => {
    try {
        const userId = req.user._id;
        const balance = await VaultService.getVaultBalance(userId);
        res.status(200).json(balance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const filters = {
            type: req.query.type,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            limit: parseInt(req.query.limit) || 50,
            skip: parseInt(req.query.skip) || 0
        };

        const result = await VaultService.getTransactionHistory(userId, filters);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const stats = await VaultService.getTransactionStats(userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactionId = req.params.transactionId;

        const transaction = await Transaction.findOne({
            _id: transactionId,
            user: userId
        }).populate('ride', 'pickup destination fare status vehicleType');

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Hold money for ride
exports.holdMoneyForRide = async (req, res) => {
    try {
        const { rideId, amount } = req.body;
        const userId = req.user._id;

        const vault = await VaultService.holdMoneyForRide(userId, rideId, amount);
        res.status(200).json({
            message: 'Money held successfully',
            vault
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Release money to driver
exports.releaseMoneyToDriver = async (req, res) => {
    try {
        const { rideId } = req.params;
        const result = await VaultService.releaseMoneyToDriver(rideId);
        res.status(200).json({
            message: 'Money released to driver successfully',
            result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Refund cancelled ride
exports.refundCancelledRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const vault = await VaultService.refundCancelledRide(rideId);
        res.status(200).json({
            message: 'Refund processed successfully',
            vault
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 