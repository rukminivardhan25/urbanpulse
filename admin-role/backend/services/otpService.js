const bcrypt = require('bcryptjs');
const NodeCache = require('node-cache');

// Cache for storing OTPs (in-memory, use Redis in production)
const otpCache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
const resendCooldown = new NodeCache({ stdTTL: 60 }); // 60 seconds cooldown

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP before storing
 */
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify OTP
 */
const verifyOTP = async (otp, hashedOTP) => {
  return await bcrypt.compare(otp, hashedOTP);
};

/**
 * Store OTP with expiry
 */
const storeOTP = async (phoneNumber, otp) => {
  const hashedOTP = await hashOTP(otp);
  const key = `admin_otp_${phoneNumber}`;
  
  // Store hashed OTP with expiry
  otpCache.set(key, {
    hashedOTP,
    phoneNumber,
    createdAt: new Date(),
    attempts: 0, // Track verification attempts
  }, OTP_EXPIRY_MINUTES * 60);

  return true;
};

/**
 * Get stored OTP data
 */
const getOTP = (phoneNumber) => {
  const key = `admin_otp_${phoneNumber}`;
  return otpCache.get(key);
};

/**
 * Delete OTP after verification
 */
const deleteOTP = (phoneNumber) => {
  const key = `admin_otp_${phoneNumber}`;
  otpCache.del(key);
};

/**
 * Check if resend is allowed (cooldown period)
 */
const canResendOTP = (phoneNumber) => {
  const key = `admin_resend_${phoneNumber}`;
  return !resendCooldown.has(key);
};

/**
 * Set resend cooldown
 */
const setResendCooldown = (phoneNumber) => {
  const key = `admin_resend_${phoneNumber}`;
  resendCooldown.set(key, true, RESEND_COOLDOWN_SECONDS);
};

/**
 * Increment verification attempts (for brute force protection)
 */
const incrementAttempts = (phoneNumber) => {
  const otpData = getOTP(phoneNumber);
  if (otpData) {
    otpData.attempts += 1;
    const key = `admin_otp_${phoneNumber}`;
    const ttl = otpCache.getTtl(key);
    if (ttl) {
      otpCache.set(key, otpData, Math.floor((ttl - Date.now()) / 1000));
    }
  }
};

/**
 * Check if too many attempts (brute force protection)
 */
const isBlocked = (phoneNumber) => {
  const otpData = getOTP(phoneNumber);
  return otpData && otpData.attempts >= 5; // Max 5 attempts
};

module.exports = {
  generateOTP,
  storeOTP,
  getOTP,
  deleteOTP,
  verifyOTP,
  canResendOTP,
  setResendCooldown,
  incrementAttempts,
  isBlocked,
};




