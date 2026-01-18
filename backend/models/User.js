const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  state: {
    type: String,
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
    trim: true,
  },
  area: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  streetNumber: {
    type: String,
    trim: true,
  },
  houseNumber: {
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
  locationHistory: [{
    state: String,
    district: String,
    mandal: String,
    city: String,
    area: String,
    pincode: String,
    address: String,
    streetNumber: String,
    houseNumber: String,
    landmark: String,
    latitude: Number,
    longitude: Number,
    savedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
