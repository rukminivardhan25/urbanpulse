const Issue = require('../../backend/models/Issue');
const User = require('../../backend/models/User'); // Required for populate to work
const { createNotification, createNotificationsForUsers, getUsersByLocation } = require('../../../backend/services/notificationService');
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
 * Get all issues assigned to the logged-in admin
 * GET /issues
 * Query params: status (optional filter)
 */
exports.getAdminIssues = async (req, res) => {
  // Extract admin info at function scope so it's available in catch block
  const adminId = req.adminId;
  const adminState = req.adminState || req.admin?.state;
  const adminDistrict = req.adminDistrict || req.admin?.district;
  const adminMandal = req.adminMandal || req.admin?.mandal;
  const adminCity = req.adminCity || req.admin?.city;
  const adminArea = req.adminArea || req.admin?.area;

  try {

    // Build query - admin can see:
    // 1. Issues assigned to them
    // 2. Unassigned issues (assignedAdminId: null) that match their location
    const locationMatch = {};
    if (adminState && adminState.trim()) {
      locationMatch['location.state'] = { $regex: new RegExp(`^${adminState.trim()}$`, 'i') };
    }
    if (adminDistrict && adminDistrict.trim()) {
      locationMatch['location.district'] = { $regex: new RegExp(`^${adminDistrict.trim()}$`, 'i') };
    }
    if (adminMandal && adminMandal.trim()) {
      locationMatch['location.mandal'] = { $regex: new RegExp(`^${adminMandal.trim()}$`, 'i') };
    }
    if (adminCity && adminCity.trim()) {
      locationMatch['location.city'] = { $regex: new RegExp(`^${adminCity.trim()}$`, 'i') };
    }
    if (adminArea && adminArea.trim()) {
      locationMatch['location.area'] = { $regex: new RegExp(`^${adminArea.trim()}$`, 'i') };
    }

    // Build base query conditions
    const baseConditions = [{ assignedAdminId: adminId }]; // Assigned to this admin

    // If we have location fields, add unassigned matching issues
    if (Object.keys(locationMatch).length > 0) {
      baseConditions.push({
        assignedAdminId: null, // Not assigned yet
        ...locationMatch, // But matches admin's location
      });
    }

    const query = { $or: baseConditions };

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    console.log('🔍 Admin issues query:', JSON.stringify(query, null, 2));
    console.log('📍 Admin location:', { adminState, adminDistrict, adminMandal, adminCity, adminArea });

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .populate('userId', 'name phone')
      .lean();

    // Format response
    const formattedIssues = issues.map((issue) => ({
      id: issue._id,
      complaintId: issue.complaintId,
      status: issue.status,
      issueType: issue.issueType,
      priority: issue.priority,
      description: issue.description,
      submittedDate: issue.createdAt,
      updatedAt: issue.updatedAt,
      assignedAdminId: issue.assignedAdminId || null,
      user: {
        id: issue.userId?._id,
        name: issue.userId?.name || 'Unknown',
        phone: issue.userId?.phone || '',
      },
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
      statusHistory: issue.statusHistory || [],
    }));

    res.json({
      success: true,
      data: formattedIssues,
      count: formattedIssues.length,
    });
  } catch (error) {
    console.error('❌ Error fetching admin issues:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Admin ID:', adminId);
    console.error('❌ Admin location:', { adminState, adminDistrict, adminMandal, adminCity, adminArea });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message,
    });
  }
};

/**
 * Get a single issue by ID (only if assigned to admin)
 * GET /issues/:id
 */
exports.getIssueById = async (req, res) => {
  try {
    const adminId = req.adminId;
    const { id } = req.params;

    const issue = await Issue.findOne({
      _id: id,
      assignedAdminId: adminId, // Ensure admin can only see their assigned issues
    })
      .populate('userId', 'name phone')
      .lean();

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or not assigned to you',
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
        updatedAt: issue.updatedAt,
        user: {
          id: issue.userId?._id,
          name: issue.userId?.name || 'Unknown',
          phone: issue.userId?.phone || '',
        },
        location: {
          summary: `${issue.location.area || ''}, ${issue.location.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim(),
          ...issue.location,
        },
        statusHistory: issue.statusHistory || [],
        internalNotes: issue.internalNotes || [],
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
 * Update issue status
 * PATCH /issues/:id/status
 * Body: { status: 'Assigned' | 'In Progress' | 'Resolved' }
 */
exports.updateIssueStatus = async (req, res) => {
  try {
    const adminId = req.adminId;
    const adminState = req.adminState || req.admin?.state;
    const adminDistrict = req.adminDistrict || req.admin?.district;
    const adminMandal = req.adminMandal || req.admin?.mandal;
    const adminCity = req.adminCity || req.admin?.city;
    const adminArea = req.adminArea || req.admin?.area;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Find issue - check if assigned to this admin OR unassigned and matches location
    let issue = await Issue.findOne({
      _id: id,
      assignedAdminId: adminId,
    });

    // If not found, check if it's unassigned and matches admin's location
    if (!issue) {
      const locationMatch = {};
      if (adminState && adminState.trim()) {
        locationMatch['location.state'] = { $regex: new RegExp(`^${adminState.trim()}$`, 'i') };
      }
      if (adminDistrict && adminDistrict.trim()) {
        locationMatch['location.district'] = { $regex: new RegExp(`^${adminDistrict.trim()}$`, 'i') };
      }
      if (adminMandal && adminMandal.trim()) {
        locationMatch['location.mandal'] = { $regex: new RegExp(`^${adminMandal.trim()}$`, 'i') };
      }
      if (adminCity && adminCity.trim()) {
        locationMatch['location.city'] = { $regex: new RegExp(`^${adminCity.trim()}$`, 'i') };
      }
      if (adminArea && adminArea.trim()) {
        locationMatch['location.area'] = { $regex: new RegExp(`^${adminArea.trim()}$`, 'i') };
      }

      issue = await Issue.findOne({
        _id: id,
        assignedAdminId: null,
        ...locationMatch,
      });

      // If found and unassigned, auto-assign to this admin
      if (issue) {
        issue.assignedAdminId = adminId;
        // If status is "Pending", we'll update it to the requested status below
        console.log(`✅ Issue ${issue.complaintId} auto-assigned to admin ${adminId}`);
      }
    }

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or you do not have permission to update it',
      });
    }

    // Update status and add to history
    const oldStatus = issue.status;
    // Update status if it's different from current
    if (issue.status !== status) {
      // If transitioning from "Pending" to something else, also add "Assigned" to history first
      if (issue.status === 'Pending' && status !== 'Pending' && status !== 'Assigned') {
        issue.statusHistory.push({
          status: 'Assigned',
          changedAt: new Date(),
          changedBy: adminId,
        });
      }
      issue.status = status;
      issue.statusHistory.push({
        status: status,
        changedAt: new Date(),
        changedBy: adminId,
      });
    }
    
    await issue.save();

    console.log(`📝 Issue ${issue.complaintId} status updated: ${oldStatus} → ${status} by admin ${adminId}`);

    // Create notification for user based on status change
    if (status === 'In Progress' && oldStatus !== 'In Progress') {
      await createNotification({
        userId: issue.userId,
        type: 'complaint_in_progress',
        category: 'complaint',
        priority: 'normal',
        title: 'Complaint In Progress',
        message: `Your complaint ${issue.complaintId} is now being worked on. Status: In Progress`,
        relatedId: issue.complaintId,
        relatedType: 'issue',
      });
    } else if (status === 'Resolved' && oldStatus !== 'Resolved') {
      await createNotification({
        userId: issue.userId,
        type: 'complaint_resolved',
        category: 'complaint',
        priority: 'normal',
        title: 'Complaint Resolved',
        message: `Your complaint ${issue.complaintId} has been resolved. Status: Resolved`,
        relatedId: issue.complaintId,
        relatedType: 'issue',
      });
    }

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      data: {
        id: issue._id,
        complaintId: issue.complaintId,
        status: issue.status,
        updatedAt: issue.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error updating issue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update issue status',
      error: error.message,
    });
  }
};

/**
 * Add internal note to issue
 * POST /issues/:id/notes
 * Body: { note: 'string' }
 */
exports.addInternalNote = async (req, res) => {
  try {
    const adminId = req.adminId;
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note is required',
      });
    }

    // Find issue and verify it's assigned to this admin
    const issue = await Issue.findOne({
      _id: id,
      assignedAdminId: adminId,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or not assigned to you',
      });
    }

    // Add note
    issue.internalNotes.push({
      note: note.trim(),
      addedBy: adminId,
      addedAt: new Date(),
    });

    await issue.save();

    console.log(`📝 Note added to issue ${issue.complaintId} by admin ${adminId}`);

    res.json({
      success: true,
      message: 'Note added successfully',
      data: {
        id: issue._id,
        complaintId: issue.complaintId,
        notesCount: issue.internalNotes.length,
      },
    });
  } catch (error) {
    console.error('❌ Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message,
    });
  }
};

// Export middleware for use in routes
exports.verifyAdminToken = verifyAdminToken;

