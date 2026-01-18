const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    adminCity: {
      type: String,
      required: true,
      trim: true,
    },
    adminArea: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'weather',
        'fire_disaster',
        'emergency_safety',
        'traffic_transport',
        'natural_disaster',
        'public_safety_law',
        'health_disease',
        'utility_emergency',
        'community_authority',
      ],
      trim: true,
    },
    alertType: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal',
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
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null, // Null means alert doesn't expire
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
alertSchema.index({ adminCity: 1, adminArea: 1 });
alertSchema.index({ category: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ isActive: 1 });
alertSchema.index({ createdAt: -1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;


