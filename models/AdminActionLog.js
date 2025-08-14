const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminActionLog = sequelize.define('AdminActionLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  target_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action_type: {
    type: DataTypes.ENUM(
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_SUSPEND',
      'USER_ACTIVATE',
      'ROLE_CHANGE',
      'PASSWORD_RESET',
      'FORCE_LOGOUT',
      'BOT_CREATE',
      'BOT_UPDATE',
      'BOT_DELETE',
      'PRODUCT_CREATE',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'CATEGORY_CREATE',
      'CATEGORY_UPDATE',
      'CATEGORY_DELETE'
    ),
    allowNull: false
  },
  action_payload: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'admin_action_logs',
  updatedAt: false
});

module.exports = AdminActionLog;