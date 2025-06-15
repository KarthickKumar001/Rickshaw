const User = require('../../application/models/user.model');
const Captain = require('../../application/models/captain.model');
const Ride = require('../../application/models/ride.model');
const Admin = require('../models/admin.model');

class AdminService {
    // Dashboard Statistics
    static async getDashboardStats() {
        try {
            const totalUsers = await User.countDocuments();
            const totalDrivers = await Captain.countDocuments();
            const totalRides = await Ride.countDocuments();
            const activeDrivers = await Captain.countDocuments({ status: 'active' });
            const pendingDrivers = await Captain.countDocuments({ status: 'pending' });
            const completedRides = await Ride.countDocuments({ status: 'completed' });
            const totalRevenue = await Ride.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$fare' } } }
            ]);

            return {
                totalUsers,
                totalDrivers,
                totalRides,
                activeDrivers,
                pendingDrivers,
                completedRides,
                totalRevenue: totalRevenue[0]?.total || 0
            };
        } catch (error) {
            throw error;
        }
    }

    // User Management
    static async getAllUsers(query = {}) {
        try {
            const { page = 1, limit = 10, status, search } = query;
            const filter = {};

            if (status) filter.status = status;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await User.find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-password');

            const total = await User.countDocuments(filter);

            return {
                users,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw error;
        }
    }

    // Driver Management
    static async getAllDrivers(query = {}) {
        try {
            const { page = 1, limit = 10, status, search } = query;
            const filter = {};

            if (status) filter.status = status;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const drivers = await Captain.find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-password')
                .populate('documents');

            const total = await Captain.countDocuments(filter);

            return {
                drivers,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw error;
        }
    }

    // Ride Management
    static async getAllRides(query = {}) {
        try {
            const { page = 1, limit = 10, status, search } = query;
            const filter = {};

            if (status) filter.status = status;
            if (search) {
                filter.$or = [
                    { 'user.name': { $regex: search, $options: 'i' } },
                    { 'captain.name': { $regex: search, $options: 'i' } }
                ];
            }

            const rides = await Ride.find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('user', 'name email')
                .populate('captain', 'name email');

            const total = await Ride.countDocuments(filter);

            return {
                rides,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw error;
        }
    }

    // Admin Management
    static async getAllAdmins(query = {}) {
        try {
            const { page = 1, limit = 10, role, status } = query;
            const filter = {};

            if (role) filter.role = role;
            if (status) filter.status = status;

            const admins = await Admin.find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-password');

            const total = await Admin.countDocuments(filter);

            return {
                admins,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService; 