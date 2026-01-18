const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // For complaint/issue messages
  complaintId: {
    type: String,
    required: false,
    index: true, // For efficient queries by complaint
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: false,
    index: true,
  },
  // For helper-requester messages
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: false,
    index: true,
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Helper',
    required: false,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  senderType: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'helper', 'requester'],
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  receiverType: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'helper', 'requester'],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  isSeen: {
    type: Boolean,
    default: false,
    index: true,
  },
  seenAt: {
    type: Date,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Compound indexes for efficient queries
messageSchema.index({ complaintId: 1, createdAt: -1 }); // Messages for a complaint, newest first
messageSchema.index({ issueId: 1, createdAt: -1 }); // Messages for an issue, newest first
messageSchema.index({ requestId: 1, helperId: 1, createdAt: -1 }); // Messages for a helper-requester chat, newest first
messageSchema.index({ receiverId: 1, isSeen: 0, createdAt: -1 }); // Unread messages for a receiver

// When complaint/issue is deleted, cascade delete messages
messageSchema.index({ issueId: 1 }, { sparse: true });

module.exports = mongoose.model('Message', messageSchema);

