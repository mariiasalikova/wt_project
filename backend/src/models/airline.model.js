const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const airlineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  taxCode: { type: String },
  hqAddress: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming an admin user creates it
  isTemporaryPassword: { type: Boolean, default: false }, // For first-time login
}, { timestamps: true });

airlineSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Pre-save hook to hash password if modified
airlineSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Airline', airlineSchema);