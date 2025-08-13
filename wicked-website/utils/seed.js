const { sequelize, User } = require('../models');
require('dotenv').config();

const seedOwner = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: false });
    
    // Check if owner already exists
    const existingOwner = await User.findOne({
      where: { username: process.env.ADMIN_USERNAME }
    });
    
    if (existingOwner) {
      console.log('Owner account already exists');
      return;
    }
    
    // Create owner account
    const owner = await User.create({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      phone: process.env.ADMIN_PHONE,
      password_hash: process.env.ADMIN_PASSWORD, // Will be hashed in the model hook
      role: 'OWNER',
      status: 'ACTIVE'
    });
    
    console.log('Owner account created successfully:', {
      id: owner.id,
      username: owner.username,
      email: owner.email,
      role: owner.role
    });
  } catch (error) {
    console.error('Error seeding owner:', error);
  } finally {
    await sequelize.close();
  }
};

// Run seed if called directly
if (require.main === module) {
  seedOwner();
}

module.exports = seedOwner;