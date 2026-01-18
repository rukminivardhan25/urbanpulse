const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Get current user profile
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        state: user.state,
        district: user.district,
        mandal: user.mandal || '',
        city: user.city,
        area: user.area,
        pincode: user.pincode,
        address: user.address,
        streetNumber: user.streetNumber,
        houseNumber: user.houseNumber,
        landmark: user.landmark,
        latitude: user.latitude,
        longitude: user.longitude,
        locationHistory: user.locationHistory || [],
      },
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
    });
  }
};

/**
 * Update user location
 */
exports.updateLocation = async (req, res) => {
  try {
    const { 
      state, 
      district,
      mandal,
      city, 
      area, 
      pincode, 
      address, 
      streetNumber,
      houseNumber,
      landmark,
      latitude, 
      longitude 
    } = req.body;

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if location is changing
    const isLocationChanging = 
      (state !== undefined && state !== user.state) ||
      (district !== undefined && district !== user.district) ||
      (mandal !== undefined && mandal !== user.mandal) ||
      (city !== undefined && city !== user.city) ||
      (area !== undefined && area !== user.area);

    // If location is changing, save current location to history
    if (isLocationChanging && (user.area || user.city || user.state)) {
      const currentLocation = {
        state: user.state,
        district: user.district,
        mandal: user.mandal || '',
        city: user.city,
        area: user.area,
        pincode: user.pincode,
        address: user.address,
        streetNumber: user.streetNumber,
        houseNumber: user.houseNumber,
        landmark: user.landmark,
        latitude: user.latitude,
        longitude: user.longitude,
        savedAt: new Date(),
      };

      // Initialize locationHistory if it doesn't exist
      if (!user.locationHistory) {
        user.locationHistory = [];
      }

      // Check if this location already exists in history (avoid duplicates)
      const locationExists = user.locationHistory.some(loc => 
        loc.area === currentLocation.area &&
        loc.city === currentLocation.city &&
        loc.mandal === currentLocation.mandal &&
        loc.district === currentLocation.district &&
        loc.state === currentLocation.state
      );

      // Add to history if it's not a duplicate
      if (!locationExists) {
        user.locationHistory.unshift(currentLocation);
        
        // Keep only last 10 locations in history
        if (user.locationHistory.length > 10) {
          user.locationHistory = user.locationHistory.slice(0, 10);
        }
      }
    }

    // Update location fields
    if (state !== undefined) user.state = state;
    if (district !== undefined) user.district = district;
    if (mandal !== undefined) user.mandal = mandal;
    if (city !== undefined) user.city = city;
    if (area !== undefined) user.area = area;
    if (pincode !== undefined) user.pincode = pincode;
    if (address !== undefined) user.address = address;
    if (streetNumber !== undefined) user.streetNumber = streetNumber;
    if (houseNumber !== undefined) user.houseNumber = houseNumber;
    if (landmark !== undefined) user.landmark = landmark;
    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;

    await user.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        state: user.state,
        district: user.district,
        mandal: user.mandal || '',
        city: user.city,
        area: user.area,
        pincode: user.pincode,
        address: user.address,
        streetNumber: user.streetNumber,
        houseNumber: user.houseNumber,
        landmark: user.landmark,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error('Error in updateLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
    });
  }
};

/**
 * Check if user exists by phone number (public endpoint, no auth required)
 */
exports.checkUserExists = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const user = await User.findOne({ phone });
    
    res.json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    console.error('Error in checkUserExists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user existence',
    });
  }
};

// Export middleware
exports.verifyToken = verifyToken;
