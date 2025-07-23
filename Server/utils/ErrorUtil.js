import { HTTP_STATUS } from '../constant/index.js';

/**
 * Custom error classes for better error handling
 */

/**
 * Base custom error class
 */
class AppError extends Error {
    constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error class
 */
class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, HTTP_STATUS.BAD_REQUEST);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Not found error class
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, HTTP_STATUS.NOT_FOUND);
        this.name = 'NotFoundError';
    }
}

/**
 * Conflict error class
 */
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, HTTP_STATUS.CONFLICT);
        this.name = 'ConflictError';
    }
}

/**
 * Unauthorized error class
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, HTTP_STATUS.UNAUTHORIZED);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Forbidden error class
 */
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, HTTP_STATUS.FORBIDDEN);
        this.name = 'ForbiddenError';
    }
}

/**
 * Database error class
 */
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        this.name = 'DatabaseError';
    }
}

/**
 * Business logic error class
 */
class BusinessLogicError extends AppError {
    constructor(message = 'Business rule violation') {
        super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        this.name = 'BusinessLogicError';
    }
}

/**
 * Error utility functions
 */
class ErrorUtil {

    /**
     * Handle database errors and convert to appropriate AppError
     * @param {Error} error - Database error
     * @returns {AppError} Converted error
     */
    static handleDatabaseError(error) {
        // Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));

            return new ValidationError('Validation failed', validationErrors);
        }

        // Sequelize unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0]?.path || 'field';
            return new ConflictError(`${field} already exists`);
        }

        // Sequelize foreign key constraint errors
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return new ValidationError('Invalid reference to related resource');
        }

        // Sequelize connection errors
        if (error.name === 'SequelizeConnectionError') {
            return new DatabaseError('Database connection failed');
        }

        // Generic database error
        return new DatabaseError(error.message || 'Database operation failed');
    }

    /**
     * Format error for logging
     * @param {Error} error - Error to format
     * @param {Object} context - Additional context
     * @returns {Object} Formatted error
     */
    static formatErrorForLogging(error, context = {}) {
        return {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            stack: error.stack,
            timestamp: error.timestamp || new Date().toISOString(),
            context,
            isOperational: error.isOperational || false
        };
    }

    /**
     * Format error for API response
     * @param {Error} error - Error to format
     * @returns {Object} Formatted error response
     */
    static formatErrorForResponse(error) {
        const response = {
            name: error.name,
            message: error.message,
            timestamp: error.timestamp || new Date().toISOString()
        };

        // Add validation errors if present
        if (error.errors) {
            response.errors = error.errors;
        }

        // Don't expose stack trace in production
        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
        }

        return response;
    }

    /**
     * Check if error is operational (expected business error)
     * @param {Error} error - Error to check
     * @returns {boolean} Is operational error
     */
    static isOperationalError(error) {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }

    /**
     * Create error from unknown type
     * @param {*} error - Unknown error
     * @returns {AppError} Converted error
     */
    static createFromUnknown(error) {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            return new AppError(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        if (typeof error === 'string') {
            return new AppError(error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return new AppError('Unknown error occurred', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    /**
     * Wrap async function to catch errors
     * @param {Function} fn - Async function to wrap
     * @returns {Function} Wrapped function
     */
    static catchAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    /**
     * Create validation error from validation results
     * @param {Array} validationResults - Array of validation results
     * @returns {ValidationError|null} Validation error or null if valid
     */
    static createValidationError(validationResults) {
        const allErrors = [];

        validationResults.forEach(result => {
            if (result.errors && result.errors.length > 0) {
                allErrors.push(...result.errors);
            }
        });

        if (allErrors.length > 0) {
            return new ValidationError('Validation failed', allErrors);
        }

        return null;
    }

    /**
     * Log error with context
     * @param {Error} error - Error to log
     * @param {Object} context - Additional context
     */
    static logError(error, context = {}) {
        const formattedError = this.formatErrorForLogging(error, context);

        if (this.isOperationalError(error)) {
            console.warn('Operational Error:', JSON.stringify(formattedError, null, 2));
        } else {
            console.error('System Error:', JSON.stringify(formattedError, null, 2));
        }
    }
}

export {
    AppError,
    ValidationError,
    NotFoundError,
    ConflictError,
    UnauthorizedError,
    ForbiddenError,
    DatabaseError,
    BusinessLogicError,
    ErrorUtil
};

export default ErrorUtil;
