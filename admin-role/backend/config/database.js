const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanpulse';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  WARNING: MONGODB_URI not found in .env file');
      console.warn('📝 Using default MongoDB URI: mongodb://localhost:27017/urbanpulse');
      console.warn('💡 Server will continue without MongoDB (OTP will still work)');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MongoDB is running and MONGODB_URI is correct');
    console.warn('⚠️  Server will continue without MongoDB connection');
    console.warn('💡 OTP functionality will still work (uses in-memory cache)');
    console.warn('💡 Admin data will not be persisted until MongoDB is connected');
    // Don't exit - let server continue without DB
    return null;
  }
};

module.exports = connectDB;




