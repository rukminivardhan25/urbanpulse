const Request = require('../models/Request');
const Helper = require('../models/Helper');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to extract user from JWT token
 */
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Generate unique request ID: REQ + timestamp
 */
const generateRequestId = () => {
  const timestamp = Date.now().toString();
  return `REQ${timestamp}`;
};

/**
 * Create a new help request
 * POST /requests
 */
exports.createRequest = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const {
      requestType,
      subcategory,
      customSubcategory,
      description,
      quantity,
      urgency,
      location,
      contactPreference,
      contactDetails,
    } = req.body;

    // Validation
    if (!requestType || !subcategory || !description) {
      return res.status(400).json({ success: false, message: 'Request Type, Subcategory, and Description are required.' });
    }

    if (!location || !location.city || !location.area) {
      return res.status(400).json({ success: false, message: 'Location (City and Area) is required.' });
    }

    if (!contactPreference || contactPreference.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one contact method is required.' });
    }

    // Validate contact details for selected preferences
    for (const pref of contactPreference) {
      if (!contactDetails || !contactDetails[pref] || contactDetails[pref].trim() === '') {
        return res.status(400).json({ success: false, message: `Contact details for ${pref} are required.` });
      }
    }

    // Generate request ID
    const requestId = generateRequestId();

    // Create request
    const newRequest = new Request({
      requestId,
      userId: userData.userId,
      requestType,
      subcategory,
      customSubcategory: customSubcategory || '',
      description: description.trim(),
      quantity: quantity || '',
      urgency: urgency || 'medium',
      location: {
        state: location.state || '',
        district: location.district || '',
        mandal: location.mandal || '',
        city: location.city,
        area: location.area,
        pincode: location.pincode || '',
        landmark: location.landmark || '',
        detailedAddress: location.detailedAddress || '',
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      },
      contactPreference,
      contactDetails: {
        mobile: contactDetails.mobile || '',
        whatsapp: contactDetails.whatsapp || '',
        mail: contactDetails.mail || '',
        other: contactDetails.other || '',
      },
      status: 'Approved', // Requests are immediately visible to all users
    });

    await newRequest.save();

    console.log(`✅ Request created: ${newRequest.requestId}, Status: ${newRequest.status}`);

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: {
        requestId: newRequest.requestId,
        status: newRequest.status,
      },
    });
  } catch (error) {
    console.error('❌ Error creating request:', error);
    res.status(500).json({ success: false, message: 'Failed to create request', error: error.message });
  }
};

/**
 * Get all requests created by the logged-in user
 * GET /requests/my-requests
 */
exports.getUserRequests = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const requests = await Request.find({ userId: userData.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get helper counts for all requests
    const requestIds = requests.map(r => r._id);
    const helperCounts = await Helper.aggregate([
      { $match: { requestId: { $in: requestIds } } },
      { $group: { _id: '$requestId', count: { $sum: 1 } } }
    ]);

    const helperCountMap = {};
    helperCounts.forEach(item => {
      helperCountMap[item._id.toString()] = item.count;
    });

    const formattedRequests = requests.map((request) => ({
      id: request._id,
      requestId: request.requestId,
      requestType: request.requestType,
      subcategory: request.subcategory,
      customSubcategory: request.customSubcategory,
      description: request.description,
      quantity: request.quantity,
      urgency: request.urgency,
      status: request.status,
      location: {
        state: request.location.state,
        district: request.location.district,
        mandal: request.location.mandal,
        city: request.location.city,
        area: request.location.area,
        pincode: request.location.pincode,
        landmark: request.location.landmark,
        detailedAddress: request.location.detailedAddress,
      },
      contactPreference: request.contactPreference,
      contactDetails: request.contactDetails,
      createdAt: request.createdAt,
      approvedAt: request.approvedAt,
      rejectedAt: request.rejectedAt,
      rejectionReason: request.rejectionReason,
      helperCount: helperCountMap[request._id.toString()] || 0,
    }));

    res.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error('❌ Error fetching user requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
};

/**
 * Get all approved requests (visible to all users in Help Requests)
 * GET /requests/approved
 */
exports.getApprovedRequests = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    // Get all approved requests - exclude requests created by the current user
    // Users should see only other users' requests in Help Requests
    // Mongoose automatically converts string to ObjectId for comparison
    const requests = await Request.find({ 
      status: 'Approved',
      userId: { $ne: userData.userId } // Exclude current user's requests
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📋 Found ${requests.length} approved requests for Help Requests (excluding user's own requests)`);

    const formattedRequests = requests.map((request) => ({
      id: request._id,
      requestId: request.requestId,
      requestType: request.requestType,
      subcategory: request.subcategory,
      customSubcategory: request.customSubcategory,
      description: request.description,
      quantity: request.quantity,
      urgency: request.urgency,
      location: {
        state: request.location.state,
        district: request.location.district,
        mandal: request.location.mandal,
        city: request.location.city,
        area: request.location.area,
        pincode: request.location.pincode,
        landmark: request.location.landmark,
        detailedAddress: request.location.detailedAddress,
        summary: `${request.location.area || ''}, ${request.location.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
      },
      contactPreference: request.contactPreference,
      contactDetails: request.contactDetails,
      createdAt: request.createdAt,
    }));

    res.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error('❌ Error fetching approved requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch approved requests', error: error.message });
  }
};

/**
 * Get a single request by ID (for viewing details)
 * GET /requests/:id
 */
exports.getRequestById = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { id } = req.params;
    const request = await Request.findOne({ _id: id }).lean();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // User can only view their own requests OR approved requests
    const isOwnRequest = request.userId.toString() === userData.userId.toString();
    const isApproved = request.status === 'Approved';

    if (!isOwnRequest && !isApproved) {
      return res.status(403).json({ success: false, message: 'You can only view your own requests or approved requests.' });
    }

    res.json({
      success: true,
      data: {
        id: request._id,
        requestId: request.requestId,
        requestType: request.requestType,
        subcategory: request.subcategory,
        customSubcategory: request.customSubcategory,
        description: request.description,
        quantity: request.quantity,
        urgency: request.urgency,
        status: request.status,
        location: request.location,
        contactPreference: request.contactPreference,
        contactDetails: request.contactDetails,
        createdAt: request.createdAt,
        approvedAt: request.approvedAt,
        rejectedAt: request.rejectedAt,
        rejectionReason: request.rejectionReason,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching request:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request', error: error.message });
  }
};

/**
 * Delete a request (and all its helpers)
 * DELETE /requests/:id
 */
exports.deleteRequest = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // User can only delete their own requests
    if (request.userId.toString() !== userData.userId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own requests.' });
    }

    // Delete all helpers linked to this request
    await Helper.deleteMany({ requestId: request._id });

    // Delete the request
    await Request.findByIdAndDelete(id);

    console.log(`✅ Request deleted: ${request.requestId} by user ${userData.userId} (helpers also deleted)`);

    res.json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting request:', error);
    res.status(500).json({ success: false, message: 'Failed to delete request', error: error.message });
  }
};

