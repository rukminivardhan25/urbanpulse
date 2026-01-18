const Helper = require('../models/Helper');
const Request = require('../models/Request');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to extract user from JWT token
 */
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [getUserFromToken] No Authorization header or invalid format');
    return null;
  }

  const token = authHeader.substring(7);
  if (!token || token.length === 0) {
    console.log('❌ [getUserFromToken] Token is empty after Bearer prefix');
    return null;
  }

  console.log(`🔍 [getUserFromToken] Token length: ${token.length}, JWT_SECRET length: ${JWT_SECRET ? JWT_SECRET.length : 'undefined'}`);
  console.log(`🔍 [getUserFromToken] Token preview: ${token.substring(0, 20)}...`);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✅ [getUserFromToken] Token verified successfully, userId: ${decoded.userId}`);
    return decoded;
  } catch (error) {
    console.log(`❌ [getUserFromToken] Token verification failed: ${error.message}`);
    console.log(`❌ [getUserFromToken] Error name: ${error.name}`);
    if (error.name === 'JsonWebTokenError') {
      console.log(`❌ [getUserFromToken] This is a JWT signature/format error`);
    } else if (error.name === 'TokenExpiredError') {
      console.log(`❌ [getUserFromToken] Token expired at: ${error.expiredAt}`);
    }
    return null;
  }
};

/**
 * Create a help offer for a request
 * POST /helpers
 */
exports.createHelper = async (req, res) => {
  try {
    console.log('📥 POST /helpers - Starting createHelper');
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      console.log('❌ Authorization failed - no userData or userId');
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }
    console.log('✅ Authorization successful - userId:', userData.userId);

    const { requestId, name, phone, message } = req.body;
    console.log('📋 Request body:', { requestId, name, phone: phone ? 'provided' : 'empty', message: message ? 'provided' : 'empty' });

    // Validation - Name is required, phone is optional
    if (!requestId || !name) {
      console.log('❌ Validation failed - missing requestId or name');
      return res.status(400).json({ success: false, message: 'Request ID and Name are required.' });
    }

    // Find the request
    console.log('🔍 Looking for request with ID:', requestId);
    const request = await Request.findOne({ $or: [{ _id: requestId }, { requestId: requestId }] });
    if (!request) {
      console.log('❌ Request not found:', requestId);
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }
    console.log('✅ Request found:', request.requestId, 'MongoDB _id:', request._id);

    // Check if user already helped this request
    const existingHelper = await Helper.findOne({
      requestId: request._id,
      helperUserId: userData.userId,
    });

    if (existingHelper) {
      console.log('❌ User already helped this request');
      return res.status(400).json({ success: false, message: 'You have already offered help for this request.' });
    }

    // Create help offer
    console.log('📝 Creating new Helper document...');
    console.log('📋 Helper data:', {
      requestId: request._id,
      requestIdString: request.requestId,
      helperUserId: userData.userId,
      requesterUserId: request.userId,
      helperName: name.trim(),
    });
    const helper = new Helper({
      requestId: request._id,
      requestIdString: request.requestId,
      helperUserId: userData.userId,  // User-2 (person helping)
      requesterUserId: request.userId, // User-1 (person who created request)
      helperName: name.trim(),
      helperPhone: phone ? phone.trim() : '',
      helperMessage: message ? message.trim() : '',
    });

    console.log('💾 Saving helper to database...');
    await helper.save();
    console.log('✅ Helper saved successfully! Helper ID:', helper._id);

    console.log(`✅ Help offer created for request ${request.requestId} by user ${userData.userId}`);

    res.status(201).json({
      success: true,
      message: 'Your help offer has been sent.',
      data: {
        helperId: helper._id,
        requestId: request.requestId,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      console.log('❌ Duplicate key error - user already helped this request');
      return res.status(400).json({ success: false, message: 'You have already offered help for this request.' });
    }
    console.error('❌ Error creating help offer:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Failed to create help offer', error: error.message });
  }
};

/**
 * Get all helpers for a specific request (only request creator can view)
 * GET /helpers/request/:requestId
 */
exports.getHelpersByRequest = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { requestId } = req.params;

    // Find the request
    const request = await Request.findOne({ $or: [{ _id: requestId }, { requestId: requestId }] });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Only request creator can view helpers
    if (request.userId.toString() !== userData.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the request creator can view helpers.' });
    }

    // Get all helpers for this request
    const helpers = await Helper.find({ requestId: request._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedHelpers = helpers.map((helper) => ({
      id: helper._id,
      helperName: helper.helperName,
      helperPhone: helper.helperPhone,
      helperMessage: helper.helperMessage,
      createdAt: helper.createdAt,
    }));

    res.json({ success: true, data: formattedHelpers });
  } catch (error) {
    console.error('❌ Error fetching helpers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch helpers', error: error.message });
  }
};

/**
 * Get helper count for a request
 * GET /helpers/count/:requestId
 */
exports.getHelperCount = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { requestId } = req.params;

    // Find the request
    const request = await Request.findOne({ $or: [{ _id: requestId }, { requestId: requestId }] });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Only request creator can view helper count
    if (request.userId.toString() !== userData.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the request creator can view helper count.' });
    }

    const count = await Helper.countDocuments({ requestId: request._id });

    res.json({ success: true, count });
  } catch (error) {
    console.error('❌ Error fetching helper count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch helper count', error: error.message });
  }
};

/**
 * Get helper record for current user and request (for helper to chat)
 * GET /helpers/user/:requestId
 */
exports.getUserHelper = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { requestId } = req.params;

    // Find the request
    const request = await Request.findOne({ $or: [{ _id: requestId }, { requestId: requestId }] });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Find helper record for current user and this request
    const helper = await Helper.findOne({
      requestId: request._id,
      helperUserId: userData.userId,
    });

    if (!helper) {
      return res.status(404).json({ success: false, message: 'Helper record not found. You need to offer help first.' });
    }

    res.json({ success: true, data: helper });
  } catch (error) {
    console.error('❌ Error fetching user helper:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch helper record', error: error.message });
  }
};

