const User = require('../models/User');
const otpService = require('../services/otpService');
const fast2smsService = require('../services/fast2sms');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MOCK_OTP = process.env.MOCK_OTP === 'true';

/**
 * Send OTP to phone number
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Generate and store OTP
    const otp = otpService.generateOTP();
    await otpService.storeOTP(phone, otp);

    // Send OTP via Fast2SMS
    try {
      await fast2smsService.sendOTP(phone, otp);
      console.log(`✅ OTP sent successfully to ${phone}`);
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError.message);
      // In development, show OTP in console
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔑 ===== OTP GENERATED =====`);
        console.log(`📱 Phone: ${phone}`);
        console.log(`🔑 OTP: ${otp}`);
        console.log(`💡 Use this OTP to verify (only shown in development mode)`);
        console.log(`================================`);
      }
    }

    // Set resend cooldown
    otpService.setResendCooldown(phone);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
    });
  }
};

/**
 * Verify OTP and handle login/signup
 * Business Logic:
 * - If phone exists and request contains name/location: Return error "Account already exists."
 * - If phone exists and no name provided: Login user, return token.
 * - If phone does not exist and name provided: Create new user.
 * - If phone does not exist and no name: Return error "No account found. Please use Get Started."
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, city, area, pincode, state } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // MOCK OTP MODE: Skip OTP validation if enabled
    if (MOCK_OTP) {
      console.log('⚠️  MOCK OTP MODE ENABLED — Any OTP will be accepted');
      console.log(`📱 Phone: ${phone}, OTP entered: ${otp}`);
      // Still delete OTP if it exists (cleanup)
      if (otpService.getOTP(phone)) {
        otpService.deleteOTP(phone);
      }
    } else {
      // Normal OTP verification flow
      // Verify OTP
      const otpData = otpService.getOTP(phone);
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired or invalid. Please request a new OTP.',
        });
      }

      // Check brute force protection
      if (otpService.isBlocked(phone)) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please request a new OTP.',
        });
      }

      // Verify OTP
      const isValid = await otpService.verifyOTP(otp, otpData.hashedOTP);
      if (!isValid) {
        otpService.incrementAttempts(phone);
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP. Please try again.',
        });
      }

      // OTP is valid, delete it
      otpService.deleteOTP(phone);
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    // Business Logic Implementation
    if (user) {
      // User exists
      if (name || city || area || pincode || state) {
        // Request contains name/location - this is a signup attempt for existing user
        return res.status(400).json({
          success: false,
          message: 'Account already exists. Please use "Already have an account".',
        });
      } else {
        // No name provided - this is a login attempt
        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, phone: user.phone },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        return res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            city: user.city,
            area: user.area,
            mandal: user.mandal || '',
            district: user.district || '',
            pincode: user.pincode,
            state: user.state,
          },
        });
      }
    } else {
      // User does not exist
      if (!name) {
        // No name provided - this is a login attempt for non-existent user
        return res.status(404).json({
          success: false,
          message: 'No account found. Please use "Get Started".',
        });
      } else {
        // Name provided - this is a signup attempt
        // Create new user
        user = new User({
          name,
          phone,
          city: city || '',
          area: area || '',
          mandal: req.body.mandal || '',
          district: req.body.district || '',
          pincode: pincode || '',
          state: state || '',
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, phone: user.phone },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        return res.json({
          success: true,
          message: 'Account created successfully',
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            city: user.city,
            area: user.area,
            mandal: user.mandal || '',
            district: user.district || '',
            pincode: user.pincode,
            state: user.state,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    
    // Handle duplicate phone error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists. Please use "Already have an account".',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    });
  }
};
