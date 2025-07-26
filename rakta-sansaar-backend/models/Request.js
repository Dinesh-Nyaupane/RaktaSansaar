const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // Requester's details
  requesterName: {
    type: String,
    required: true
  },
  bloodTypeNeeded: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: [1, 'At least 1 unit is required']
  },
  contactInfo: {
    phoneNo: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    email: {
      type: String,
      required: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email']
    }
  },
  location: {
    type: { 
      type: String, 
      default: 'Point' 
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Fulfilled', 'Cancelled'],
    default: 'Open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Expiry logic - Close request after 2 days
requestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 }); // 2 days = 48 hours

module.exports = mongoose.model('Request', requestSchema);
