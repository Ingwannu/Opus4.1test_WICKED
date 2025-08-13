const express = require('express');
const router = express.Router();
const { User, AdminActionLog, DiscordBot, HostingCategory, HostingProduct } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { logAdminAction, getClientIp } = require('../utils/logger');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// All admin routes require authentication and admin privileges
router.use(authenticate, requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'ACTIVE' } });
    const suspendedUsers = await User.count({ where: { status: 'SUSPENDED' } });
    
    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', 'id'), 'count']],
      group: ['role']
    });
    
    const recentLogins = await User.findAll({
      where: { last_login: { [Op.not]: null } },
      order: [['last_login', 'DESC']],
      limit: 10,
      attributes: ['id', 'username', 'email', 'role', 'last_login']
    });
    
    const totalBots = await DiscordBot.count();
    const totalCategories = await HostingCategory.count();
    const totalProducts = await HostingProduct.count();
    
    res.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        totalBots,
        totalCategories,
        totalProducts
      },
      recentLogins
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get users list with filtering
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Apply permission filtering
    if (req.user.role === 'ADMIN') {
      where.role = { [Op.notIn]: ['OWNER', 'ADMIN'] };
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: ['id', 'username', 'email', 'phone', 'role', 'status', 'created_at', 'last_login']
    });
    
    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: AdminActionLog,
          as: 'targetActions',
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [{ model: User, as: 'admin', attributes: ['username'] }]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check permissions
    if (!req.user.canManageUser(user)) {
      return res.status(403).json({ error: 'Cannot manage this user' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!req.user.canManageUser(user)) {
      return res.status(403).json({ error: 'Cannot manage this user' });
    }
    
    const oldStatus = user.status;
    user.status = status;
    await user.save();
    
    await logAdminAction(
      req.user.id,
      status === 'ACTIVE' ? 'USER_ACTIVATE' : 'USER_SUSPEND',
      user.id,
      { oldStatus, newStatus: status },
      getClientIp(req)
    );
    
    res.json({ message: 'User status updated', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['OWNER', 'ADMIN', 'ULTRA', 'PRO', 'FREE'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!req.user.canManageUser(user)) {
      return res.status(403).json({ error: 'Cannot manage this user' });
    }
    
    // Prevent creating multiple owners
    if (role === 'OWNER' && req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only owner can assign owner role' });
    }
    
    const oldRole = user.role;
    user.role = role;
    await user.save();
    
    await logAdminAction(
      req.user.id,
      'ROLE_CHANGE',
      user.id,
      { oldRole, newRole: role },
      getClientIp(req)
    );
    
    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!req.user.canManageUser(user)) {
      return res.status(403).json({ error: 'Cannot manage this user' });
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    user.password_hash = await bcrypt.hash(tempPassword, 12);
    await user.save();
    
    await logAdminAction(
      req.user.id,
      'PASSWORD_RESET',
      user.id,
      {},
      getClientIp(req)
    );
    
    res.json({ 
      message: 'Password reset successful', 
      tempPassword // In production, this would be sent via email
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get admin action logs
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, admin_id, target_user_id, action_type } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    if (admin_id) where.admin_id = admin_id;
    if (target_user_id) where.target_user_id = target_user_id;
    if (action_type) where.action_type = action_type;
    
    const { count, rows: logs } = await AdminActionLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'admin', attributes: ['username', 'email'] },
        { model: User, as: 'targetUser', attributes: ['username', 'email'] }
      ]
    });
    
    res.json({
      logs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Delete admin logs (Owner only)
router.delete('/logs/:id', async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only owner can delete logs' });
    }
    
    const log = await AdminActionLog.findByPk(req.params.id);
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    await log.destroy();
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

module.exports = router;