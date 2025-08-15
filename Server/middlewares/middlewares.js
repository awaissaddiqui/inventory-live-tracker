import express from 'express';

/**
 * Simple middleware setup - no complex dependencies
 * @param {Express} app - Express application instance
 */
export const useSimpleMiddlewares = (app) => {
    // Basic middleware only
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Simple request logger
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    });
};

export default useSimpleMiddlewares;
