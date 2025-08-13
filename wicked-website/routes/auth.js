const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

// Register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      phone,
      password_hash: password, // Will be hashed in the model hook
      role: 'FREE'
    });
    
    // Generate token
    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username }
        ],
        status: 'ACTIVE'
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.last_login = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin()
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      status: req.user.status,
      isAdmin: req.user.isAdmin(),
      createdAt: req.user.created_at,
      lastLogin: req.user.last_login
    }
  });
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// Check email availability
router.get('/check-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.params.email }
    });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ error: 'Check failed' });
  }
});

module.exports = router;