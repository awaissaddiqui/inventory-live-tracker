import { ValidationUtil } from '../utils/index.js';

/**
 * ID parameter validation
 */
export const validateId = (id, fieldName = 'ID') => {
    const errors = [];

    if (!id) {
        errors.push(`${fieldName} is required`);
    } else if (!ValidationUtil.isValidId(id)) {
        errors.push(`Invalid ${fieldName} format`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Pagination parameters validation
 */
export const validatePagination = (paginationData) => {
    const errors = [];
    const { page = 1, limit = 10, sort_by, sort_order = 'desc' } = paginationData;

    // Page validation
    if (page !== undefined) {
        if (typeof page !== 'number' && isNaN(Number(page))) {
            errors.push('Page must be a number');
        } else if (Number(page) < 1) {
            errors.push('Page must be at least 1');
        } else if (Number(page) > 10000) {
            errors.push('Page cannot exceed 10,000');
        }
    }

    // Limit validation
    if (limit !== undefined) {
        if (typeof limit !== 'number' && isNaN(Number(limit))) {
            errors.push('Limit must be a number');
        } else if (Number(limit) < 1) {
            errors.push('Limit must be at least 1');
        } else if (Number(limit) > 100) {
            errors.push('Limit cannot exceed 100');
        }
    }

    // Sort by validation (optional)
    if (sort_by !== undefined) {
        if (typeof sort_by !== 'string' || sort_by.trim().length === 0) {
            errors.push('Sort by must be a non-empty string');
        } else if (sort_by.length > 50) {
            errors.push('Sort by field name cannot exceed 50 characters');
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sort_by)) {
            errors.push('Sort by field name can only contain letters, numbers, and underscores');
        }
    }

    // Sort order validation
    if (sort_order !== undefined) {
        if (!['asc', 'desc'].includes(sort_order.toLowerCase())) {
            errors.push('Sort order must be either "asc" or "desc"');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized: {
            page: Number(page) || 1,
            limit: Math.min(Number(limit) || 10, 100),
            sort_by: sort_by?.trim(),
            sort_order: sort_order?.toLowerCase() || 'desc'
        }
    };
};

/**
 * Search query validation
 */
export const validateSearchQuery = (searchData) => {
    const errors = [];
    const { search, search_fields } = searchData;

    // Search term validation
    if (search !== undefined) {
        if (typeof search !== 'string') {
            errors.push('Search term must be a string');
        } else if (search.trim().length === 0) {
            errors.push('Search term cannot be empty');
        } else if (search.length > 100) {
            errors.push('Search term cannot exceed 100 characters');
        } else if (search.length < 2) {
            errors.push('Search term must be at least 2 characters long');
        }
    }

    // Search fields validation (optional)
    if (search_fields !== undefined) {
        if (!Array.isArray(search_fields)) {
            errors.push('Search fields must be an array');
        } else if (search_fields.length === 0) {
            errors.push('Search fields array cannot be empty');
        } else {
            search_fields.forEach((field, index) => {
                if (typeof field !== 'string' || field.trim().length === 0) {
                    errors.push(`Search field at index ${index} must be a non-empty string`);
                } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
                    errors.push(`Search field at index ${index} can only contain letters, numbers, and underscores`);
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Date range validation
 */
export const validateDateRange = (dateRangeData) => {
    const errors = [];
    const { start_date, end_date } = dateRangeData;

    // Start date validation
    if (start_date !== undefined) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
            errors.push('Invalid start date format');
        }
    }

    // End date validation
    if (end_date !== undefined) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
            errors.push('Invalid end date format');
        }
    }

    // Date range relationship validation
    if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            if (startDate > endDate) {
                errors.push('Start date cannot be later than end date');
            }

            // Check for reasonable date range (not more than 5 years)
            const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (daysDifference > 1825) { // 5 years
                errors.push('Date range cannot exceed 5 years');
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Status validation
 */
export const validateStatus = (status, allowedStatuses = ['active', 'inactive']) => {
    const errors = [];

    if (status !== undefined) {
        if (typeof status !== 'string') {
            errors.push('Status must be a string');
        } else if (!allowedStatuses.includes(status)) {
            errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Bulk operation validation
 */
export const validateBulkOperation = (operationData, maxItems = 100) => {
    const errors = [];
    const { items, operation } = operationData;

    // Items validation
    if (!items) {
        errors.push('Items array is required');
    } else if (!Array.isArray(items)) {
        errors.push('Items must be an array');
    } else if (items.length === 0) {
        errors.push('Items array cannot be empty');
    } else if (items.length > maxItems) {
        errors.push(`Cannot process more than ${maxItems} items at once`);
    }

    // Operation validation (optional)
    if (operation !== undefined) {
        const allowedOperations = ['create', 'update', 'delete', 'import'];
        if (!allowedOperations.includes(operation)) {
            errors.push(`Operation must be one of: ${allowedOperations.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * File upload validation
 */
export const validateFileUpload = (fileData) => {
    const errors = [];
    const {
        filename,
        mimetype,
        size,
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    } = fileData;

    // Filename validation
    if (!filename) {
        errors.push('Filename is required');
    } else if (typeof filename !== 'string') {
        errors.push('Filename must be a string');
    } else if (filename.length > 255) {
        errors.push('Filename cannot exceed 255 characters');
    } else if (!/^[a-zA-Z0-9\-_. ]+\.[a-zA-Z0-9]+$/.test(filename)) {
        errors.push('Filename contains invalid characters');
    }

    // MIME type validation
    if (!mimetype) {
        errors.push('File type is required');
    } else if (!allowedTypes.includes(mimetype)) {
        errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
    }

    // Size validation
    if (size === undefined || size === null) {
        errors.push('File size is required');
    } else if (typeof size !== 'number' || size < 0) {
        errors.push('File size must be a positive number');
    } else if (size > maxSize) {
        errors.push(`File size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB`);
    } else if (size === 0) {
        errors.push('File cannot be empty');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Email validation
 */
export const validateEmailFormat = (email) => {
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    } else if (typeof email !== 'string') {
        errors.push('Email must be a string');
    } else if (!ValidationUtil.isValidEmail(email)) {
        errors.push('Invalid email format');
    } else if (email.length > 100) {
        errors.push('Email cannot exceed 100 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * URL validation
 */
export const validateUrl = (url, fieldName = 'URL') => {
    const errors = [];

    if (url !== undefined && url !== null && url !== '') {
        if (typeof url !== 'string') {
            errors.push(`${fieldName} must be a string`);
        } else {
            try {
                new URL(url);
                if (url.length > 2000) {
                    errors.push(`${fieldName} cannot exceed 2000 characters`);
                }
            } catch {
                errors.push(`Invalid ${fieldName} format`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
