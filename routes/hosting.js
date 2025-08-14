const express = require('express');
const router = express.Router();
const { HostingCategory, HostingProduct } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateCategory, validateProduct } = require('../middleware/validation');
const { uploadProductImage } = require('../utils/fileUpload');
const { logAdminAction, getClientIp } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// Public routes
// Get all categories with products
router.get('/public/categories', async (req, res) => {
  try {
    const categories = await HostingCategory.findAll({
      where: { status: 'ACTIVE' },
      include: [{
        model: HostingProduct,
        as: 'products',
        where: { status: 'AVAILABLE' },
        required: false,
        order: [['order', 'ASC'], ['created_at', 'DESC']]
      }],
      order: [['order', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json({ categories });
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get single category with products
router.get('/public/categories/:slug', async (req, res) => {
  try {
    const category = await HostingCategory.findOne({
      where: { slug: req.params.slug, status: 'ACTIVE' },
      include: [{
        model: HostingProduct,
        as: 'products',
        where: { status: { [require('sequelize').Op.in]: ['AVAILABLE', 'OUT_OF_STOCK'] } },
        required: false,
        order: [['order', 'ASC'], ['created_at', 'DESC']]
      }]
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ category });
  } catch (error) {
    console.error('Get category details error:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
});

// Get product details
router.get('/public/products/:id', async (req, res) => {
  try {
    const product = await HostingProduct.findOne({
      where: { id: req.params.id, status: { [require('sequelize').Op.ne]: 'HIDDEN' } },
      include: [{
        model: HostingCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Admin routes - Categories
// Get all categories (admin)
router.get('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const categories = await HostingCategory.findAll({
      include: [{
        model: HostingProduct,
        as: 'products',
        attributes: ['id']
      }],
      order: [['order', 'ASC'], ['created_at', 'DESC']]
    });
    
    const categoriesWithCount = categories.map(cat => ({
      ...cat.toJSON(),
      productCount: cat.products.length
    }));
    
    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Create category
router.post('/categories', authenticate, requireAdmin, validateCategory, async (req, res) => {
  try {
    const { name, description, order } = req.body;
    
    const category = await HostingCategory.create({
      name,
      description,
      order: order || 0
    });
    
    await logAdminAction(
      req.user.id,
      'CATEGORY_CREATE',
      null,
      { categoryId: category.id, categoryName: category.name },
      getClientIp(req)
    );
    
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', authenticate, requireAdmin, validateCategory, async (req, res) => {
  try {
    const category = await HostingCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const { name, description, order, status } = req.body;
    
    category.name = name;
    category.description = description || category.description;
    category.order = order !== undefined ? order : category.order;
    category.status = status || category.status;
    
    await category.save();
    
    await logAdminAction(
      req.user.id,
      'CATEGORY_UPDATE',
      null,
      { categoryId: category.id, categoryName: category.name },
      getClientIp(req)
    );
    
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await HostingCategory.findByPk(req.params.id, {
      include: [{ model: HostingProduct, as: 'products' }]
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Delete all product images
    for (const product of category.products) {
      if (product.image_path) {
        const filePath = path.join(__dirname, '..', product.image_path);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Failed to delete product image:', error);
        }
      }
    }
    
    await logAdminAction(
      req.user.id,
      'CATEGORY_DELETE',
      null,
      { categoryId: category.id, categoryName: category.name, deletedProducts: category.products.length },
      getClientIp(req)
    );
    
    await category.destroy(); // This will cascade delete all products
    
    res.json({ message: 'Category and all associated products deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Admin routes - Products
// Get all products (admin)
router.get('/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const { category_id } = req.query;
    const where = {};
    
    if (category_id) {
      where.category_id = category_id;
    }
    
    const products = await HostingProduct.findAll({
      where,
      include: [{
        model: HostingCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['order', 'ASC'], ['created_at', 'DESC']]
    });
    
    res.json({ products });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Create product
router.post('/products', authenticate, requireAdmin, uploadProductImage.single('image'), validateProduct, async (req, res) => {
  try {
    const { category_id, name, description, price, status, features, order } = req.body;
    
    // Verify category exists
    const category = await HostingCategory.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    const productData = {
      category_id,
      name,
      description,
      price,
      status: status || 'AVAILABLE',
      features: features ? JSON.parse(features) : [],
      order: order || 0
    };
    
    if (req.file) {
      productData.image_path = `/uploads/images/products/${req.file.filename}`;
    }
    
    const product = await HostingProduct.create(productData);
    
    await logAdminAction(
      req.user.id,
      'PRODUCT_CREATE',
      null,
      { productId: product.id, productName: product.name, categoryId: category.id },
      getClientIp(req)
    );
    
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    // Clean up uploaded file if product creation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', authenticate, requireAdmin, uploadProductImage.single('image'), validateProduct, async (req, res) => {
  try {
    const product = await HostingProduct.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const { category_id, name, description, price, status, features, order } = req.body;
    const oldImagePath = product.image_path;
    
    // Verify category exists if changing
    if (category_id && category_id !== product.category_id) {
      const category = await HostingCategory.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      product.category_id = category_id;
    }
    
    product.name = name;
    product.description = description || product.description;
    product.price = price;
    product.status = status || product.status;
    product.features = features ? JSON.parse(features) : product.features;
    product.order = order !== undefined ? order : product.order;
    
    if (req.file) {
      product.image_path = `/uploads/images/products/${req.file.filename}`;
      
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
    
    await product.save();
    
    await logAdminAction(
      req.user.id,
      'PRODUCT_UPDATE',
      null,
      { productId: product.id, productName: product.name },
      getClientIp(req)
    );
    
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    // Clean up uploaded file if update failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await HostingProduct.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete associated image if it exists
    if (product.image_path) {
      const filePath = path.join(__dirname, '..', product.image_path);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Failed to delete product image:', error);
      }
    }
    
    await logAdminAction(
      req.user.id,
      'PRODUCT_DELETE',
      null,
      { productId: product.id, productName: product.name },
      getClientIp(req)
    );
    
    await product.destroy();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;