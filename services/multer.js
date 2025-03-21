const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const categoriesDir = 'uploads/categories';
const productsDir = 'uploads/products';

if (!fs.existsSync(categoriesDir))
  fs.mkdirSync(categoriesDir, { recursive: true });
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });

// Function to create storage dynamically based on upload type
const createStorage = (uploadPath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      );
    },
  });

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

// Multer instances for categories and products
const uploadCategory = multer({
  storage: createStorage(categoriesDir),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

const uploadProduct = multer({
  storage: createStorage(productsDir),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = { uploadCategory, uploadProduct };
