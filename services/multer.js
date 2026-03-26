const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage instance for Categories
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fresh-cart/categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});

// Create storage instance for Products
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fresh-cart/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});

// Multer instances
const uploadCategory = multer({ storage: categoryStorage });
const uploadProduct = multer({ storage: productStorage });

module.exports = { uploadCategory, uploadProduct };

