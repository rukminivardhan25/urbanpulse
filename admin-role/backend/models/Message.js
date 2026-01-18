// Reuse the same Message model from user backend
// This ensures consistency across both backends
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    index: true,
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
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
    enum: ['user', 'admin'],
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  receiverType: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
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
  timestamps: true,
});

messageSchema.index({ complaintId: 1, createdAt: -1 });
messageSchema.index({ issueId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isSeen: 0, createdAt: -1 });
messageSchema.index({ issueId: 1 }, { sparse: true });

module.exports = mongoose.model('Message', messageSchema);

