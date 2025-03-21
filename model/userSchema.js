const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  google_id: { type: String, required: false, sparse: true, default: null },
  firstName: { type: String, required: true },
  secondName: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: Number, unique: true, sparse: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false }, // Verification status
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date },
  usedCoupons: { type: Array },
});
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
const user = mongoose.model('userSchema', userSchema);

module.exports = user;
