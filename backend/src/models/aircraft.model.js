const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({
  airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  code: { type: String, required: true, trim: true }, // e.g., "A320", "B737-800"
  seatConfig: {
    economy: { type: Number, required: true, min: 0 },
    business: { type: Number, required: true, min: 0 },
    first: { type: Number, required: true, min: 0 },
  },
}, { timestamps: true });

// Ensure an aircraft code is unique per airline
aircraftSchema.index({ airlineId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Aircraft', aircraftSchema);