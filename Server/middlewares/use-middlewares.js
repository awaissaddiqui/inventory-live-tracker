import express from 'express';
import { corsMiddleware, securityHeaders, sanitizeInput, requestLogger, maintenanceMode } from './security.middleware.js';
import { generalRateLimit } from './rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './error.middleware.js';

/**
 * Configure and apply all middlewares
 * @param {Express} app - Express application instance
 */
export const useMiddlewares = (app) => {
    // Security middlewares (should be first)
    app.use(securityHeaders);
    app.use(corsMiddleware);
    app.use(maintenanceMode);

    // Request logging
    if (process.env.NODE_ENV !== 'test') {
        app.use(requestLogger);
    }

    // Body parsing middlewares
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Input sanitization
    app.use(sanitizeInput);

    // Rate limiting
    app.use('/api/', generalRateLimit);

    // Trust proxy (for accurate IP addresses behind reverse proxy)
    app.set('trust proxy', 1);

    // Health check endpoint (before other middlewares)
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    });
};

/**
 * Apply error handling middlewares (should be last)
 * @param {Express} app - Express application instance
 */
export const useErrorMiddlewares = (app) => {
    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);
};

export default useMiddlewares;
