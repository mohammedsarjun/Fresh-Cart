const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    }, // Reference to user
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        }, // Reference to product
        isItem: { type: Boolean, required: true }, // true if the product is a single item without a variety
        variety: {
          varietyName: {
            type: String,
            required: function () {
              return !this.isItem;
            },
          }, // Name of variety (e.g., "Chocolate", "Vanilla")
          varietyMeasurement: {
            type: String,
            required: function () {
              return !this.isItem;
            },
          }, // Measurement if applicable (e.g., "250g", "500ml")
        },
      },
    ],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
