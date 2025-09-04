const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit to 1000 requests per windowMs for development
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED',
    resetTime: new Date(Date.now() + 15 * 60 * 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased limit to 50 login attempts per windowMs for development
  message: {
    error: 'Too many login attempts',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    resetTime: new Date(Date.now() + 15 * 60 * 1000)
  },
  skipSuccessfulRequests: true,
});

// More generous rate limiting for file uploads
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Allow 10 uploads per minute
  message: {
    error: 'Too many file uploads',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    resetTime: new Date(Date.now() + 60 * 1000)
  },
});

module.exports = {
  rateLimiter,
  authRateLimiter,
  uploadRateLimiter
};
