const rateLimit = require('express-rate-limit');

// Rate limiter for OTP requests
// Max 5 requests per 15 minutes per IP
exports.rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
  message: {
    error: 'Too many OTP requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log('⚠️  Rate limit exceeded for IP:', req.ip);
    res.status(429).json({
      error: 'Too many OTP requests. Please try again later.',
    });
  },
});

