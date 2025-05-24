const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['passenger', 'admin', 'airline_admin'], default: 'passenger', required: true },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) { // Only hash if password is new or changed
    return next();
  }
  // If passwordHash is being set directly (e.g. during registration with a plain password)
  // Assume it's the plain password and hash it.
  // If you pass an already hashed password to passwordHash, this logic needs adjustment.
  // For simplicity, assuming 'passwordHash' field might initially receive a plain password.
  // Better practice: have a 'password' virtual field and always hash that to 'passwordHash'.
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);