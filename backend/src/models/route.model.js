const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  from: {
    airportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    code: { type: String, required: true, uppercase: true, trim: true, length: 3 }, // Denormalized for easier access
  },
  to: {
    airportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    code: { type: String, required: true, uppercase: true, trim: true, length: 3 }, // Denormalized for easier access
  },
}, { timestamps: true });

// Ensure a route for a given airline between two airports is unique
routeSchema.index({ airlineId: 1, 'from.airportId': 1, 'to.airportId': 1 }, { unique: true });


module.exports = mongoose.models.Route || mongoose.model('Route', routeSchema);