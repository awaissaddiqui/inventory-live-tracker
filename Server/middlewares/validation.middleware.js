import { ValidationUtil, ResponseUtil, ValidationError } from '../utils/index.js';
import { USER_ROLES, USER_STATUS, PRODUCT_UNITS } from '../constant/index.js';

/**
 * Generic request validation middleware
 * @param {Object} schema - Validation schema
 * @param {string} source - Source of data ('body', 'params', 'query')
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const errors = [];

        // Validate each field in schema
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // Check required fields
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Skip validation if field is not provided and not required
            if (value === undefined || value === null || value === '') {
                continue;
            }

            // Type validation
            if (rules.type) {
                if (rules.type === 'string' && typeof value !== 'string') {
                    errors.push(`${field} must be a string`);
                } else if (rules.type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
                    errors.push(`${field} must be a number`);
                } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
                    errors.push(`${field} must be a boolean`);
                } else if (rules.type === 'array' && !Array.isArray(value)) {
                    errors.push(`${field} must be an array`);
                }
            }

            // Length validation for strings
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters long`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
            }

            // Numeric validation
            if (rules.min && Number(value) < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }
            if (rules.max && Number(value) > rules.max) {
                errors.push(`${field} cannot exceed ${rules.max}`);
            }

            // Email validation
            if (rules.email && !ValidationUtil.isValidEmail(value)) {
                errors.push(`${field} must be a valid email address`);
            }

            // Enum validation
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }

            // Custom validation function
            if (rules.custom) {
                const customResult = rules.custom(value);
                if (customResult !== true) {
                    errors.push(customResult || `${field} is invalid`);
                }
            }
        }

        if (errors.length > 0) {
            return ResponseUtil.badRequest(res, 'Validation failed', errors);
        }

        next();
    };
};

/**
 * User validation schemas
 */
export const userValidation = {
    create: validate({
        username: {
            required: true,
            type: 'string',
            minLength: 3,
            maxLength: 50
        },
        email: {
            required: true,
            type: 'string',
            email: true,
            maxLength: 100
        },
        password: {
            required: true,
            type: 'string',
            custom: (value) => ValidationUtil.isValidPassword(value) || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
        },
        first_name: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 50
        },
        last_name: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 50
        },
        role: {
            type: 'string',
            enum: USER_ROLES
        },
        status: {
            type: 'string',
            enum: USER_STATUS
        }
    }),

    update: validate({
        username: {
            type: 'string',
            minLength: 3,
            maxLength: 50
        },
        email: {
            type: 'string',
            email: true,
            maxLength: 100
        },
        first_name: {
            type: 'string',
            minLength: 1,
            maxLength: 50
        },
        last_name: {
            type: 'string',
            minLength: 1,
            maxLength: 50
        },
        role: {
            type: 'string',
            enum: USER_ROLES
        },
        status: {
            type: 'string',
            enum: USER_STATUS
        }
    }),

    login: validate({
        login: {
            required: true,
            type: 'string',
            minLength: 3
        },
        password: {
            required: true,
            type: 'string',
            minLength: 1
        }
    }),

    changePassword: validate({
        currentPassword: {
            required: true,
            type: 'string'
        },
        newPassword: {
            required: true,
            type: 'string',
            custom: (value) => ValidationUtil.isValidPassword(value) || 'New password must be at least 8 characters with uppercase, lowercase, number, and special character'
        }
    })
};

/**
 * Product validation schemas
 */
export const productValidation = {
    create: validate({
        name: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 255
        },
        sku: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 100
        },
        category_id: {
            required: true,
            type: 'number',
            min: 1
        },
        unit: {
            required: true,
            type: 'string',
            enum: Object.values(PRODUCT_UNITS)
        },
        cost_price: {
            type: 'number',
            min: 0
        },
        selling_price: {
            type: 'number',
            min: 0
        },
        reorder_level: {
            type: 'number',
            min: 0
        }
    }),

    update: validate({
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 255
        },
        sku: {
            type: 'string',
            minLength: 1,
            maxLength: 100
        },
        category_id: {
            type: 'number',
            min: 1
        },
        unit: {
            type: 'string',
            enum: Object.values(PRODUCT_UNITS)
        },
        cost_price: {
            type: 'number',
            min: 0
        },
        selling_price: {
            type: 'number',
            min: 0
        },
        reorder_level: {
            type: 'number',
            min: 0
        }
    })
};

/**
 * Category validation schemas
 */
export const categoryValidation = {
    create: validate({
        name: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 100
        },
        description: {
            type: 'string',
            maxLength: 500
        }
    }),

    update: validate({
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 100
        },
        description: {
            type: 'string',
            maxLength: 500
        }
    })
};

/**
 * Inventory validation schemas
 */
export const inventoryValidation = {
    create: validate({
        product_id: {
            required: true,
            type: 'number',
            min: 1
        },
        quantity: {
            required: true,
            type: 'number',
            min: 0
        }
    }),

    update: validate({
        quantity: {
            type: 'number',
            min: 0
        }
    }),

    stockOperation: validate({
        quantity: {
            required: true,
            type: 'number',
            min: 1
        },
        notes: {
            type: 'string',
            maxLength: 500
        }
    }),

    adjustment: validate({
        newQuantity: {
            required: true,
            type: 'number',
            min: 0
        },
        reason: {
            required: true,
            type: 'string',
            minLength: 1,
            maxLength: 255
        },
        notes: {
            type: 'string',
            maxLength: 500
        }
    })
};

/**
 * Pagination validation
 */
export const paginationValidation = validate({
    page: {
        type: 'number',
        min: 1
    },
    limit: {
        type: 'number',
        min: 1,
        max: 100
    },
    sort_by: {
        type: 'string'
    },
    sort_order: {
        type: 'string',
        enum: ['asc', 'desc']
    }
}, 'query');

/**
 * ID parameter validation
 */
export const validateId = validate({
    id: {
        required: true,
        type: 'number',
        min: 1,
        custom: (value) => ValidationUtil.isValidId(value) || 'Invalid ID format'
    }
}, 'params');
