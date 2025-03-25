const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ['Razorpay'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      transactionDetail: {
        type: String,
      },
      transactionId: {
        type: String,
      },
      transactionType: {
        type: String,
        enum: ['Credit', 'Debit'],
      },
      isOrderRedirect: {
        type: Boolean,
        default: false,
      },
      orderId: {
        type: String,
        default: null,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update 'updatedAt' field before saving
WalletSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;
