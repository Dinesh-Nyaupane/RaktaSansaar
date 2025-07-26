const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // For password hashing
const moment = require('moment'); // For date calculations

const userSchema = new mongoose.Schema({
  // ==== Required Fields (Signup) ====
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email'] 
  },
  phoneNo: { 
    type: String, 
    required: [false, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'] 
  },
  bloodType: { 
    type: String, 
    required: [true, 'Blood type is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  isRegularDonor: { 
    type: Boolean, 
    default: false 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'] 
  },
  dob: { 
    type: Date, 
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(dob) {
        return moment().diff(moment(dob), 'years') >= 18; // Must be 18+ years old
      },
      message: 'You must be at least 18 years old'
    }
  },
  location: {
    type: { 
      type: String, 
      default: 'Point' // Geospatial type
    },
    coordinates: { 
      type: [Number], 
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates. Use [longitude, latitude]'
      }
    }
  },

  // ==== Optional Fields (Can Update Later) ====
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'] 
  },
  lastDonationDate: { 
    type: Date 
  },
  profilePhoto: { 
    type: String // URL to profile photo
  },
  healthConditions: {
    type: [String],
    default: []
  },
  otp: {
  type: String,
  default: null,
},
verified: {
  type: Boolean,
  default: false,
},

}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// ==== Schema Methods & Middleware ====
// 1. Geospatial Index for Location
userSchema.index({ location: '2dsphere' });

// 2. Auto-calculate Age (virtual field - not stored in DB)
userSchema.virtual('age').get(function() {
  return moment().diff(moment(this.dob), 'years');
});

// 3. Hash Password Before Saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Skip if password not modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);  // Log the error
    next(err); // Pass the error to the next middleware/handler
  }
});

// 4. Method to Compare Passwords (for login)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
