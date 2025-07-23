import { HTTP_STATUS, MESSAGES } from '../constant/index.js';

/**
 * Standardized API response utility
 */
class ResponseUtil {

    /**
     * Send success response
     * @param {Object} res - Express response object
     * @param {*} data - Response data
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code
     * @param {Object} meta - Additional metadata
     */
    static success(res, data = null, message = MESSAGES.SUCCESS.FETCHED, statusCode = HTTP_STATUS.OK, meta = {}) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            meta,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {*} errors - Detailed error information
     */
    static error(res, message = MESSAGES.ERROR.SERVER_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send created response
     * @param {Object} res - Express response object
     * @param {*} data - Created resource data
     * @param {string} message - Success message
     */
    static created(res, data, message = MESSAGES.SUCCESS.CREATED) {
        return this.success(res, data, message, HTTP_STATUS.CREATED);
    }

    /**
     * Send updated response
     * @param {Object} res - Express response object
     * @param {*} data - Updated resource data
     * @param {string} message - Success message
     */
    static updated(res, data, message = MESSAGES.SUCCESS.UPDATED) {
        return this.success(res, data, message, HTTP_STATUS.OK);
    }

    /**
     * Send deleted response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     */
    static deleted(res, message = MESSAGES.SUCCESS.DELETED) {
        return this.success(res, null, message, HTTP_STATUS.OK);
    }

    /**
     * Send not found response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static notFound(res, message = MESSAGES.ERROR.NOT_FOUND) {
        return this.error(res, message, HTTP_STATUS.NOT_FOUND);
    }

    /**
     * Send bad request response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {*} errors - Validation errors
     */
    static badRequest(res, message = MESSAGES.ERROR.INVALID_DATA, errors = null) {
        return this.error(res, message, HTTP_STATUS.BAD_REQUEST, errors);
    }

    /**
     * Send conflict response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static conflict(res, message = MESSAGES.ERROR.DUPLICATE_ENTRY) {
        return this.error(res, message, HTTP_STATUS.CONFLICT);
    }

    /**
     * Send unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static unauthorized(res, message = MESSAGES.ERROR.UNAUTHORIZED) {
        return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
    }

    /**
     * Send forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static forbidden(res, message = MESSAGES.ERROR.FORBIDDEN) {
        return this.error(res, message, HTTP_STATUS.FORBIDDEN);
    }

    /**
     * Send paginated response
     * @param {Object} res - Express response object
     * @param {*} data - Response data
     * @param {Object} pagination - Pagination info
     * @param {string} message - Success message
     */
    static paginated(res, data, pagination, message = MESSAGES.SUCCESS.FETCHED) {
        return this.success(res, data, message, HTTP_STATUS.OK, { pagination });
    }
}

export default ResponseUtil;
