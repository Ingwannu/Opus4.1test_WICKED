const sequelize = require('../config/database');
const User = require('./User');
const AdminActionLog = require('./AdminActionLog');
const DiscordBot = require('./DiscordBot');
const HostingCategory = require('./HostingCategory');
const HostingProduct = require('./HostingProduct');

// Define associations
// User and AdminActionLog relationships
User.hasMany(AdminActionLog, { foreignKey: 'admin_id', as: 'adminActions' });
User.hasMany(AdminActionLog, { foreignKey: 'target_user_id', as: 'targetActions' });
AdminActionLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });
AdminActionLog.belongsTo(User, { foreignKey: 'target_user_id', as: 'targetUser' });

// User and DiscordBot relationships
User.hasMany(DiscordBot, { foreignKey: 'created_by', as: 'createdBots' });
User.hasMany(DiscordBot, { foreignKey: 'updated_by', as: 'updatedBots' });
DiscordBot.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
DiscordBot.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// HostingCategory and HostingProduct relationships
HostingCategory.hasMany(HostingProduct, { foreignKey: 'category_id', as: 'products', onDelete: 'CASCADE' });
HostingProduct.belongsTo(HostingCategory, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  sequelize,
  User,
  AdminActionLog,
  DiscordBot,
  HostingCategory,
  HostingProduct
};