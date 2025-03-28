const mongoose = require('mongoose');

const productOfferSchema = new mongoose.Schema(
  {
    selectProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Assuming there's a Product model
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    selectVariety: {
      type: String,
      required: true,
    },
    selectedVarietyMeasurement: {
      type: String,
      required: false, // Optional field
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after the start date.',
      },
    },
    offerPercentage: {
      type: Number,
      required: true,
      min: [0, 'Offer percentage cannot be negative.'],
      max: [100, 'Offer percentage cannot exceed 100%.'],
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
  },
  { timestamps: true }
);

const ProductOffer = mongoose.model('productoffers', productOfferSchema);

module.exports = ProductOffer;
