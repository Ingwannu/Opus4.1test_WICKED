const express = require('express');
const router = express.Router();
const { DiscordBot } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateBot } = require('../middleware/validation');
const { uploadBotImage } = require('../utils/fileUpload');
const { logAdminAction, getClientIp } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// Public routes
// Get all active bots
router.get('/public', async (req, res) => {
  try {
    const bots = await DiscordBot.findAll({
      where: { status: 'ACTIVE' },
      attributes: ['id', 'name', 'slug', 'short_description', 'image_path'],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ bots });
  } catch (error) {
    console.error('Get public bots error:', error);
    res.status(500).json({ error: 'Failed to get bots' });
  }
});

// Get bot details by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const bot = await DiscordBot.findOne({
      where: { slug: req.params.slug, status: 'ACTIVE' }
    });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    res.json({ bot });
  } catch (error) {
    console.error('Get bot details error:', error);
    res.status(500).json({ error: 'Failed to get bot details' });
  }
});

// Admin routes
// Get all bots (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const bots = await DiscordBot.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: require('../models').User, as: 'creator', attributes: ['username'] },
        { model: require('../models').User, as: 'updater', attributes: ['username'] }
      ]
    });
    
    res.json({ bots });
  } catch (error) {
    console.error('Get admin bots error:', error);
    res.status(500).json({ error: 'Failed to get bots' });
  }
});

// Create new bot
router.post('/', authenticate, requireAdmin, uploadBotImage.single('image'), validateBot, async (req, res) => {
  try {
    const { name, short_description, description, invite_link } = req.body;
    
    const botData = {
      name,
      short_description,
      description,
      invite_link,
      created_by: req.user.id,
      updated_by: req.user.id
    };
    
    if (req.file) {
      botData.image_path = `/uploads/images/bots/${req.file.filename}`;
    }
    
    const bot = await DiscordBot.create(botData);
    
    await logAdminAction(
      req.user.id,
      'BOT_CREATE',
      null,
      { botId: bot.id, botName: bot.name },
      getClientIp(req)
    );
    
    res.status(201).json({ message: 'Bot created successfully', bot });
  } catch (error) {
    console.error('Create bot error:', error);
    // Clean up uploaded file if bot creation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

// Update bot
router.put('/:id', authenticate, requireAdmin, uploadBotImage.single('image'), validateBot, async (req, res) => {
  try {
    const bot = await DiscordBot.findByPk(req.params.id);
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    const { name, short_description, description, invite_link, status } = req.body;
    const oldImagePath = bot.image_path;
    
    bot.name = name;
    bot.short_description = short_description;
    bot.description = description || bot.description;
    bot.invite_link = invite_link || bot.invite_link;
    bot.status = status || bot.status;
    bot.updated_by = req.user.id;
    
    if (req.file) {
      bot.image_path = `/uploads/images/bots/${req.file.filename}`;
      
      // Delete old image if it exists
      if (oldImagePath) {
        const oldFilePath = path.join(__dirname, '..', oldImagePath);
        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }
    }
    
    await bot.save();
    
    await logAdminAction(
      req.user.id,
      'BOT_UPDATE',
      null,
      { botId: bot.id, botName: bot.name },
      getClientIp(req)
    );
    
    res.json({ message: 'Bot updated successfully', bot });
  } catch (error) {
    console.error('Update bot error:', error);
    // Clean up uploaded file if update failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to update bot' });
  }
});

// Delete bot
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const bot = await DiscordBot.findByPk(req.params.id);
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    // Delete associated image if it exists
    if (bot.image_path) {
      const filePath = path.join(__dirname, '..', bot.image_path);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete bot image:', error);
      }
    }
    
    await logAdminAction(
      req.user.id,
      'BOT_DELETE',
      null,
      { botId: bot.id, botName: bot.name },
      getClientIp(req)
    );
    
    await bot.destroy();
    
    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});

module.exports = router;