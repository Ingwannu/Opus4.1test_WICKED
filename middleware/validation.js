const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits'),
  handleValidationErrors
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUpdateProfile = [
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits'),
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required to change password'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
];

const validateBot = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Bot name is required and must be less than 100 characters'),
  body('short_description')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Short description is required and must be less than 150 characters'),
  body('invite_link')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid invite link URL'),
  handleValidationErrors
];

const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name is required and must be less than 100 characters'),
  handleValidationErrors
];

const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must be less than 200 characters'),
  body('price')
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('Price must be a positive number'),
  body('category_id')
    .notEmpty()
    .withMessage('Category is required'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateBot,
  validateCategory,
  validateProduct
};