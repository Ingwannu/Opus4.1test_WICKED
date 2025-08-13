const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin()) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireOwner = async (req, res, next) => {
  if (!req.user || req.user.role !== 'OWNER') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
};

const checkPermission = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireAdmin,
  requireOwner,
  checkPermission
};