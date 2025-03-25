const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  code: String,
  userId: mongoose.Schema.Types.ObjectId, // Reference to the user
  used: { type: Boolean, default: false }, // Track if used
});

const Referral = mongoose.model('Referral', referralSchema);
module.exports = Referral;
