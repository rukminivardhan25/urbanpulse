const Issue = require('../models/Issue');
const Admin = require('../../admin-role/backend/models/Admin');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../services/notificationService');

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
 * Generate unique complaint ID: URB + timestamp
 */
const generateComplaintId = () => {
  const timestamp = Date.now().toString();
  return `URB${timestamp}`;
};

/**
 * Find and assign admin based on location
 * Priority: 1) State+District+Mandal+City+Area, 2) State+District+City+Area, 
 *           3) State+City+Area, 4) City+Area, 5) City, 6) Super-admin
 */
const assignAdminByLocation = async (state, district, mandal, city, area) => {
  try {
    // Build query conditions (case-insensitive matching)
    const buildQuery = (fields) => {
      const query = { isActive: true };
      if (fields.state && state) query.state = { $regex: new RegExp(`^${state}$`, 'i') };
      if (fields.district && district) query.district = { $regex: new RegExp(`^${district}$`, 'i') };
      if (fields.mandal && mandal) query.mandal = { $regex: new RegExp(`^${mandal}$`, 'i') };
      if (fields.city && city) query.city = { $regex: new RegExp(`^${city}$`, 'i') };
      if (fields.area && area) query.area = { $regex: new RegExp(`^${area}$`, 'i') };
      return query;
    };

    // Priority 1: State + District + Mandal + City + Area (exact match)
    if (state && district && mandal && city && area) {
      let admin = await Admin.findOne(buildQuery({ state: true, district: true, mandal: true, city: true, area: true }));
      if (admin) {
        console.log(`✅ Assigned to admin: ${admin.name} (Full match: ${state}, ${district}, ${mandal}, ${city}, ${area})`);
        return admin._id;
      }
    }

    // Priority 2: State + District + City + Area
    if (state && district && city && area) {
      let admin = await Admin.findOne(buildQuery({ state: true, district: true, city: true, area: true }));
      if (admin) {
        console.log(`✅ Assigned to admin: ${admin.name} (Match: ${state}, ${district}, ${city}, ${area})`);
        return admin._id;
      }
    }

    // Priority 3: State + City + Area
    if (state && city && area) {
      let admin = await Admin.findOne(buildQuery({ state: true, city: true, area: true }));
      if (admin) {
        console.log(`✅ Assigned to admin: ${admin.name} (Match: ${state}, ${city}, ${area})`);
        return admin._id;
      }
    }

    // Priority 4: City + Area
    if (city && area) {
      let admin = await Admin.findOne(buildQuery({ city: true, area: true }));
      if (admin) {
        console.log(`✅ Assigned to admin: ${admin.name} (Match: ${city}, ${area})`);
        return admin._id;
      }
    }

    // Priority 5: City only
    if (city) {
      let admin = await Admin.findOne(buildQuery({ city: true }));
      if (admin) {
        console.log(`✅ Assigned to admin: ${admin.name} (Match: ${city})`);
        return admin._id;
      }
    }

    // Priority 6: Fallback to any active admin (super-admin)
    let admin = await Admin.findOne({ isActive: true });
    if (admin) {
      console.log(`✅ Assigned to super-admin: ${admin.name} (Fallback assignment)`);
      return admin._id;
    }

    console.log('⚠️  No admin found for assignment');
    return null;
  } catch (error) {
    console.error('❌ Error finding admin:', error);
    return null;
  }
};

/**
 * Submit a new issue
 * POST /issues
 */
exports.createIssue = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const {
      issueType,
      description,
      priority = 'medium',
      location,
    } = req.body;

    // Validation
    if (!issueType) {
      return res.status(400).json({
        success: false,
        message: 'Issue type is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required',
      });
    }

    const { state, city, area } = location;
    if (!state || !city || !area) {
      return res.status(400).json({
        success: false,
        message: 'State, City, and Area are required',
      });
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be low, medium, or high',
      });
    }

    // Validate issue type
    const validIssueTypes = ['garbage', 'water', 'power', 'road', 'drainage', 'streetlight', 'other'];
    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue type',
      });
    }

    // Generate complaint ID
    const complaintId = generateComplaintId();

    // Create issue with initial status
    const issueData = {
      complaintId,
      userId: userData.userId,
      issueType,
      description: description.trim(),
      priority,
      status: 'Pending',
      location: {
        state: location.state.trim(),
        district: location.district?.trim() || '',
        mandal: location.mandal?.trim() || '',
        city: location.city.trim(),
        area: location.area.trim(),
        pincode: location.pincode?.trim() || '',
        fullAddress: location.address?.trim() || '',
        houseNumber: location.houseNumber?.trim() || '',
        streetNumber: location.streetNumber?.trim() || '',
        landmark: location.landmark?.trim() || '',
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      },
    };

    // Save issue
    const issue = new Issue(issueData);
    await issue.save();

    console.log(`📝 Issue created: ${complaintId} by user ${userData.userId}`);

    // Create notification: Complaint submitted
    await createNotification({
      userId: userData.userId,
      type: 'complaint_submitted',
      category: 'complaint',
      priority: 'normal',
      title: 'Complaint Submitted',
      message: `Your complaint ${complaintId} has been submitted successfully. Status: Pending`,
      relatedId: complaintId,
      relatedType: 'issue',
    });

    // Assign admin based on location (state, district, mandal, city, area)
    const assignedAdminId = await assignAdminByLocation(
      issueData.location.state,
      issueData.location.district,
      issueData.location.mandal,
      city,
      area
    );

    if (assignedAdminId) {
      // Update issue with assigned admin and change status
      issue.assignedAdminId = assignedAdminId;
      issue.status = 'Assigned';
      issue.statusHistory.push({
        status: 'Assigned',
        changedAt: new Date(),
        changedBy: assignedAdminId,
      });
      await issue.save();
      console.log(`👤 Issue ${complaintId} assigned to admin: ${assignedAdminId}`);

      // Create notification: Complaint assigned
      await createNotification({
        userId: userData.userId,
        type: 'complaint_assigned',
        category: 'complaint',
        priority: 'normal',
        title: 'Complaint Assigned',
        message: `Your complaint ${complaintId} has been assigned to an admin. Status: Assigned`,
        relatedId: complaintId,
        relatedType: 'issue',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Issue submitted successfully',
      data: {
        complaintId: issue.complaintId,
        status: issue.status,
        assignedAdminId: issue.assignedAdminId,
        createdAt: issue.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit issue',
      error: error.message,
    });
  }
};

/**
 * Get all issues for the logged-in user
 * GET /issues
 */
exports.getUserIssues = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const issues = await Issue.find({ userId: userData.userId })
      .sort({ createdAt: -1 }) // Newest first
      .select('complaintId status issueType createdAt location priority description assignedAdminId')
      .lean();

    // Format response with location summary and full location details
    const formattedIssues = issues.map((issue) => ({
      id: issue._id,
      complaintId: issue.complaintId,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      description: issue.description,
      submittedDate: issue.createdAt,
      assignedAdminId: issue.assignedAdminId || null,
      location: {
        summary: `${issue.location.area || ''}, ${issue.location.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
        state: issue.location.state,
        district: issue.location.district,
        mandal: issue.location.mandal,
        city: issue.location.city,
        area: issue.location.area,
        pincode: issue.location.pincode,
        fullAddress: issue.location.fullAddress,
        houseNumber: issue.location.houseNumber,
        streetNumber: issue.location.streetNumber,
        landmark: issue.location.landmark,
      },
    }));

    res.json({
      success: true,
      data: formattedIssues,
      count: formattedIssues.length,
    });
  } catch (error) {
    console.error('❌ Error fetching user issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message,
    });
  }
};

/**
 * Get a single issue by ID (for logged-in user only)
 * GET /issues/:id
 */
exports.getIssueById = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { id } = req.params;
    const issue = await Issue.findOne({
      _id: id,
      userId: userData.userId, // Ensure user can only see their own issues
    }).lean();

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: issue._id,
        complaintId: issue.complaintId,
        status: issue.status,
        issueType: issue.issueType,
        priority: issue.priority,
        description: issue.description,
        submittedDate: issue.createdAt,
        location: {
          summary: `${issue.location.area || ''}, ${issue.location.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
          ...issue.location,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue',
      error: error.message,
    });
  }
};

/**
 * Delete an issue (for logged-in user only)
 * DELETE /issues/:id
 */
exports.deleteIssue = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { id } = req.params;
    
    // Find issue and verify it belongs to the user
    const issue = await Issue.findOne({
      _id: id,
      userId: userData.userId, // Ensure user can only delete their own issues
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or you do not have permission to delete it',
      });
    }

    // Delete the issue
    await Issue.deleteOne({ _id: id });

    console.log(`🗑️  Issue ${issue.complaintId} deleted by user ${userData.userId}`);

    res.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete issue',
      error: error.message,
    });
  }
};

