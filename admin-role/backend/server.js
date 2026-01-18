const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminAuthRoutes = require('./routes/adminAuth');
const adminServicesRoutes = require('./routes/adminServices');
const alertRoutes = require('./routes/alerts');
const adminIssuesRoutes = require('./routes/adminIssues');
const adminMessagesRoutes = require('./routes/adminMessages');
const adminRequestsRoutes = require('./routes/adminRequests');
const connectDB = require('./config/database');

dotenv.config();

// Check if .env file exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.warn('⚠️  WARNING: .env file not found!');
  console.warn('📝 Please create admin-role/backend/.env file with your configuration');
  console.warn('📋 Copy admin-role/backend/.env.example to admin-role/backend/.env and fill in your values');
}

const app = express();
const PORT = process.env.PORT || 3001; // Different port from user backend (3000)

// Check MOCK_OTP mode
const MOCK_OTP = process.env.MOCK_OTP === 'true';
if (MOCK_OTP) {
  console.log('\n⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️');
  console.log('⚠️  MOCK OTP MODE ENABLED — Any OTP will be accepted');
  console.log('⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️  ⚠️\n');
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
app.use('/admin/auth', adminAuthRoutes);
// Add /admin/me endpoint (frontend expects this path)
const adminAuthController = require('./controllers/adminAuthController');
app.get('/admin/me', adminAuthController.verifyAdminToken, adminAuthController.getMe);
app.use('/services', adminServicesRoutes);
app.use('/alerts', alertRoutes);
app.use('/issues', adminIssuesRoutes);
app.use('/messages', adminMessagesRoutes);
app.use('/requests', adminRequestsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UrbanPulse Admin API is running' });
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
  console.log(`🚀 Admin Backend Server running on http://localhost:${PORT}`);
  console.log(`🚀 Server accessible at http://192.168.1.8:${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 ========================================\n`);
  console.log('⏳ Waiting for admin requests...\n');
  console.log('💡 Admin OTP will be displayed in this terminal when you send OTP from the app');
  console.log('💡 Look for: 🔑 ===== ADMIN OTP GENERATED =====\n');
});

module.exports = app;

