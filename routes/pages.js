const express = require('express');
const router = express.Router();
const { Page, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const marked = require('marked');
const DOMPurify = require('isomorphic-dompurify');

// Configure marked for safe markdown rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
});

// Get all published pages
router.get('/public', async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = { status: 'published' };
    if (category) {
      where.category = category;
    }
    
    const pages = await Page.findAll({
      where,
      attributes: ['id', 'title', 'slug', 'category', 'meta_description', 'featured_image', 'published_at'],
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }],
      order: [['published_at', 'DESC']]
    });
    
    res.json({ pages });
  } catch (error) {
    console.error('Error fetching public pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get single published page by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({
      where: {
        slug: req.params.slug,
        status: 'published'
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }]
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    // Convert markdown to HTML
    const htmlContent = DOMPurify.sanitize(marked.parse(page.content));
    
    res.json({ 
      page: {
        ...page.toJSON(),
        htmlContent
      }
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// Admin routes
// Get all pages (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pages = await Page.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get single page (admin)
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }]
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// Create new page
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, content, category, meta_description, featured_image, status } = req.body;
    
    // Check if slug already exists
    const existingPage = await Page.findOne({ where: { slug } });
    if (existingPage) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    
    const page = await Page.create({
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      content,
      category,
      meta_description,
      featured_image,
      status,
      author_id: req.user.id,
      published_at: status === 'published' ? new Date() : null
    });
    
    const pageWithAuthor = await Page.findByPk(page.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }]
    });
    
    res.status(201).json({ page: pageWithAuthor });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Update page
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const { title, slug, content, category, meta_description, featured_image, status } = req.body;
    
    // Check if new slug already exists (excluding current page)
    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({ 
        where: { 
          slug,
          id: { [require('sequelize').Op.ne]: page.id }
        } 
      });
      if (existingPage) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }
    
    // Update published_at if status changes to published
    const updateData = {
      title,
      slug: slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') : page.slug,
      content,
      category,
      meta_description,
      featured_image,
      status
    };
    
    if (status === 'published' && page.status !== 'published') {
      updateData.published_at = new Date();
    }
    
    await page.update(updateData);
    
    const updatedPage = await Page.findByPk(page.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }]
    });
    
    res.json({ page: updatedPage });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Delete page
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    await page.destroy();
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

module.exports = router;