const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { rateLimiter } = require('../middleware/rateLimiter');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  console.log('✅ /admin/auth/test endpoint hit!');
  res.json({ message: 'Admin auth route is working!', timestamp: new Date().toISOString() });
});

// Send OTP endpoint with rate limiting
router.post('/send-otp', (req, res, next) => {
  console.log('🔵 Admin rate limiter middleware executing...');
  rateLimiter(req, res, next);
}, adminAuthController.sendOTP);

// Verify OTP endpoint
router.post('/verify-otp', adminAuthController.verifyOTP);

// Check if admin exists
router.get('/check-exists', adminAuthController.checkAdminExists);

// Get current admin profile (requires authentication)
router.get('/me', adminAuthController.verifyAdminToken, adminAuthController.getMe);

module.exports = router;




