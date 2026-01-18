const Notification = require('../models/Notification');
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
 * Get all notifications for the current user
 * GET /notifications
 * Query params: category, isRead, limit, offset
 */
exports.getNotifications = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { category, isRead, limit = 50, offset = 0 } = req.query;

    // Build query
    const query = { userId: userData.userId };

    if (category) {
      query.category = category;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-__v');

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: userData.userId,
      isRead: false,
    });

    res.json({
      success: true,
      data: notifications.map((notif) => ({
        id: notif._id,
        type: notif.type,
        category: notif.category,
        priority: notif.priority,
        title: notif.title,
        message: notif.message,
        relatedId: notif.relatedId,
        relatedType: notif.relatedType,
        isRead: notif.isRead,
        readAt: notif.readAt,
        createdAt: notif.createdAt,
        metadata: notif.metadata || {},
      })),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + notifications.length < totalCount,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * GET /notifications/unread-count
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

    const unreadCount = await Notification.countDocuments({
      userId: userData.userId,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 * PATCH /notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      userId: userData.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        id: notification._id,
        isRead: notification.isRead,
        readAt: notification.readAt,
      },
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * PATCH /notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const result = await Notification.updateMany(
      {
        userId: userData.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 * DELETE /notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userData = getUserFromToken(req);
    if (!userData || !userData.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: userData.userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

