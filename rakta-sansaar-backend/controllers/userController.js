const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup User
exports.signup = async (req, res) => {
  try {
    const { name, email, password, bloodType } = req.body;

    if (!name || !email || !password || !bloodType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      bloodType
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error signing up user', error: err.message });
  }
};

// Get User by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// Update User (supports image upload via multer middleware)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.body) {
      return res.status(400).json({ message: 'Missing form data in request body' });
    }

    const { name, phoneNo, bloodType, dob, isRegularDonor } = req.body;

    if (!name || !bloodType || !dob) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const updateFields = {
      name,
      phoneNo,
      bloodType,
      dob,
      isRegularDonor: isRegularDonor === 'true' || isRegularDonor === true,
    };

    if (req.file) {
      updateFields.profilePhoto = `uploads/${req.file.filename}`; // Make sure your schema uses `profilePhoto`
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};


// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Please provide a new password' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error changing password', error: err.message });
  }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) return res.status(404).json({ message: 'No users found' });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Get User Stats
exports.getStats = async (req, res) => {
  try {
    const users = await User.find();

    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.isVerified).length;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const usersLastMonth = users.filter(u => new Date(u.createdAt) >= lastMonth).length;

    const regularDonors = users.filter(u => u.isRegularDonor).length;

    const maleUsers = users.filter(u => u.gender === 'Male').length;
    const femaleUsers = users.filter(u => u.gender === 'Female').length;

    const bloodGroups = {};
    users.forEach(user => {
      const type = user.bloodType;
      if (type) bloodGroups[type] = (bloodGroups[type] || 0) + 1;
    });

    res.status(200).json({
      totalUsers,
      verifiedUsers,
      usersLastMonth,
      regularDonors,
      maleUsers,
      femaleUsers,
      bloodGroups,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get stats', error: err.message });
  }
};
