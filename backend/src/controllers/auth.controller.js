const User = require('../models/user.model');
const Airline = require('../models/airline.model');
const { generateToken } = require('../services/token.service');
const bcrypt = require('bcryptjs'); // For hashing new passwords directly in controller if needed

// Passenger Sign-Up
exports.passengerRegister = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Note: Password hashing is handled by the pre-save hook in user.model.js
    // So, we pass the plain password to the model's passwordHash field.
    user = new User({ name, email, passwordHash: password, phone, role: 'passenger' });
    await user.save();

    // Optionally, log in the user immediately
    const payload = { userId: user._id, role: user.role, email: user.email };
    const token = generateToken(payload);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { userId: user._id, role: user.role, email: user.email };
    const token = generateToken(payload);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
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
    if (!airline) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await airline.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { airlineId: airline._id, role: 'airline', email: airline.email }; // Assuming 'airline' role
    const token = generateToken(payload);
    res.json({
      token,
      airline: { id: airline._id, name: airline.name, email: airline.email, role: 'airline' },
      requiresPasswordChange: airline.isTemporaryPassword, // For first-time access
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during airline login' });
  }
};

// Airline First-Time Access: Set New Password and Details
exports.airlineSetInitialDetails = async (req, res) => {
  // req.user should be populated by auth middleware if this route is protected
  const airlineId = req.user.airlineId; // Assuming JWT payload has airlineId
  const { newPassword, taxCode, address } = req.body;

  if (!newPassword || !taxCode || !address) {
    return res.status(400).json({ message: 'New password, tax code, and address are required.' });
  }

  try {
    const airline = await Airline.findById(airlineId);
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found.' });
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    airline.passwordHash = await bcrypt.hash(newPassword, salt);
    airline.taxCode = taxCode;
    airline.hqAddress = hqAddress;
    airline.isTemporaryPassword = false; // Mark as no longer temporary

    await airline.save();
    res.json({ message: 'Airline details updated successfully. Please log in again with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating airline details' });
  }
};