const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true,
    },
    mandal: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    locationHistory: [
      {
        city: String,
        area: String,
        mandal: String,
        district: String,
        state: String,
        pincode: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
adminSchema.index({ phone: 1 }, { unique: true }); // Unique index on phone
adminSchema.index({ city: 1, area: 1 });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

