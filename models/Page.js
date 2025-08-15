const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9-]+$/i
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('bot', 'service', 'general'),
      allowNull: false,
      defaultValue: 'general'
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      defaultValue: 'draft'
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featured_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'pages',
    underscored: true,
    indexes: [
      {
        fields: ['slug']
      },
      {
        fields: ['category']
      },
      {
        fields: ['status']
      }
    ]
  });

  Page.associate = (models) => {
    Page.belongsTo(models.User, {
      foreignKey: 'author_id',
      as: 'author'
    });
  };

  return Page;
};