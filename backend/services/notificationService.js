const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {String} options.userId - User ID to notify
 * @param {String} options.type - Notification type (enum)
 * @param {String} options.category - Notification category
 * @param {String} options.priority - Priority: normal, urgent, emergency
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.relatedId - Related ID (complaint ID, request ID, etc.)
 * @param {String} options.relatedType - Related type (issue, request, alert, etc.)
 * @param {Object} options.metadata - Additional metadata
 */
const createNotification = async ({
  userId,
  type,
  category,
  priority = 'normal',
  title,
  message,
  relatedId = null,
  relatedType = null,
  metadata = {},
}) => {
  try {
    if (!userId || !type || !category || !title || !message) {
      console.error('❌ Missing required fields for notification');
      return null;
    }

    const notification = new Notification({
      userId,
      type,
      category,
      priority,
      title,
      message,
      relatedId,
      relatedType,
      metadata,
      isRead: false,
    });

    await notification.save();
    console.log(`🔔 Notification created: ${type} for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

/**
 * Create notifications for multiple users (for alerts)
 * @param {Array} userIds - Array of user IDs
 * @param {Object} options - Notification options (same as createNotification)
 */
const createNotificationsForUsers = async (userIds, options) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      console.error('❌ Invalid userIds array');
      return [];
    }

    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotification({
        ...options,
        userId,
      });
      if (notification) {
        notifications.push(notification);
      }
    }

    console.log(`🔔 Created ${notifications.length} notifications for ${userIds.length} users`);
    return notifications;
  } catch (error) {
    console.error('❌ Error creating notifications for users:', error);
    return [];
  }
};

/**
 * Get users in a specific city and area (for alert notifications)
 * @param {String} city - City name
 * @param {String} area - Area name
 */
const getUsersByLocation = async (city, area) => {
  try {
    const users = await User.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      area: { $regex: new RegExp(`^${area}$`, 'i') },
    }).select('_id');

    return users.map((user) => user._id.toString());
  } catch (error) {
    console.error('❌ Error getting users by location:', error);
    return [];
  }
};

module.exports = {
  createNotification,
  createNotificationsForUsers,
  getUsersByLocation,
};

