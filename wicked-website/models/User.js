const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9]{10,15}$/
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('OWNER', 'ADMIN', 'ULTRA', 'PRO', 'FREE'),
    defaultValue: 'FREE',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'DELETED'),
    defaultValue: 'ACTIVE',
    allowNull: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2b$')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.isAdmin = function() {
  return this.role === 'OWNER' || this.role === 'ADMIN';
};

User.prototype.canManageUser = function(targetUser) {
  if (this.role === 'OWNER') return true;
  if (this.role === 'ADMIN') {
    return targetUser.role !== 'OWNER' && targetUser.role !== 'ADMIN';
  }
  return false;
};

module.exports = User;