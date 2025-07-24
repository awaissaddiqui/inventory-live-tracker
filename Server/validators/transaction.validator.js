import { ValidationUtil } from '../utils/index.js';
import { TRANSACTION_TYPES } from '../constant/index.js';

/**
 * Transaction creation validation
 */
export const validateTransactionCreation = (transactionData) => {
    const errors = [];
    const {
        product_id,
        type,
        quantity,
        previous_quantity,
        new_quantity,
        notes
    } = transactionData;

    // Product ID validation
    if (!product_id) {
        errors.push('Product ID is required');
    } else if (!ValidationUtil.isValidId(product_id)) {
        errors.push('Invalid product ID');
    }

    // Transaction type validation
    if (!type) {
        errors.push('Transaction type is required');
    } else if (!Object.values(TRANSACTION_TYPES).includes(type)) {
        errors.push(`Transaction type must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`);
    }

    // Quantity validation
    if (quantity === undefined || quantity === null) {
        errors.push('Quantity is required');
    } else if (typeof quantity !== 'number' && isNaN(Number(quantity))) {
        errors.push('Quantity must be a number');
    } else if (!Number.isInteger(Number(quantity))) {
        errors.push('Quantity must be a whole number');
    } else if (Math.abs(Number(quantity)) > 999999) {
        errors.push('Quantity cannot exceed 999,999');
    }

    // Type-specific quantity validation
    if (type === TRANSACTION_TYPES.IN && Number(quantity) <= 0) {
        errors.push('Quantity must be positive for stock in transactions');
    } else if (type === TRANSACTION_TYPES.OUT && Number(quantity) <= 0) {
        errors.push('Quantity must be positive for stock out transactions');
    }

    // Previous quantity validation (optional but recommended)
    if (previous_quantity !== undefined && previous_quantity !== null) {
        if (typeof previous_quantity !== 'number' && isNaN(Number(previous_quantity))) {
            errors.push('Previous quantity must be a number');
        } else if (Number(previous_quantity) < 0) {
            errors.push('Previous quantity cannot be negative');
        } else if (!Number.isInteger(Number(previous_quantity))) {
            errors.push('Previous quantity must be a whole number');
        }
    }

    // New quantity validation (optional but recommended)
    if (new_quantity !== undefined && new_quantity !== null) {
        if (typeof new_quantity !== 'number' && isNaN(Number(new_quantity))) {
            errors.push('New quantity must be a number');
        } else if (Number(new_quantity) < 0) {
            errors.push('New quantity cannot be negative');
        } else if (!Number.isInteger(Number(new_quantity))) {
            errors.push('New quantity must be a whole number');
        }
    }

    // Validate quantity relationship (if both previous and new quantities are provided)
    if (previous_quantity !== undefined && new_quantity !== undefined && quantity !== undefined) {
        const expectedNewQuantity = type === TRANSACTION_TYPES.IN
            ? Number(previous_quantity) + Number(quantity)
            : type === TRANSACTION_TYPES.OUT
                ? Number(previous_quantity) - Number(quantity)
                : Number(new_quantity); // For adjustments

        if (type !== TRANSACTION_TYPES.ADJUSTMENT && Number(new_quantity) !== expectedNewQuantity) {
            errors.push('Quantity calculation does not match previous and new quantities');
        }
    }

    // Notes validation (optional)
    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string') {
            errors.push('Notes must be a string');
        } else if (notes.length > 500) {
            errors.push('Notes cannot exceed 500 characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Transaction filter validation
 */
export const validateTransactionFilters = (filters) => {
    const errors = [];
    const {
        product_id,
        type,
        start_date,
        end_date,
        min_quantity,
        max_quantity,
        page,
        limit,
        sort_by,
        sort_order
    } = filters;

    // Product ID validation (optional)
    if (product_id !== undefined && !ValidationUtil.isValidId(product_id)) {
        errors.push('Invalid product ID in filter');
    }

    // Transaction type validation (optional)
    if (type !== undefined && !Object.values(TRANSACTION_TYPES).includes(type)) {
        errors.push(`Invalid transaction type. Must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`);
    }

    // Date range validation (optional)
    if (start_date !== undefined) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
            errors.push('Invalid start date format');
        }
    }

    if (end_date !== undefined) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
            errors.push('Invalid end date format');
        }
    }

    // Validate date range relationship
    if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (startDate > endDate) {
            errors.push('Start date cannot be later than end date');
        }
    }

    // Min quantity validation (optional)
    if (min_quantity !== undefined) {
        if (typeof min_quantity !== 'number' && isNaN(Number(min_quantity))) {
            errors.push('Minimum quantity must be a number');
        }
    }

    // Max quantity validation (optional)
    if (max_quantity !== undefined) {
        if (typeof max_quantity !== 'number' && isNaN(Number(max_quantity))) {
            errors.push('Maximum quantity must be a number');
        }
    }

    // Check min/max relationship
    if (min_quantity !== undefined && max_quantity !== undefined) {
        if (Number(min_quantity) > Number(max_quantity)) {
            errors.push('Minimum quantity cannot be greater than maximum quantity');
        }
    }

    // Pagination validation (optional)
    if (page !== undefined) {
        if (typeof page !== 'number' && isNaN(Number(page))) {
            errors.push('Page must be a number');
        } else if (Number(page) < 1) {
            errors.push('Page must be at least 1');
        }
    }

    if (limit !== undefined) {
        if (typeof limit !== 'number' && isNaN(Number(limit))) {
            errors.push('Limit must be a number');
        } else if (Number(limit) < 1) {
            errors.push('Limit must be at least 1');
        } else if (Number(limit) > 100) {
            errors.push('Limit cannot exceed 100');
        }
    }

    // Sort validation (optional)
    if (sort_by !== undefined) {
        const validSortFields = ['id', 'created_at', 'type', 'quantity', 'product_id'];
        if (!validSortFields.includes(sort_by)) {
            errors.push(`Sort field must be one of: ${validSortFields.join(', ')}`);
        }
    }

    if (sort_order !== undefined) {
        if (!['asc', 'desc'].includes(sort_order.toLowerCase())) {
            errors.push('Sort order must be either "asc" or "desc"');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Transaction statistics filter validation
 */
export const validateTransactionStatisticsFilters = (filters) => {
    const errors = [];
    const { start_date, end_date, product_id, category_id } = filters;

    // Date validation (optional)
    if (start_date !== undefined) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
            errors.push('Invalid start date format');
        }
    }

    if (end_date !== undefined) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
            errors.push('Invalid end date format');
        }
    }

    // Validate date range relationship
    if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (startDate > endDate) {
            errors.push('Start date cannot be later than end date');
        }

        // Check if date range is too large (more than 1 year)
        const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (daysDifference > 365) {
            errors.push('Date range cannot exceed 365 days');
        }
    }

    // Product ID validation (optional)
    if (product_id !== undefined && !ValidationUtil.isValidId(product_id)) {
        errors.push('Invalid product ID');
    }

    // Category ID validation (optional)
    if (category_id !== undefined && !ValidationUtil.isValidId(category_id)) {
        errors.push('Invalid category ID');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Stock movement report validation
 */
export const validateStockMovementReport = (reportData) => {
    const errors = [];
    const {
        product_id,
        start_date,
        end_date,
        type,
        limit = 50
    } = reportData;

    // Product ID validation (optional)
    if (product_id !== undefined && !ValidationUtil.isValidId(product_id)) {
        errors.push('Invalid product ID');
    }

    // Date range validation
    if (start_date !== undefined) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
            errors.push('Invalid start date format');
        }
    }

    if (end_date !== undefined) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
            errors.push('Invalid end date format');
        }
    }

    if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (startDate > endDate) {
            errors.push('Start date cannot be later than end date');
        }
    }

    // Transaction type validation (optional)
    if (type !== undefined && !Object.values(TRANSACTION_TYPES).includes(type)) {
        errors.push(`Invalid transaction type. Must be one of: ${Object.values(TRANSACTION_TYPES).join(', ')}`);
    }

    // Limit validation
    if (limit !== undefined) {
        if (typeof limit !== 'number' && isNaN(Number(limit))) {
            errors.push('Limit must be a number');
        } else if (Number(limit) < 1) {
            errors.push('Limit must be at least 1');
        } else if (Number(limit) > 1000) {
            errors.push('Limit cannot exceed 1000');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Daily summary validation
 */
export const validateDailySummary = (summaryData) => {
    const errors = [];
    const { date } = summaryData;

    // Date validation (optional - defaults to today)
    if (date !== undefined) {
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            errors.push('Invalid date format');
        } else {
            // Check if date is not in the future
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            if (targetDate > today) {
                errors.push('Date cannot be in the future');
            }

            // Check if date is not too far in the past (1 year)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (targetDate < oneYearAgo) {
                errors.push('Date cannot be more than 1 year in the past');
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
