const mongoose = require('mongoose');

const extraItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  seatNumber: { type: String, required: true },
  class: { type: String, enum: ['economy', 'business', 'first'], required: true },
  extras: [extraItemSchema],
  basePrice: { type: Number, required: true, min: 0 }, // Price of the ticket for its class
  totalPrice: { type: Number, required: true, min: 0 }, // basePrice + sum of extras.price
  purchasedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['confirmed', 'cancelled', 'used'], default: 'confirmed' },
}, { timestamps: true });

ticketSchema.index({ userId: 1, flightId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);