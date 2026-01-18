const Admin = require('../models/Admin');
const otpService = require('../services/otpService');
const fast2smsService = require('../services/fast2sms');
const adminService = require('../services/adminService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';
const MOCK_OTP = process.env.MOCK_OTP === 'true';

/**
 * Middleware to verify admin JWT token
 */
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    req.adminCity = decoded.city;
    req.adminArea = decoded.area;
    req.adminState = decoded.state;
    req.adminDistrict = decoded.district;
    req.adminMandal = decoded.mandal;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Export middleware for use in routes
exports.verifyAdminToken = verifyAdminToken;

/**
 * Send OTP to admin phone number
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
      console.log(`✅ Admin OTP sent successfully to ${phone}`);
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError.message);
      // In development, show OTP in console
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔑 ===== ADMIN OTP GENERATED =====`);
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
    });
  } catch (error) {
    console.error('Error sending admin OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

/**
 * Verify OTP and create/login admin
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name, city, area, mandal, district, state, pincode } = req.body;

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
      // Check if OTP exists and is valid
      const otpData = otpService.getOTP(phone);
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired or not found. Please request a new OTP.',
        });
      }

      // Check brute force protection
      if (otpService.isBlocked(phone)) {
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
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

      // OTP is valid - delete it
      otpService.deleteOTP(phone);
    }

    // Check if admin exists
    const adminExists = await adminService.checkAdminExists(phone);
    let admin;

    if (adminExists) {
      // Existing admin - login
      admin = await adminService.getAdminByPhone(phone);
      
      if (!admin.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is deactivated',
        });
      }

      // Update last login
      await adminService.updateLastLogin(admin._id);

      // If location provided, update it
      if (city && area) {
        await adminService.updateAdminLocation(admin._id, {
          city,
          area,
          mandal: mandal || '',
          district: district || '',
          state,
          pincode,
        });
        admin = await adminService.getAdminByPhone(phone); // Refresh admin data
      }
    } else {
      // New admin - create account
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for new admin account',
        });
      }

      if (!city || !area) {
        return res.status(400).json({
          success: false,
          message: 'City and area are required for new admin account',
        });
      }

      admin = await adminService.createAdmin({
        name,
        phone,
        city,
        area,
        mandal: mandal || '',
        district: district || '',
        state: state || '',
        pincode: pincode || '',
        role: 'admin',
        isActive: true,
      });

      console.log(`✅ New admin account created: ${admin.name} (${admin.phone})`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        phone: admin.phone,
        role: 'admin',
        city: admin.city,
        area: admin.area,
        mandal: admin.mandal || '',
        district: admin.district || '',
        state: admin.state || '',
      },
      JWT_SECRET,
      { expiresIn: '30d' } // Admin tokens last 30 days
    );

    res.json({
      success: true,
      message: adminExists ? 'Login successful' : 'Admin account created successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        phone: admin.phone,
        city: admin.city,
        area: admin.area,
        mandal: admin.mandal || '',
        district: admin.district || '',
        state: admin.state,
        pincode: admin.pincode,
        role: admin.role,
      },
      isNewAdmin: !adminExists,
    });
  } catch (error) {
    console.error('Error verifying admin OTP:', error);
    
    // Handle duplicate phone error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already exists with this phone number',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
};

/**
 * Check if admin exists by phone number
 */
exports.checkAdminExists = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const exists = await adminService.checkAdminExists(phone);

    res.json({
      success: true,
      exists,
    });
  } catch (error) {
    console.error('Error checking admin existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check admin existence',
      error: error.message,
    });
  }
};

/**
 * Get current admin profile
 * GET /admin/me
 */
exports.getMe = async (req, res) => {
  try {
    // Admin ID is set by verifyAdminToken middleware
    const adminId = req.adminId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Fetch admin from database
    const admin = await Admin.findById(adminId).select('-__v');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated',
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        phone: admin.phone,
        city: admin.city,
        area: admin.area,
        mandal: admin.mandal || '',
        district: admin.district || '',
        state: admin.state || '',
        pincode: admin.pincode || '',
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
      error: error.message,
    });
  }
};

