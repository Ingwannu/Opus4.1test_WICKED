const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { validateUpdateProfile } = require('../middleware/validation');

// Get profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'phone', 'role', 'status', 'created_at', 'last_login']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update profile
router.put('/', authenticate, validateUpdateProfile, async (req, res) => {
  try {
    const { phone, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update phone if provided
    if (phone !== undefined) {
      user.phone = phone;
    }
    
    // Update password if provided
    if (currentPassword && newPassword) {
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      user.password_hash = newPassword; // Will be hashed in the model hook
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user activity stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = {
      accountAge: Math.floor((new Date() - new Date(req.user.created_at)) / (1000 * 60 * 60 * 24)), // days
      lastActive: req.user.last_login,
      accountType: req.user.role,
      accountStatus: req.user.status
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;