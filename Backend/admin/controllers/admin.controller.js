const AdminService = require('../services/admin.service');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

class AdminController {
    // Dashboard
    static async getDashboardStats(req, res) {
        try {
            const stats = await AdminService.getDashboardStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // User Management
    static async getAllUsers(req, res) {
        try {
            const users = await AdminService.getAllUsers(req.query);
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Driver Management
    static async getAllDrivers(req, res) {
        try {
            const drivers = await AdminService.getAllDrivers(req.query);
            res.json(drivers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Ride Management
    static async getAllRides(req, res) {
        try {
            const rides = await AdminService.getAllRides(req.query);
            res.json(rides);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Admin Management
    static async getAllAdmins(req, res) {
        try {
            const admins = await AdminService.getAllAdmins(req.query);
            res.json(admins);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Admin Registration
    static async register(req, res) {
        try {
            const { name, email, password, role } = req.body;

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin already exists' });
            }

            // Create new admin
            const admin = new Admin({
                name,
                email,
                password,
                role: role || 'admin',
                permissions: ['manage_users', 'manage_drivers', 'manage_rides', 'view_reports']
            });

            await admin.save();

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: admin._id,
                    role: admin.role,
                    type: 'admin'
                },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Admin registered successfully',
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Admin Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find admin
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Update login info
            admin.lastLogin = new Date();
            admin.loginAttempts = 0;
            await admin.save();

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: admin._id,
                    role: admin.role,
                    type: 'admin'
                },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //restart server
    static async getDashboardStats(req, res) {
        try {
            const stats = await AdminService.getDashboardStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AdminController; 