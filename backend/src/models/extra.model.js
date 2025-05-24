const mongoose = require('mongoose');

// This collection could store global extras or airline-specific extras
const extraSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  // airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', default: null }, // If extras are airline-specific
}, { timestamps: true });

module.exports = mongoose.model('Extra', extraSchema);