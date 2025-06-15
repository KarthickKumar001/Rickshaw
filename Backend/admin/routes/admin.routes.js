const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../../application/middleware/auth');

// Public routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Protected routes
router.use(authenticate);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);

// Driver Management
router.get('/drivers', adminController.getAllDrivers);

// Ride Management
router.get('/rides', adminController.getAllRides);

// Admin Management
router.get('/admins', adminController.getAllAdmins);

module.exports = router; 