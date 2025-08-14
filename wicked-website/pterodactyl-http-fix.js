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

// Trust proxy for Pterodactyl
app.set('trust proxy', true);

// Security middleware - relaxed for HTTP development
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS - allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Static files with explicit content types
app.use('/css', express.static(path.join(__dirname, 'public/css'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.use('/js', express.static(path.join(__dirname, 'public/js'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(morgan('combined'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', apiLimiter, profileRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/bots', apiLimiter, botRoutes);
app.use('/api/hosting', apiLimiter, hostingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'pterodactyl-http'
  });
});

// HTML routes
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
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).send('Not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await createUploadDirs();
    await sequelize.authenticate();
    console.log('Database connection established');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    await seedOwner();
    
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`External access: http://119.202.156.3:${PORT}`);
      console.log(`Environment: pterodactyl-http`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;