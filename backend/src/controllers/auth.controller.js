const User = require('../models/user.model');
const Airline = require('../models/airline.model');
const { generateToken } = require('../services/token.service');
const bcrypt = require('bcryptjs');

const COOKIE_OPTIONS = {
  httpOnly: true, // Client-side JavaScript cannot access the cookie
  secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
  sameSite: 'Lax', // Or 'Strict'. 'Lax' is a good default for most cases.
  maxAge: parseInt(process.env.JWT_EXPIRES_IN || 24 * 60 * 60 * 1000, 10) // e.g., 1 day
  // path: '/api', // Optional: scope cookie to /api paths if desired
};

// Passenger Sign-Up
exports.passengerRegister = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({ name, email, passwordHash: password, phone, role: 'passenger' });
    await user.save();

    const payload = { userId: user._id, role: user.role, email: user.email };
    const token = generateToken(payload);

    res.cookie('authToken', token, COOKIE_OPTIONS);

    res.status(201).json({
      // token: token, // NO LONGER SEND TOKEN IN BODY
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Passenger Login
exports.passengerLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, deleted: false });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user._id, role: user.role, email: user.email };
    const token = generateToken(payload);

    res.cookie('authToken', token, COOKIE_OPTIONS);

    res.json({
      // token: token, // NO LONGER SEND TOKEN IN BODY
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Airline Login
exports.airlineLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const airline = await Airline.findOne({ email });
    if (!airline || !(await airline.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { airlineId: airline._id, role: 'airline', email: airline.email };
    const token = generateToken(payload);

    res.cookie('authToken', token, COOKIE_OPTIONS);

    res.json({
      airline: {
        id: airline._id, name: airline.name, email: airline.email, role: 'airline',
        taxCode: airline.taxCode, hqAddress: airline.hqAddress,
        isTemporaryPassword: airline.isTemporaryPassword
      },
      requiresPasswordChange: airline.isTemporaryPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during airline login' });
  }
};

// This endpoint should typically result in the airline being logged out,
// forcing them to log in with their new password.
exports.airlineSetInitialDetails = async (req, res) => {
  const airlineId = req.user.id;
  const { newPassword, taxCode, hqAddress } = req.body;

  if (!newPassword || !taxCode || !hqAddress) {
    return res.status(400).json({ message: 'New password, tax code, and address are required.' });
  }

  try {
    const airline = await Airline.findById(airlineId);
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    airline.passwordHash = await bcrypt.hash(newPassword, salt);
    airline.taxCode = taxCode;
    airline.hqAddress = hqAddress;
    airline.isTemporaryPassword = false;

    await airline.save();

    // Clear the cookie as they need to re-login
    res.cookie('authToken', '', { ...COOKIE_OPTIONS, maxAge: 0, expires: new Date(0) });

    res.json({ message: 'Airline details updated successfully. Please log in again with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating airline details' });
  }
};

// Add Logout and Status Endpoints
exports.logout = (req, res) => {
  res.cookie('authToken', '', { ...COOKIE_OPTIONS, maxAge: 0, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.getAuthStatus = async (req, res) => {
  // The 'protect' middleware will run before this.
  // If it passes, req.user will be populated.
  if (req.user) {
    // Sanitize user object before sending (remove passwordHash if it somehow got there)
    const { passwordHash, ...userData } = req.user.toObject ? req.user.toObject() : req.user;
    return res.status(200).json(userData);
  }
  // This case should ideally not be hit if protect middleware correctly denies access
  return res.status(401).json(null); // Or { message: 'Not authenticated' }
};