const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  updatedAt: { type: Date, index: { expires: 75 } },
  expireAt: { type: Date },
});

module.exports = mongoose.model('otpSchema', otpSchema);
