const { Sequelize } = require('sequelize');
const path = require('path');
// Remove dotenv for Heroku deployment

let sequelize;

// Check if we're on Heroku with DATABASE_URL
if (process.env.DATABASE_URL) {
  // Heroku PostgreSQL configuration
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Heroku
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  // Local SQLite configuration
  const storagePath = process.env.DYNO
    ? '/tmp/database.sqlite'
    : path.join(__dirname, '..', 'database.sqlite');

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
}

module.exports = sequelize;