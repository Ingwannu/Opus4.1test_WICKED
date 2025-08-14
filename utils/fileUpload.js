const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Create upload directories if they don't exist
const createUploadDirs = async () => {
  const dirs = [
    'uploads/images/bots',
    'uploads/images/products'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Storage configuration for bot images
const botStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await createUploadDirs();
    cb(null, path.join(__dirname, '..', 'uploads/images/bots'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for product images
const productStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await createUploadDirs();
    cb(null, path.join(__dirname, '..', 'uploads/images/products'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer instances
const uploadBotImage = multer({
  storage: botStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
  fileFilter: imageFilter
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
  fileFilter: imageFilter
});

module.exports = {
  uploadBotImage,
  uploadProductImage,
  createUploadDirs
};