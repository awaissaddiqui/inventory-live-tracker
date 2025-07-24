import helmet from 'helmet';
import cors from 'cors';
import { ResponseUtil } from '../utils/index.js';

/**
 * CORS configuration
 */
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            // Add your production domains here
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Total-Pages'],
    optionsSuccessStatus: 200
};

/**
 * CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Helmet security middleware
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

/**
 * Request sanitization middleware
 */
export const sanitizeInput = (req, res, next) => {
    // Remove any potential script tags from request body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }

    next();
};

/**
 * Recursively sanitize object
 */
const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
};

/**
 * Sanitize string values
 */
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;

    // Remove script tags and other potentially dangerous HTML
    return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};

/**
 * IP whitelist middleware (for admin routes)
 */
export const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;

        // If no whitelist specified, allow all
        if (allowedIPs.length === 0) {
            return next();
        }

        // Check if client IP is in whitelist
        if (allowedIPs.includes(clientIP)) {
            return next();
        }

        return ResponseUtil.forbidden(res, 'Access denied from this IP address.');
    };
};

/**
 * Request size limiting middleware
 */
export const requestSizeLimit = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length') || '0');
        const maxSizeBytes = parseSize(maxSize);

        if (contentLength > maxSizeBytes) {
            return ResponseUtil.badRequest(res, `Request too large. Maximum size is ${maxSize}.`);
        }

        next();
    };
};

/**
 * Parse size string to bytes
 */
const parseSize = (sizeStr) => {
    const size = parseFloat(sizeStr);
    const unit = sizeStr.replace(/[0-9.]/g, '').toLowerCase();

    switch (unit) {
        case 'kb': return size * 1024;
        case 'mb': return size * 1024 * 1024;
        case 'gb': return size * 1024 * 1024 * 1024;
        default: return size;
    }
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;

        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);

        originalEnd.apply(this, args);
    };

    next();
};

/**
 * Maintenance mode middleware
 */
export const maintenanceMode = (req, res, next) => {
    if (process.env.MAINTENANCE_MODE === 'true') {
        return ResponseUtil.error(res, 'System is under maintenance. Please try again later.', 503);
    }
    next();
};
