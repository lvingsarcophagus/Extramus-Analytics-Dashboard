const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Only import demo routes for now
const demoRoutes = require('./routes/demo');

const { errorHandler } = require('./middleware/error');
const { notFound } = require('./middleware/notFound');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/', rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Demo routes (works without database)
app.use('/api', demoRoutes);

// API Routes (with database) - commented out for demo mode
/*
try {
  const authRoutes = require('./routes/auth');
  const documentRoutes = require('./routes/documents');
  const userRoutes = require('./routes/users');
  const notificationRoutes = require('./routes/notifications');
  const analyticsRoutes = require('./routes/analytics');

  // Test database connection before using these routes
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  // Only use database routes if connection works
  app.use('/api/auth', authRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  
  console.log('📊 Database routes loaded');
} catch (error) {
  console.warn('⚠️  Database not available, using demo mode only');
}
*/

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Extramus HR Document Management API',
    version: '1.0.0',
    mode: 'Demo Mode (No Database Required)',
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});

module.exports = app;
