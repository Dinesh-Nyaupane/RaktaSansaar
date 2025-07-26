const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const sendMail = require('../utils/sendMail');

// ✅ Signup Route with Validation & OTP
router.post(
  '/signup',
  authController.validateSignup,
  async (req, res) => {
    const { name, email, password, phone, bloodType } = req.body;

    try {
      // Check if user exists
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Create user with OTP
      const user = new User({
        name,
        email,
        password,
        phone,
        bloodType,
        otp,
        verified: false,
      });

      await user.save();

      // Send OTP email
      await sendMail(
        email,
        '🔐 Your Rakta Sansaar OTP',
        `Hi ${name}, your OTP is ${otp}`,
        `<p>Hi <strong>${name}</strong>,</p><p>Your OTP is: <strong>${otp}</strong></p>`
      );

      res.status(200).json({ message: 'Signup successful. OTP sent.', email });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
);

// ✅ Login Route with Validation & Email Verification Check
router.post(
  '/login',
  authController.validateLogin,
  authController.login
);

// ✅ Logout
router.post('/logout', authController.logout);

// ✅ Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    user.verified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
