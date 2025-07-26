const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userService = require('../services/userService');
const calculateAge = require('../utils/calculateAge');
const log = require('../utils/logger');

// ==============================
// VALIDATION MIDDLEWARE
// ==============================
const validateLogin = [
  body('email').notEmpty().isEmail(),
  body('password').notEmpty(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('address').optional().isString(),
];

const validateSignup = [
  body('name').notEmpty().isLength({ min: 2, max: 50 }),
  body('email').notEmpty().isEmail().custom(async (email) => {
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) throw new Error('Email is already registered');
  }),
  body('password').notEmpty().isLength({ min: 6 }),
  body('dob').notEmpty().isISO8601(),
  body('bloodType').notEmpty().isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  body('longitude').notEmpty().isFloat({ min: -180, max: 180 }),
  body('latitude').notEmpty().isFloat({ min: -90, max: 90 }),
];

// ==============================
// SIGNUP CONTROLLER
// ==============================
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, phoneNo, bloodType, password, dob, longitude, latitude } = req.body;

    if (!name || !email || !password || !dob || longitude === undefined || latitude === undefined || !bloodType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate)) return res.status(400).json({ message: 'Invalid date of birth' });

    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (
      isNaN(long) || isNaN(lat) ||
      long < -180 || long > 180 ||
      lat < -90 || lat > 90
    ) {
      return res.status(400).json({ message: 'Invalid longitude or latitude' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNo }] });
    if (existingUser) return res.status(400).json({ message: 'Email or phone already exists' });

    const age = calculateAge(dobDate);
    if (age < 18) return res.status(400).json({ message: 'You must be at least 18 years old' });

    const newUser = new User({
      name,
      email,
      phoneNo,
      bloodType,
      password,
      dob: dobDate,
      location: {
        type: 'Point',
        coordinates: [long, lat],
      },
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully. You can now login.' });
  } catch (error) {
    console.error('Error during signup:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or phone already exists' });
    }
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// ==============================
// LOGIN CONTROLLER
// ==============================
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, latitude, longitude, address } = req.body;

  try {
    const user = await userService.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await userService.compareUserPassword(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({
      id: user._id,
      name: user.name,
      email: user.email,
      bloodType: user.bloodType,
      location: {
        latitude: latitude || user.location.coordinates[1],
        longitude: longitude || user.location.coordinates[0],
        address: address || null,
      }
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    if (latitude && longitude && address) {
      req.session.location = { latitude, longitude, address };
    }

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodType: user.bloodType,
      },
      location: req.session.location || {
        latitude: user.location.coordinates[1],
        longitude: user.location.coordinates[0],
      }
    });
  } catch (error) {
    log.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ==============================
// LOGOUT CONTROLLER
// ==============================
const logout = (req, res) => {
  try {
    res.clearCookie('authToken', { path: '/' });
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: 'Error while logging out' });
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error while logging out' });
  }
};

// ==============================
// EXPORT
// ==============================
module.exports = {
  validateSignup,
  validateLogin,
  signup,
  login,
  logout
};
