/**
 * Calmora - Server Entry Point
 * Express.js backend server for Mental Health Support Platform
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import database connection module
const { testConnection } = require('./config/db');

// Import route handlers
const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/moods');
const messageRoutes = require('./routes/messages');
const resourceRoutes = require('./routes/resources');
const aiRoutes = require('./routes/ai');
const contactRoutes = require('./routes/contact');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware configuration
// CORS: Allow cross-origin requests from frontend
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port and file:// protocol
    if (origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('file://')) {
      return callback(null, true);
    }
    
    // Allow configured frontend URL
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5500',
      'http://localhost:3001',
      'http://localhost:5500',
      'http://localhost:5501'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parser middleware: Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'calmora-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files (HTML, CSS, JS) from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve manifest.json with correct MIME type
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// API Routes - match frontend api.js expectations
app.use('/api/auth', authRoutes);        // POST /api/auth/signup, /login, /logout, GET /status
app.use('/api/moods', moodRoutes);       // POST /api/moods, GET /api/moods
app.use('/api/messages', messageRoutes); // POST /api/messages, GET /api/messages
app.use('/api/resources', resourceRoutes); // GET /api/resources
app.use('/api/chat', aiRoutes);          // POST /api/chat
app.use('/api/contact', contactRoutes);  // POST /api/contact

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Calmora API is running'
  });
});

// Error handling middleware
// Handles errors from async route handlers
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

/**
 * Start the server
 * Tests database connection before starting
 */
async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠ Warning: Database connection failed. API will start but database operations may fail.');
      console.warn('⚠ Please check your .env file and ensure MariaDB is running.');
    }
    
    // Start Express server with error handling for port conflicts
    const server = app.listen(PORT, () => {
      console.log('\n✓ Calmora server started successfully!');
      console.log(`  Server running on http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Database: ${process.env.DB_NAME || 'calmora'}`);
      console.log('\n  Available endpoints:');
      console.log('  - POST   /api/auth/signup');
      console.log('  - POST   /api/auth/login');
      console.log('  - POST   /api/auth/logout');
      console.log('  - GET    /api/auth/status');
      console.log('  - POST   /api/moods');
      console.log('  - GET    /api/moods');
      console.log('  - POST   /api/messages');
      console.log('  - GET    /api/messages');
      console.log('  - GET    /api/resources');
      console.log('  - POST   /api/chat');
      console.log('  - POST   /api/contact');
      console.log('  - GET    /api/health');
      console.log('');
    });

    // Handle server errors (like port already in use)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n✗ Port ${PORT} is already in use.`);
        console.error('  Please either:');
        console.error(`  1. Stop the process using port ${PORT}`);
        console.error('  2. Set a different PORT in your .env file');
        console.error('  3. Or wait a few seconds for the port to be released\n');
        process.exit(1);
      } else {
        console.error('✗ Server error:', err.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

