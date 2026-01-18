// Load environment variables FIRST, before requiring any routes/controllers
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transcriptionRoutes = require('./routes/transcription');
const serviceRoutes = require('./routes/services');
const alertRoutes = require('./routes/alerts');
const issueRoutes = require('./routes/issues');
const messageRoutes = require('./routes/messages');
const requestRoutes = require('./routes/requests');
const notificationRoutes = require('./routes/notifications');
const connectDB = require('./config/database');

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.warn('⚠️  WARNING: .env file not found!');
  console.warn('📝 Please create backend/.env file with your Fast2SMS API key and MongoDB URI');
  console.warn('📋 Copy backend/.env.example to backend/.env and fill in your values');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Check MOCK_OTP mode
const MOCK_OTP = process.env.MOCK_OTP === 'true';
if (MOCK_OTP) {
  console.log('\n⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️');
  console.log('⚠️  MOCK OTP MODE ENABLED — Any OTP will be accepted');
  console.log('⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️\n');
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (before routes)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`🌐 From: ${req.ip || req.connection.remoteAddress}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('📦 Request Body: (empty)');
  }
  console.log('─'.repeat(60));
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api/transcribe', transcriptionRoutes);
app.use('/services', serviceRoutes);
app.use('/alerts', alertRoutes);
app.use('/issues', issueRoutes);
app.use('/messages', messageRoutes);
app.use('/requests', requestRoutes);
app.use('/helpers', require('./routes/helpers'));
app.use('/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UrbanPulse API is running' });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('💡 Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('💡 Server will continue running...');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 ========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🚀 Server accessible at http://192.168.1.8:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 ========================================\n`);
  console.log('⏳ Waiting for requests...\n');
  console.log('💡 OTP will be displayed in this terminal when you send OTP from the app');
  console.log('💡 Look for: 🔑 ===== OTP GENERATED =====\n');
});

module.exports = app;

