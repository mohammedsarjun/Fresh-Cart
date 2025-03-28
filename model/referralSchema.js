const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  code: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  refereeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if not always required
  used: { type: Boolean, default: false }, // Track if used
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const Referral = mongoose.model('referrals', referralSchema);
module.exports = Referral;
