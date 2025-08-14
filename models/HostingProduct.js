const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HostingProduct = sequelize.define('HostingProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hosting_categories',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN'),
    defaultValue: 'AVAILABLE'
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'hosting_products',
  hooks: {
    beforeValidate: (product) => {
      if (product.name && !product.slug) {
        product.slug = product.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

module.exports = HostingProduct;