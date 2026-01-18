const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  issueType: {
    type: String,
    required: true,
    enum: ['garbage', 'water', 'power', 'road', 'drainage', 'streetlight', 'other'],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Pending',
    index: true,
  },
  // Issue-specific location (independent of user profile)
  location: {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    mandal: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    fullAddress: {
      type: String,
      trim: true,
    },
    houseNumber: {
      type: String,
      trim: true,
    },
    streetNumber: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  // Admin assignment
  assignedAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
    index: true,
  },
  // Media attachments (for future implementation)
  media: {
    photos: [{
      type: String, // URLs or file paths
    }],
    videos: [{
      type: String, // URLs or file paths
    }],
  },
  // Internal notes (for admin use)
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Status change history
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  }],
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for efficient queries
issueSchema.index({ userId: 1, createdAt: -1 }); // User's issues, newest first
issueSchema.index({ assignedAdminId: 1, status: 1, createdAt: -1 }); // Admin's issues, filtered by status, newest first
issueSchema.index({ 'location.city': 1, 'location.area': 1 }); // Location-based queries

module.exports = mongoose.model('Issue', issueSchema);

