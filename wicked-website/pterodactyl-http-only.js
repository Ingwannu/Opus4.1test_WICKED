const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const seedOwner = require('./utils/seed');
const { createUploadDirs } = require('./utils/fileUpload');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const botRoutes = require('./routes/bots');
const hostingRoutes = require('./routes/hosting');

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 50012;
const HOST = '0.0.0.0';

// HTTP-only mode - No HTTPS redirect
app.set('trust proxy', true);

// Modified Security middleware for HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "http:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:", "http:", "https:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"],
      upgradeInsecureRequests: null  // Disable upgrade to HTTPS
    }
  },
  hsts: false,  // Disable HSTS for HTTP-only mode
  crossOriginOpenerPolicy: false
}));

// CORS configuration - Allow HTTP
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://119.202.156.3:50012',
      'http://teamwicked.me',
      'http://www.teamwicked.me'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in HTTP mode
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

// Cookie settings for HTTP
app.use(cookieParser());
app.use((req, res, next) => {
  // Override cookie settings for HTTP
  req.secureCookie = false;
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/hosting', hostingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'http-only',
    port: PORT,
    message: 'Server running in HTTP-only mode for Pterodactyl'
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    await sequelize.sync();
    console.log('Database synchronized');
    
    await seedOwner();
    await createUploadDirs();
    
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`External access: http://119.202.156.3:${PORT}`);
      console.log(`Mode: HTTP-only (Pterodactyl compatible)`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();