const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true }, // e.g., "12A", "03F"
  class: { type: String, enum: ['economy', 'business', 'first'], required: true },
  isTaken: { type: Boolean, default: false },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
}, { _id: false }); // _id: false for subdocuments if not needed

const flightSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  aircraftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Aircraft', required: true },
  airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true }, // Denormalized for easier queries
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  prices: {
    economy: { type: Number, required: true, min: 0 },
    business: { type: Number, required: true, min: 0 },
    first: { type: Number, required: true, min: 0 },
  },
  seats: [seatSchema], // This will be populated based on aircraft.seatConfig
  status: { type: String, enum: ['scheduled', 'departed', 'arrived', 'cancelled', 'delayed'], default: 'scheduled' },
}, { timestamps: true });

flightSchema.index({ departure: 1, 'route.from.code': 1, 'route.to.code': 1 }); // Example index

module.exports = mongoose.models.Flight || mongoose.model('Flight', flightSchema);