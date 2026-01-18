// Quick test script to verify backend is receiving requests
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🧪 Testing backend connection...\n');

  // Test 1: Health check
  try {
    console.log('1️⃣ Testing /health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Auth test endpoint
  try {
    console.log('\n2️⃣ Testing /auth/test endpoint...');
    const testResponse = await axios.get(`${API_URL}/auth/test`);
    console.log('✅ Auth test passed:', testResponse.data);
  } catch (error) {
    console.log('❌ Auth test failed:', error.message);
  }

  // Test 3: Send OTP
  try {
    console.log('\n3️⃣ Testing /auth/send-otp endpoint...');
    const otpResponse = await axios.post(`${API_URL}/auth/send-otp`, {
      phoneNumber: '+919876543210',
      fullName: 'Test User'
    });
    console.log('✅ Send OTP passed:', otpResponse.data);
    if (otpResponse.data.otp) {
      console.log(`\n🔑 OTP received: ${otpResponse.data.otp}`);
    }
  } catch (error) {
    console.log('❌ Send OTP failed:', error.response?.data || error.message);
  }

  console.log('\n✅ All tests completed!');
}

testConnection();











