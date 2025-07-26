const bcrypt = require('bcrypt');
const User = require('../models/User');
const log = require('../utils/logger');
const calculateAge = require('../utils/calculateAge');

// Function to hash the user's password
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    log(`Error hashing password: ${error.message}`, 'error');
    throw new Error('Error hashing password');
  }
};

// Function to create a new user
const createUser = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      log(`Email already registered: ${userData.email}`, 'warn');
      throw new Error('Email already registered');
    }

    const newUser = new User(userData); // password should already be hashed
    await newUser.save();
    log(`New user created with email: ${userData.email}`, 'info');
    return newUser;
  } catch (error) {
    log(`Error creating user with email ${userData.email}: ${error.message}`, 'error');
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

// Function to compare user password with the stored hashed password
const compareUserPassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isMatch) {
      log('Invalid password', 'warn');
      return false;
    }
    return true;
  } catch (error) {
    log(`Error comparing password: ${error.message}`, 'error');
    throw new Error('Password comparison failed');
  }
};

// Function to find a user by email
const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      log(`User not found with email: ${email}`, 'warn');
      return null;
    }
    return user;
  } catch (error) {
    log(`Error finding user by email ${email}: ${error.message}`, 'error');
    throw new Error('Database error while finding user');
  }
};

// Function to check if a user exists by email
const isUserExists = async (email) => {
  try {
    const user = await findUserByEmail(email);
    return user !== null;
  } catch (error) {
    log(`Error checking user existence for email ${email}: ${error.message}`, 'error');
    return false;
  }
};

module.exports = {
  createUser,
  compareUserPassword,
  findUserByEmail,
  hashPassword,
  isUserExists
};
