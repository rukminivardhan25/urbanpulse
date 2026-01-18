const Message = require('../models/Message');
const Issue = require('../models/Issue');
const User = require('../models/User');

// Reuse verifyAdminToken from adminIssueController pattern
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
 * Send a message for a complaint (Admin side)
 * POST /messages
 * Body: { complaintId, message }
 */
exports.sendMessage = async (req, res) => {
  try {
    const adminId = req.adminId;
    const adminState = req.adminState || req.admin?.state;
    const adminDistrict = req.adminDistrict || req.admin?.district;
    const adminMandal = req.adminMandal || req.admin?.mandal;
    const adminCity = req.adminCity || req.admin?.city;
    const adminArea = req.adminArea || req.admin?.area;

    const { complaintId, message } = req.body;

    // Validation
    if (!complaintId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and message are required',
      });
    }

    // Find the issue
    let issue = await Issue.findOne({ complaintId });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check permissions and auto-assign if needed
    const isAssigned = issue.assignedAdminId && issue.assignedAdminId.toString() === adminId.toString();
    
    if (!isAssigned) {
      // Check if issue is unassigned and matches admin's location
      if (issue.assignedAdminId !== null) {
        return res.status(403).json({
          success: false,
          message: 'You can only send messages on complaints assigned to you or in your region',
        });
      }

      // Check location match
      const locationMatch = {};
      if (adminState && adminState.trim() && issue.location.state) {
        locationMatch.state = { $regex: new RegExp(`^${adminState.trim()}$`, 'i') };
      }
      if (adminDistrict && adminDistrict.trim() && issue.location.district) {
        locationMatch.district = { $regex: new RegExp(`^${adminDistrict.trim()}$`, 'i') };
      }
      if (adminMandal && adminMandal.trim() && issue.location.mandal) {
        locationMatch.mandal = { $regex: new RegExp(`^${adminMandal.trim()}$`, 'i') };
      }
      if (adminCity && adminCity.trim() && issue.location.city) {
        locationMatch.city = { $regex: new RegExp(`^${adminCity.trim()}$`, 'i') };
      }
      if (adminArea && adminArea.trim() && issue.location.area) {
        locationMatch.area = { $regex: new RegExp(`^${adminArea.trim()}$`, 'i') };
      }

      // Check if location matches
      let matches = true;
      if (adminState && issue.location.state) {
        matches = matches && new RegExp(`^${adminState.trim()}$`, 'i').test(issue.location.state);
      }
      if (adminDistrict && issue.location.district) {
        matches = matches && new RegExp(`^${adminDistrict.trim()}$`, 'i').test(issue.location.district);
      }
      if (adminMandal && issue.location.mandal) {
        matches = matches && new RegExp(`^${adminMandal.trim()}$`, 'i').test(issue.location.mandal);
      }
      if (adminCity && issue.location.city) {
        matches = matches && new RegExp(`^${adminCity.trim()}$`, 'i').test(issue.location.city);
      }
      if (adminArea && issue.location.area) {
        matches = matches && new RegExp(`^${adminArea.trim()}$`, 'i').test(issue.location.area);
      }

      if (!matches) {
        return res.status(403).json({
          success: false,
          message: 'You can only send messages on complaints assigned to you or in your region',
        });
      }

      // Auto-assign the issue to this admin
      issue.assignedAdminId = adminId;
      if (issue.status === 'Pending') {
        issue.status = 'Assigned';
        issue.statusHistory.push({
          status: 'Assigned',
          changedAt: new Date(),
          changedBy: adminId,
        });
      }
      await issue.save();
      console.log(`✅ Issue ${complaintId} auto-assigned to admin ${adminId} via chat`);
    }

    // Check status allows messaging
    const allowedStatuses = ['Assigned', 'In Progress', 'Resolved'];
    if (!allowedStatuses.includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: 'Messaging is only available for assigned, in progress, or resolved complaints',
      });
    }

    // Create message
    const newMessage = new Message({
      complaintId,
      issueId: issue._id,
      senderId: adminId,
      senderType: 'admin',
      receiverId: issue.userId,
      receiverType: 'user',
      message: message.trim(),
      isSeen: false,
    });

    await newMessage.save();

    console.log(`💬 Message sent by admin ${adminId} for complaint ${complaintId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: newMessage._id,
        complaintId: newMessage.complaintId,
        message: newMessage.message,
        senderType: newMessage.senderType,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * Get all messages for a complaint (Admin side)
 * GET /messages/:complaintId
 */
exports.getMessages = async (req, res) => {
  try {
    const adminId = req.adminId;
    const { complaintId } = req.params;

    // Find the issue
    const issue = await Issue.findOne({ complaintId });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check permissions and auto-assign if needed
    const isAssigned = issue.assignedAdminId && issue.assignedAdminId.toString() === adminId.toString();
    
    if (!isAssigned) {
      if (issue.assignedAdminId !== null) {
        return res.status(403).json({
          success: false,
          message: 'You can only view messages on complaints assigned to you or in your region',
        });
      }

      // Issue is unassigned - check location match
      let matches = true;
      if (adminState && issue.location.state) {
        matches = matches && new RegExp(`^${adminState.trim()}$`, 'i').test(issue.location.state);
      }
      if (adminDistrict && issue.location.district) {
        matches = matches && new RegExp(`^${adminDistrict.trim()}$`, 'i').test(issue.location.district);
      }
      if (adminMandal && issue.location.mandal) {
        matches = matches && new RegExp(`^${adminMandal.trim()}$`, 'i').test(issue.location.mandal);
      }
      if (adminCity && issue.location.city) {
        matches = matches && new RegExp(`^${adminCity.trim()}$`, 'i').test(issue.location.city);
      }
      if (adminArea && issue.location.area) {
        matches = matches && new RegExp(`^${adminArea.trim()}$`, 'i').test(issue.location.area);
      }

      if (!matches) {
        return res.status(403).json({
          success: false,
          message: 'You can only view messages on complaints assigned to you or in your region',
        });
      }

      // Auto-assign the issue to this admin
      issue.assignedAdminId = adminId;
      if (issue.status === 'Pending') {
        issue.status = 'Assigned';
        issue.statusHistory.push({
          status: 'Assigned',
          changedAt: new Date(),
          changedBy: adminId,
        });
      }
      await issue.save();
      console.log(`✅ Issue ${complaintId} auto-assigned to admin ${adminId} via chat view`);
    }

    // Get all messages for this complaint
    const messages = await Message.find({ complaintId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark all messages from user as seen (since admin is viewing)
    const unreadUserMessages = messages.filter(
      m => m.senderType === 'user' && !m.isSeen
    );

    if (unreadUserMessages.length > 0) {
      await Message.updateMany(
        {
          complaintId,
          senderType: 'user',
          isSeen: false,
        },
        {
          isSeen: true,
          seenAt: new Date(),
        }
      );

      // Update isSeen in response
      messages.forEach(msg => {
        if (msg.senderType === 'user') {
          msg.isSeen = true;
        }
      });
    }

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

/**
 * Get unread message count for all admin's complaints
 * GET /messages/unread/count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const adminId = req.adminId;
    const adminState = req.adminState || req.admin?.state;
    const adminDistrict = req.adminDistrict || req.admin?.district;
    const adminMandal = req.adminMandal || req.admin?.mandal;
    const adminCity = req.adminCity || req.admin?.city;
    const adminArea = req.adminArea || req.admin?.area;

    // Get all issues for this admin (assigned + unassigned in their region)
    const baseConditions = [{ assignedAdminId: adminId }];

    // If we have location fields, add unassigned matching issues
    if (adminState || adminCity || adminArea) {
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

      if (Object.keys(locationMatch).length > 0) {
        baseConditions.push({
          assignedAdminId: null,
          ...locationMatch,
        });
      }
    }

    const query = { $or: baseConditions };
    const adminIssues = await Issue.find(query).select('complaintId _id');

    if (adminIssues.length === 0) {
      return res.json({
        success: true,
        data: {},
      });
    }

    // Get unread message counts per complaint
    // Only count messages sent by user that are not seen
    const complaintIds = adminIssues.map(issue => issue.complaintId);
    
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          complaintId: { $in: complaintIds },
          senderType: 'user',
          isSeen: false,
        },
      },
      {
        $group: {
          _id: '$complaintId',
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to object keyed by complaintId
    const countsByComplaint = {};
    unreadCounts.forEach(item => {
      countsByComplaint[item._id] = item.count;
    });

    res.json({
      success: true,
      data: countsByComplaint,
    });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

// Export verifyAdminToken for use in routes
exports.verifyAdminToken = verifyAdminToken;

