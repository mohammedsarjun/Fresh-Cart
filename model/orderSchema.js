const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  orderDateAndTime: {
    type: Date,
    default: Date.now,
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['Razorpay', 'Cash on Delivery', 'Wallet'],
      required: true,
    },
    transactionId: {
      type: String,
      default: null, // Only applicable for online payments
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
  },

  subTotal: {
    type: Number,
    required: true,
  },
  overallDiscountAmount: {
    type: Number,
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Shipped',
      'Delivered',
      'Cancelled',
      'Returning',
      'Returned',
    ],
    default: 'Pending',
  },

  shippingCost: {
    type: Number,
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number,
      productPrice: Number,
      varietyMeasurement: Number,
      shippingDate: {
        type: Date,
        default:null
      },
      orderStatus:{
        type: String,
        enum: [
          'Pending',
          'Shipped',
          'Delivered',
          'Cancelled',
          'Returning',
          'Returned',
        ],
        default: 'Pending',
      }, returnDetails: {
        reason: String,
        additionalDetails: String,
      },
    },
  ],
  coupon: {
    code: String,
    discount: Number,
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    addressType: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
 
});

module.exports = mongoose.model('orders', OrderSchema);
