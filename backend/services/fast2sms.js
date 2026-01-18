const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Send OTP via Fast2SMS
 */
exports.sendOTP = async (phone, otp) => {
  if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === 'your_fast2sms_api_key_here') {
    throw new Error('Fast2SMS API key not configured');
  }

  const message = `Your UrbanPulse OTP is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  try {
    const response = await axios.post(
      FAST2SMS_API_URL,
      {
        message,
        language: 'english',
        route: 'q',
        numbers: phone.replace(/\+/g, ''), // Remove + from phone number
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.return === true) {
      console.log(`✅ SMS sent successfully to ${phone}`);
      return true;
    } else {
      throw new Error(response.data.message || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('Fast2SMS error:', error.response?.data || error.message);
    throw error;
  }
};
