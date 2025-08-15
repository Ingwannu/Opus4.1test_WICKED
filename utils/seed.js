const { sequelize, User } = require('../models');
// Remove dotenv for Heroku deployment

const seedOwner = async () => {
  try {
    // Check if required environment variables are set
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PHONE || !process.env.ADMIN_PASSWORD) {
      console.log('Admin account environment variables not set. Skipping owner seed.');
      console.log('To set up admin account, configure these Heroku config vars:');
      console.log('- ADMIN_USERNAME');
      console.log('- ADMIN_EMAIL');
      console.log('- ADMIN_PHONE');
      console.log('- ADMIN_PASSWORD');
      console.log('Use: heroku config:set ADMIN_USERNAME=your-username ADMIN_EMAIL=your-email etc.');
      return;
    }
    
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
    // Don't exit the process on seed error
  }
};

// Run seed if called directly
if (require.main === module) {
  seedOwner().then(() => {
    sequelize.close();
  });
}

module.exports = seedOwner;