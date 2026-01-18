const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public endpoint - check if user exists (no auth required)
router.get('/exists', userController.checkUserExists);

// All other user routes require authentication
router.use(userController.verifyToken);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update user location
router.put('/update-location', userController.updateLocation);

module.exports = router;
