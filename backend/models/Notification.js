const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        // Issue/Complaint notifications
        'complaint_submitted',
        'complaint_assigned',
        'complaint_in_progress',
        'complaint_resolved',
        'complaint_message',
        // Alert notifications
        'alert_emergency',
        'alert_urgent',
        'alert_normal',
        // Request notifications (future)
        'request_helper',
        'request_message',
        // Service notifications (future)
        'service_reminder',
        'service_update',
      ],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['complaint', 'alert', 'request', 'service', 'message', 'system'],
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Related data (for deep linking)
    relatedId: {
      type: String, // Complaint ID, Request ID, Alert ID, etc.
      index: true,
    },
    relatedType: {
      type: String,
      enum: ['issue', 'request', 'alert', 'message', 'service'],
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Additional metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 }); // User's unread notifications, newest first
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 }); // User's notifications by category
notificationSchema.index({ userId: 1, priority: 1, isRead: 1 }); // Unread notifications by priority

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

