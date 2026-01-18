const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestId: {
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
  requestType: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  customSubcategory: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: String,
    default: '',
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['Pending Approval', 'Approved', 'Rejected'],
    default: 'Approved', // Requests are immediately visible, no admin approval needed
    index: true,
  },
  // Location details - stored with request only, not linked to user profile
  location: {
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    mandal: { type: String, default: '' },
    city: { type: String, required: true },
    area: { type: String, required: true },
    pincode: { type: String, default: '' },
    landmark: { type: String, default: '' },
    detailedAddress: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  // Contact methods and details
  contactPreference: [{
    type: String,
    enum: ['mobile', 'whatsapp', 'mail', 'other'],
  }],
  contactDetails: {
    mobile: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    mail: { type: String, default: '' },
    other: { type: String, default: '' },
  },
  // Proof files (for future implementation)
  proofFiles: [{
    url: String,
    fileName: String,
    fileType: String,
  }],
  // Admin actions
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for status queries
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);

