const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  couponStartDate: {
    type: Date,
    required: true,
  },
  couponExpiryDate: {
    type: Date,
    required: true,
  },
  minimumPurchase: {
    type: Number,
    required: true,
    min: 0,
  },
  maximumDiscount: {
    type: Number,
    required: true,
    min: 0,
  },
  currentStatus: {
    type: String,
    enum: ['active', 'expired', 'upcoming'],
    required: true,
    default: 'active',
  },
  isListed: {
    type: Boolean,
    required: true,
    default: true,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
