const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { rateLimiter } = require('../middleware/rateLimiter');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  console.log('✅ /auth/test endpoint hit!');
  res.json({ message: 'Auth route is working!', timestamp: new Date().toISOString() });
});

// Send OTP endpoint with rate limiting
router.post('/send-otp', (req, res, next) => {
  console.log('🔵 Rate limiter middleware executing...');
  rateLimiter(req, res, next);
}, authController.sendOTP);

// Verify OTP endpoint
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;

