const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET is set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not set in environment variables!');
  console.error('Please set JWT_SECRET in Heroku config vars using: heroku config:set JWT_SECRET=your-secret-key');
  // Use a temporary fallback for development only
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Using temporary JWT secret for development. DO NOT use in production!');
  } else {
    throw new Error('JWT_SECRET must be set in production environment');
  }
}

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET || 'temporary-development-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET || 'temporary-development-secret');
  } catch (error) {
    return null;
  }
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET || 'temporary-development-secret', {
    expiresIn: '30d'
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};