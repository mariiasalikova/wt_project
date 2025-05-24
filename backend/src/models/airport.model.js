const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, length: 3 },
}, { timestamps: true });

module.exports = mongoose.model('Airport', airportSchema);