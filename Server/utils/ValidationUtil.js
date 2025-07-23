import { VALIDATION_PATTERNS, DATABASE_CONSTRAINTS, PRODUCT_UNITS, TRANSACTION_TYPES } from '../constant/index.js';

/**
 * Validation utility functions
 */
class ValidationUtil {

    /**
     * Validate required fields
     * @param {Object} data - Data to validate
     * @param {Array} requiredFields - Array of required field names
     * @returns {Object} Validation result
     */
    static validateRequired(data, requiredFields) {
        const errors = [];

        requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                errors.push(`${field} is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate SKU format
     * @param {string} sku - SKU to validate
     * @returns {Object} Validation result
     */
    static validateSKU(sku) {
        const errors = [];

        if (!sku) {
            errors.push('SKU is required');
        } else {
            const trimmedSKU = sku.trim();

            if (trimmedSKU.length < DATABASE_CONSTRAINTS.SKU.MIN_LENGTH) {
                errors.push(`SKU must be at least ${DATABASE_CONSTRAINTS.SKU.MIN_LENGTH} characters long`);
            }

            if (trimmedSKU.length > DATABASE_CONSTRAINTS.SKU.MAX_LENGTH) {
                errors.push(`SKU must not exceed ${DATABASE_CONSTRAINTS.SKU.MAX_LENGTH} characters`);
            }

            if (!VALIDATION_PATTERNS.SKU.test(trimmedSKU)) {
                errors.push('SKU can only contain uppercase letters, numbers, hyphens, and underscores');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate barcode format
     * @param {string} barcode - Barcode to validate
     * @returns {Object} Validation result
     */
    static validateBarcode(barcode) {
        const errors = [];

        if (barcode) {
            const trimmedBarcode = barcode.trim();

            if (trimmedBarcode.length > DATABASE_CONSTRAINTS.BARCODE.MAX_LENGTH) {
                errors.push(`Barcode must not exceed ${DATABASE_CONSTRAINTS.BARCODE.MAX_LENGTH} characters`);
            }

            if (!VALIDATION_PATTERNS.BARCODE.test(trimmedBarcode)) {
                errors.push('Barcode can only contain numbers');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {Object} Validation result
     */
    static validateEmail(email) {
        const errors = [];

        if (email && !VALIDATION_PATTERNS.EMAIL.test(email.trim())) {
            errors.push('Invalid email format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate numeric values
     * @param {*} value - Value to validate
     * @param {string} fieldName - Field name for error messages
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateNumeric(value, fieldName, options = {}) {
        const { min = null, max = null, required = false, integer = false } = options;
        const errors = [];

        if (required && (value === null || value === undefined || value === '')) {
            errors.push(`${fieldName} is required`);
            return { isValid: false, errors };
        }

        if (value !== null && value !== undefined && value !== '') {
            const numValue = Number(value);

            if (isNaN(numValue)) {
                errors.push(`${fieldName} must be a valid number`);
            } else {
                if (integer && !Number.isInteger(numValue)) {
                    errors.push(`${fieldName} must be an integer`);
                }

                if (min !== null && numValue < min) {
                    errors.push(`${fieldName} must be at least ${min}`);
                }

                if (max !== null && numValue > max) {
                    errors.push(`${fieldName} must not exceed ${max}`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate string length
     * @param {string} value - String to validate
     * @param {string} fieldName - Field name for error messages
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateStringLength(value, fieldName, options = {}) {
        const { min = null, max = null, required = false } = options;
        const errors = [];

        if (required && (!value || value.trim() === '')) {
            errors.push(`${fieldName} is required`);
            return { isValid: false, errors };
        }

        if (value) {
            const trimmedValue = value.trim();

            if (min !== null && trimmedValue.length < min) {
                errors.push(`${fieldName} must be at least ${min} characters long`);
            }

            if (max !== null && trimmedValue.length > max) {
                errors.push(`${fieldName} must not exceed ${max} characters`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate product unit
     * @param {string} unit - Unit to validate
     * @returns {Object} Validation result
     */
    static validateProductUnit(unit) {
        const errors = [];
        const validUnits = Object.values(PRODUCT_UNITS);

        if (unit && !validUnits.includes(unit)) {
            errors.push(`Unit must be one of: ${validUnits.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate transaction type
     * @param {string} transactionType - Transaction type to validate
     * @returns {Object} Validation result
     */
    static validateTransactionType(transactionType) {
        const errors = [];
        const validTypes = Object.values(TRANSACTION_TYPES);

        if (!transactionType) {
            errors.push('Transaction type is required');
        } else if (!validTypes.includes(transactionType)) {
            errors.push(`Transaction type must be one of: ${validTypes.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate date format
     * @param {string} date - Date string to validate
     * @param {string} fieldName - Field name for error messages
     * @returns {Object} Validation result
     */
    static validateDate(date, fieldName) {
        const errors = [];

        if (date) {
            const dateObj = new Date(date);

            if (isNaN(dateObj.getTime())) {
                errors.push(`${fieldName} must be a valid date`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate pagination parameters
     * @param {Object} params - Pagination parameters
     * @returns {Object} Validation result and sanitized values
     */
    static validatePagination(params) {
        const { page = 1, limit = 10 } = params;
        const errors = [];

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (isNaN(pageNum) || pageNum < 1) {
            errors.push('Page must be a positive integer');
        }

        if (isNaN(limitNum) || limitNum < 1) {
            errors.push('Limit must be a positive integer');
        } else if (limitNum > 100) {
            errors.push('Limit cannot exceed 100');
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized: {
                page: Math.max(1, pageNum || 1),
                limit: Math.min(100, Math.max(1, limitNum || 10))
            }
        };
    }

    /**
     * Combine multiple validation results
     * @param {Array} validationResults - Array of validation results
     * @returns {Object} Combined validation result
     */
    static combineValidations(validationResults) {
        const allErrors = [];

        validationResults.forEach(result => {
            if (result.errors && result.errors.length > 0) {
                allErrors.push(...result.errors);
            }
        });

        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        };
    }

    /**
     * Sanitize string input
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/\s+/g, ' ');
    }

    /**
     * Sanitize numeric input
     * @param {*} input - Input to sanitize
     * @param {boolean} integer - Whether to return integer
     * @returns {number|null} Sanitized number
     */
    static sanitizeNumber(input, integer = false) {
        if (input === null || input === undefined || input === '') return null;

        const num = Number(input);
        if (isNaN(num)) return null;

        return integer ? Math.floor(num) : num;
    }
}

export default ValidationUtil;
