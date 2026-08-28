import rateLimit from 'express-rate-limit';

// Tighter limit on auth endpoints — the main brute-force / credential-stuffing target.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Looser general limit so normal browsing/API use is never affected, just abuse/scraping.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});
