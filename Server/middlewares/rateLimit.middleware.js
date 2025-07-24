import rateLimit from 'express-rate-limit';
import { ResponseUtil } from '../utils/index.js';
import { RATE_LIMITS } from '../constant/index.js';

/**
 * Create custom rate limit handler
 */
const createRateLimitHandler = (message) => (req, res) => {
    return ResponseUtil.error(res, message, 429);
};

/**
 * General API rate limiting
 */
export const generalRateLimit = rateLimit({
    windowMs: RATE_LIMITS.GENERAL.windowMs,
    max: RATE_LIMITS.GENERAL.max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many requests from this IP, please try again later.')
});

/**
 * Strict rate limiting for sensitive operations
 */
export const strictRateLimit = rateLimit({
    windowMs: RATE_LIMITS.STRICT.windowMs,
    max: RATE_LIMITS.STRICT.max,
    message: 'Too many requests for this operation, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many requests for this operation, please try again later.')
});

/**
 * Authentication specific rate limiting
 */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: createRateLimitHandler('Too many authentication attempts, please try again later.')
});

/**
 * Password reset rate limiting
 */
export const passwordResetRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset requests per hour
    message: 'Too many password reset requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many password reset requests, please try again later.')
});

/**
 * Email verification rate limiting
 */
export const emailVerificationRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 verification emails per hour
    message: 'Too many email verification requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many email verification requests, please try again later.')
});

/**
 * File upload rate limiting
 */
export const uploadRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per 15 minutes
    message: 'Too many file uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many file uploads, please try again later.')
});

/**
 * Bulk operations rate limiting
 */
export const bulkOperationRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 bulk operations per hour
    message: 'Too many bulk operations, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many bulk operations, please try again later.')
});

/**
 * Report generation rate limiting
 */
export const reportRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 reports per 10 minutes
    message: 'Too many report generation requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler('Too many report generation requests, please try again later.')
});
