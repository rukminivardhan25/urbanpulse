const Request = require('../models/Request');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';

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

/**
 * Get admin data from token
 */
const getAdminFromToken = (req) => {
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
 * Get all requests (for admin)
 * GET /requests
 * Query params: status (optional filter)
 */
exports.getAllRequests = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

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
        summary: `${request.location.area || ''}, ${request.location.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
      },
      contactPreference: request.contactPreference,
      contactDetails: request.contactDetails,
      user: {
        id: request.userId?._id,
        name: request.userId?.name || 'Unknown',
        phone: request.userId?.phone || '',
      },
      createdAt: request.createdAt,
      approvedAt: request.approvedAt,
      rejectedAt: request.rejectedAt,
      rejectionReason: request.rejectionReason,
      approvedBy: request.approvedBy,
      rejectedBy: request.rejectedBy,
    }));

    res.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
  }
};

/**
 * Get a single request by ID (admin view)
 * GET /requests/:id
 */
exports.getRequestById = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { id } = req.params;
    const request = await Request.findOne({ _id: id })
      .populate('userId', 'name phone')
      .lean();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
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
        user: {
          id: request.userId?._id,
          name: request.userId?.name || 'Unknown',
          phone: request.userId?.phone || '',
        },
        createdAt: request.createdAt,
        approvedAt: request.approvedAt,
        rejectedAt: request.rejectedAt,
        rejectionReason: request.rejectionReason,
        approvedBy: request.approvedBy,
        rejectedBy: request.rejectedBy,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching request:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request', error: error.message });
  }
};

/**
 * Approve a request
 * PATCH /requests/:id/approve
 */
exports.approveRequest = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Request is already approved.' });
    }

    if (request.status === 'Rejected') {
      return res.status(400).json({ success: false, message: 'Cannot approve a rejected request.' });
    }

    // Update request status
    request.status = 'Approved';
    request.approvedBy = adminData.id;
    request.approvedAt = new Date();
    // Clear rejection fields if any
    request.rejectedBy = null;
    request.rejectedAt = null;
    request.rejectionReason = '';

    await request.save();

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: {
        id: request._id,
        requestId: request.requestId,
        status: request.status,
      },
    });
  } catch (error) {
    console.error('❌ Error approving request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve request', error: error.message });
  }
};

/**
 * Reject a request
 * PATCH /requests/:id/reject
 */
exports.rejectRequest = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.status === 'Rejected') {
      return res.status(400).json({ success: false, message: 'Request is already rejected.' });
    }

    if (request.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Cannot reject an approved request.' });
    }

    // Update request status
    request.status = 'Rejected';
    request.rejectedBy = adminData.id;
    request.rejectedAt = new Date();
    request.rejectionReason = reason || 'Request rejected by admin';
    // Clear approval fields if any
    request.approvedBy = null;
    request.approvedAt = null;

    await request.save();

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: {
        id: request._id,
        requestId: request.requestId,
        status: request.status,
      },
    });
  } catch (error) {
    console.error('❌ Error rejecting request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject request', error: error.message });
  }
};

// Export verifyAdminToken for use in routes
exports.verifyAdminToken = verifyAdminToken;
