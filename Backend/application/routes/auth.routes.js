const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const adminController = require('../../admin/controllers/admin.controller');

// Public routes
router.post('/register/user', authController.registerUser);
router.post('/register/captain', authController.registerCaptain);
router.post('/login/user', authController.loginUser);
router.post('/login/captain', authController.loginCaptain);
router.post('/register/admin', adminController.register);
router.post('/login/admin', adminController.login);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getProfile);
router.post('/logout', authController.logout);

module.exports = router; 