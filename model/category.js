const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  categoryDescription: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', CategorySchema);
