const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HostingCategory = sequelize.define('HostingCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE'
  }
}, {
  tableName: 'hosting_categories',
  hooks: {
    beforeValidate: (category) => {
      if (category.name && !category.slug) {
        category.slug = category.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

module.exports = HostingCategory;