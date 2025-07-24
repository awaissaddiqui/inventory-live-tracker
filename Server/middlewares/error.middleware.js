import { ErrorUtil, ResponseUtil } from '../utils/index.js';
import { HTTP_STATUS, MESSAGES } from '../constant/index.js';

/**
 * Global error handling middleware
 * This should be the last middleware in the chain
 */
export const errorHandler = (error, req, res, next) => {
    // Log the error
    ErrorUtil.logError(error, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        user: req.user?.id || 'Anonymous'
    });

    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(error);
    }

    // Handle operational errors
    if (ErrorUtil.isOperationalError(error)) {
        return ResponseUtil.error(res, error.message, error.statusCode);
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return ResponseUtil.badRequest(res, 'Validation failed', error.errors);
    }

    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
            field: err.path,
            message: err.message
        }));
        return ResponseUtil.badRequest(res, 'Database validation failed', errors);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'field';
        return ResponseUtil.conflict(res, `${field} already exists`);
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return ResponseUtil.badRequest(res, 'Referenced record does not exist');
    }

    if (error.name === 'SequelizeDatabaseError') {
        return ResponseUtil.error(res, 'Database operation failed');
    }

    if (error.name === 'JsonWebTokenError') {
        return ResponseUtil.unauthorized(res, 'Invalid authentication token');
    }

    if (error.name === 'TokenExpiredError') {
        return ResponseUtil.unauthorized(res, 'Authentication token has expired');
    }

    // Handle syntax errors
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return ResponseUtil.badRequest(res, 'Invalid JSON format');
    }

    // Default server error
    return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

/**
 * 404 Not Found middleware
 * This should be placed before the error handler but after all route definitions
 */
export const notFoundHandler = (req, res, next) => {
    const message = `Route ${req.method} ${req.originalUrl} not found`;
    return ResponseUtil.notFound(res, message);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch and forward errors
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
