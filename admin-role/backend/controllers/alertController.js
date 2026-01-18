const Alert = require('../../backend/models/Alert');
const Admin = require('../models/Admin');
const { createNotificationsForUsers, getUsersByLocation } = require('../../../backend/services/notificationService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'your-admin-secret-key-change-in-production';

// Get admin from token
const getAdminFromToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

// Create a new alert
exports.createAlert = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { category, alertType, priority, title, message, expiresAt } = req.body;

    // Validation
    if (!category || !alertType || !priority || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: category, alertType, priority, title, message',
      });
    }

    // Get admin details
    const admin = await Admin.findById(adminData.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Create alert
    const alert = new Alert({
      adminId: adminData.id,
      adminCity: adminData.city || admin.city || admin.currentLocation?.city || '',
      adminArea: adminData.area || admin.area || admin.currentLocation?.area || '',
      category,
      alertType,
      priority,
      title,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
    });

    await alert.save();

    // Create notifications for all users in the alert's city and area
    try {
      const userIds = await getUsersByLocation(alert.adminCity, alert.adminArea);
      if (userIds.length > 0) {
        // Determine notification type and category based on priority
        let notificationType = 'alert_normal';
        if (priority === 'emergency') {
          notificationType = 'alert_emergency';
        } else if (priority === 'urgent') {
          notificationType = 'alert_urgent';
        }

        await createNotificationsForUsers(userIds, {
          type: notificationType,
          category: 'alert',
          priority: priority,
          title: alert.title,
          message: alert.message,
          relatedId: alert._id.toString(),
          relatedType: 'alert',
          metadata: {
            category: alert.category,
            alertType: alert.alertType,
          },
        });
        console.log(`🔔 Created ${userIds.length} alert notifications for users in ${alert.adminCity}, ${alert.adminArea}`);
      }
    } catch (notifError) {
      console.error('❌ Error creating alert notifications:', notifError);
      // Don't fail the alert creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      alert: {
        id: alert._id,
        category: alert.category,
        alertType: alert.alertType,
        priority: alert.priority,
        title: alert.title,
        message: alert.message,
        createdAt: alert.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create alert',
    });
  }
};

// Get all alerts for admin
exports.getAdminAlerts = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const alerts = await Alert.find({ adminId: adminData.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      alerts: alerts.map((alert) => ({
        id: alert._id,
        category: alert.category,
        alertType: alert.alertType,
        priority: alert.priority,
        title: alert.title,
        message: alert.message,
        isActive: alert.isActive,
        expiresAt: alert.expiresAt,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error getting admin alerts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get alerts',
    });
  }
};

// Delete an alert
exports.deleteAlert = async (req, res) => {
  try {
    const adminData = getAdminFromToken(req);
    if (!adminData || !adminData.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login again.',
      });
    }

    const { id } = req.params;

    const alert = await Alert.findOne({ _id: id, adminId: adminData.id });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    await Alert.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete alert',
    });
  }
};

