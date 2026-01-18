const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
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
    serviceType: {
      type: String,
      required: true,
      enum: ['garbage', 'water', 'power', 'health', 'road', 'other'],
      trim: true,
    },
    serviceSubtype: {
      type: String,
      trim: true,
      default: '',
    },
    startTime: {
      type: String, // Stored as "HH:MM" in 24hr format (e.g., "07:00")
      trim: true,
      default: null,
    },
    endTime: {
      type: String, // Stored as "HH:MM" in 24hr format (e.g., "09:00")
      trim: true,
      default: null,
    },
    displayFormat: {
      type: String,
      enum: ['12hr', '24hr'],
      default: '12hr',
    },
    scheduleType: {
      type: String,
      required: true,
      enum: ['daily', 'today', 'tomorrow', 'this_weekend', 'custom_date'],
      trim: true,
    },
    serviceDate: {
      type: Date, // Stored in UTC but represents IST date
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
serviceSchema.index({ adminCity: 1, adminArea: 1 });
serviceSchema.index({ serviceDate: 1 });
serviceSchema.index({ scheduleType: 1 });
serviceSchema.index({ adminId: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

