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
const PORT = process.env.SERVER_PORT || process.env.PORT || 50012;  // Use Pterodactyl's SERVER_PORT first
const HOST = '0.0.0.0';  // Always bind to all interfaces in container

// Trust proxy settings for HTTPS
app.set('trust proxy', true);
app.use((req, res, next) => {
  // Force HTTPS in production when accessed via domain
  if (process.env.NODE_ENV === 'production' && req.headers.host && req.headers.host.includes('teamwicked.me')) {
    req.headers['x-forwarded-proto'] = 'https';
  }
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "http:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"]
    }
  },
  crossOriginOpenerPolicy: process.env.NODE_ENV === 'production' ? false : undefined
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL, 
        `http://${HOST}:${PORT}`, 
        'https://teamwicked.me',
        'http://teamwicked.me',
        'https://www.teamwicked.me',
        'http://www.teamwicked.me',
        'http://119.202.156.3',
        'https://119.202.156.3',
        `http://119.202.156.3:${PORT}`,
        '*'
      ] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files - moved before body parsing to ensure proper handling
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path, stat) => {
    // Set proper content types
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    
    // Add cache control
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
  },
  index: false // Disable directory indexing
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
  }
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', apiLimiter, profileRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/bots', apiLimiter, botRoutes);
app.use('/api/hosting', apiLimiter, hostingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host;
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    protocol: protocol,
    host: host,
    baseUrl: `${protocol}://${host}`
  });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/bots/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bot-detail.html'));
});

app.get('/hosting', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'hosting.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Create upload directories
    await createUploadDirs();
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Seed owner account
    await seedOwner();
    
    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`External access: http://119.202.156.3:${PORT}`);
      console.log(`Domain access: https://teamwicked.me`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;