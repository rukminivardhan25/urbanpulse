const mongoose = require('mongoose');

const helperSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    index: true,
  },
  requestIdString: {
    type: String,
    required: true,
    index: true,
  },
  helperUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  requesterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  helperName: {
    type: String,
    required: true,
    trim: true,
  },
  helperPhone: {
    type: String,
    required: false,
    default: '',
    trim: true,
  },
  helperMessage: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index to prevent duplicate help offers from same user for same request
helperSchema.index({ requestId: 1, helperUserId: 1 }, { unique: true });

module.exports = mongoose.model('Helper', helperSchema);

