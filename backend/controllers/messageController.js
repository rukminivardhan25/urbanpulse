const Message = require('../models/Message');
const Issue = require('../models/Issue');
const Request = require('../models/Request');
const Helper = require('../models/Helper');
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
 * Send a message for a complaint
 * POST /messages
 * Body: { complaintId, message }
 */
exports.sendMessage = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { complaintId, message } = req.body;

    // Validation
    if (!complaintId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and message are required',
      });
    }

    // Find the issue
    const issue = await Issue.findOne({ complaintId });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check permissions: user can only send messages on their own issues
    if (issue.userId.toString() !== userData.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only send messages on your own complaints',
      });
    }

    // Check if issue is assigned
    if (!issue.assignedAdminId) {
      return res.status(400).json({
        success: false,
        message: 'No admin assigned to this complaint yet',
      });
    }

    // Check status allows messaging (Assigned, In Progress, Resolved)
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
      senderId: userData.userId,
      senderType: 'user',
      receiverId: issue.assignedAdminId,
      receiverType: 'admin',
      message: message.trim(),
      isSeen: false,
    });

    await newMessage.save();

    console.log(`💬 Message sent by user ${userData.userId} for complaint ${complaintId}`);

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
 * Get all messages for a complaint
 * GET /messages/:complaintId
 */
exports.getMessages = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { complaintId } = req.params;

    // Find the issue
    const issue = await Issue.findOne({ complaintId });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check permissions: user can only view messages on their own issues
    if (issue.userId.toString() !== userData.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view messages on your own complaints',
      });
    }

    // Get all messages for this complaint, ordered by newest first
    const messages = await Message.find({ complaintId })
      .sort({ createdAt: 1 }) // Oldest first for display
      .lean();

    // Mark all messages from admin as seen (since user is viewing)
    const unreadAdminMessages = messages.filter(
      m => m.senderType === 'admin' && !m.isSeen
    );

    if (unreadAdminMessages.length > 0) {
      await Message.updateMany(
        {
          complaintId,
          senderType: 'admin',
          isSeen: false,
        },
        {
          isSeen: true,
          seenAt: new Date(),
        }
      );

      // Update isSeen in response
      messages.forEach(msg => {
        if (msg.senderType === 'admin') {
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
 * Get unread message count for all user's complaints
 * GET /messages/unread/count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    // Get all issues for this user
    const userIssues = await Issue.find({ userId: userData.userId }).select('complaintId _id assignedAdminId status');

    if (userIssues.length === 0) {
      return res.json({
        success: true,
        data: {},
      });
    }

    // Get unread message counts per complaint
    // Only count messages sent by admin that are not seen
    const complaintIds = userIssues.map(issue => issue.complaintId);
    
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          complaintId: { $in: complaintIds },
          senderType: 'admin',
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

/**
 * Send a helper-requester message
 * POST /messages/helper
 * Body: { requestId, helperId, message }
 */
exports.sendHelperMessage = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { requestId, helperId, message } = req.body;

    // Validation
    if (!requestId || !helperId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Request ID, Helper ID, and message are required',
      });
    }

    // Find the request and helper
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({
        success: false,
        message: 'Helper record not found',
      });
    }

    // Verify helper belongs to this request
    if (helper.requestId.toString() !== requestId) {
      return res.status(400).json({
        success: false,
        message: 'Helper does not belong to this request',
      });
    }

    // Determine sender and receiver
    let senderId, senderType, receiverId, receiverType;
    
    if (userData.userId.toString() === request.userId.toString()) {
      // Current user is the requester
      senderId = request.userId;
      senderType = 'requester';
      receiverId = helper.helperUserId;
      receiverType = 'helper';
    } else if (userData.userId.toString() === helper.helperUserId.toString()) {
      // Current user is the helper
      senderId = helper.helperUserId;
      senderType = 'helper';
      receiverId = request.userId;
      receiverType = 'requester';
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages for this request',
      });
    }

    // Create message
    const newMessage = new Message({
      requestId: request._id,
      helperId: helper._id,
      senderId,
      senderType,
      receiverId,
      receiverType,
      message: message.trim(),
      isSeen: false,
    });

    await newMessage.save();

    console.log(`💬 Helper-requester message sent: ${senderType} ${senderId} for request ${requestId}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: newMessage._id,
        requestId: request.requestId,
        message: newMessage.message,
        senderType: newMessage.senderType,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error sending helper message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * Get all messages for a helper-requester chat
 * GET /messages/helper/:requestId/:helperId
 */
exports.getHelperMessages = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { requestId, helperId } = req.params;

    // Find the request and helper
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const helper = await Helper.findById(helperId);
    if (!helper) {
      return res.status(404).json({
        success: false,
        message: 'Helper record not found',
      });
    }

    // Verify user is either requester or helper
    const isRequester = userData.userId.toString() === request.userId.toString();
    const isHelper = userData.userId.toString() === helper.helperUserId.toString();

    if (!isRequester && !isHelper) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages for this request',
      });
    }

    // Get all messages for this helper-requester chat
    const messages = await Message.find({
      requestId: request._id,
      helperId: helper._id,
    })
      .sort({ createdAt: 1 }) // Oldest first for display
      .lean();

    // Mark all messages from the other party as seen
    const otherPartyType = isRequester ? 'helper' : 'requester';
    const unreadMessages = messages.filter(
      m => m.senderType === otherPartyType && !m.isSeen
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          requestId: request._id,
          helperId: helper._id,
          senderType: otherPartyType,
          isSeen: false,
        },
        {
          isSeen: true,
          seenAt: new Date(),
        }
      );

      // Update isSeen in response
      messages.forEach(msg => {
        if (msg.senderType === otherPartyType) {
          msg.isSeen = true;
        }
      });
    }

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('❌ Error fetching helper messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

