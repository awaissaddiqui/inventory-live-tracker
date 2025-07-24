import { ValidationUtil } from '../utils/index.js';

/**
 * Inventory creation validation
 */
export const validateInventoryCreation = (inventoryData) => {
    const errors = [];
    const { product_id, quantity, notes } = inventoryData;

    // Product ID validation
    if (!product_id) {
        errors.push('Product ID is required');
    } else if (!ValidationUtil.isValidId(product_id)) {
        errors.push('Invalid product ID');
    }

    // Quantity validation
    if (quantity === undefined || quantity === null) {
        errors.push('Initial quantity is required');
    } else if (typeof quantity !== 'number' && isNaN(Number(quantity))) {
        errors.push('Quantity must be a number');
    } else if (Number(quantity) < 0) {
        errors.push('Initial quantity cannot be negative');
    } else if (!Number.isInteger(Number(quantity))) {
        errors.push('Quantity must be a whole number');
    } else if (Number(quantity) > 999999) {
        errors.push('Quantity cannot exceed 999,999');
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
 * Inventory update validation
 */
export const validateInventoryUpdate = (updateData) => {
    const errors = [];
    const { quantity, notes } = updateData;

    // Quantity validation (optional)
    if (quantity !== undefined && quantity !== null) {
        if (typeof quantity !== 'number' && isNaN(Number(quantity))) {
            errors.push('Quantity must be a number');
        } else if (Number(quantity) < 0) {
            errors.push('Quantity cannot be negative');
        } else if (!Number.isInteger(Number(quantity))) {
            errors.push('Quantity must be a whole number');
        } else if (Number(quantity) > 999999) {
            errors.push('Quantity cannot exceed 999,999');
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
 * Stock operation validation (add/remove stock)
 */
export const validateStockOperation = (operationData) => {
    const errors = [];
    const { quantity, notes, operation_type } = operationData;

    // Quantity validation
    if (!quantity) {
        errors.push('Quantity is required');
    } else if (typeof quantity !== 'number' && isNaN(Number(quantity))) {
        errors.push('Quantity must be a number');
    } else if (Number(quantity) <= 0) {
        errors.push('Quantity must be greater than zero');
    } else if (!Number.isInteger(Number(quantity))) {
        errors.push('Quantity must be a whole number');
    } else if (Number(quantity) > 999999) {
        errors.push('Quantity cannot exceed 999,999');
    }

    // Operation type validation (optional)
    if (operation_type !== undefined) {
        if (!['add', 'remove'].includes(operation_type)) {
            errors.push('Operation type must be either "add" or "remove"');
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
 * Stock adjustment validation
 */
export const validateStockAdjustment = (adjustmentData) => {
    const errors = [];
    const { newQuantity, reason, notes } = adjustmentData;

    // New quantity validation
    if (newQuantity === undefined || newQuantity === null) {
        errors.push('New quantity is required');
    } else if (typeof newQuantity !== 'number' && isNaN(Number(newQuantity))) {
        errors.push('New quantity must be a number');
    } else if (Number(newQuantity) < 0) {
        errors.push('New quantity cannot be negative');
    } else if (!Number.isInteger(Number(newQuantity))) {
        errors.push('New quantity must be a whole number');
    } else if (Number(newQuantity) > 999999) {
        errors.push('New quantity cannot exceed 999,999');
    }

    // Reason validation
    if (!reason) {
        errors.push('Adjustment reason is required');
    } else if (typeof reason !== 'string') {
        errors.push('Reason must be a string');
    } else if (reason.trim().length === 0) {
        errors.push('Reason cannot be empty');
    } else if (reason.trim().length > 255) {
        errors.push('Reason cannot exceed 255 characters');
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
 * Bulk inventory update validation
 */
export const validateBulkInventoryUpdate = (updatesArray) => {
    const errors = [];
    const results = [];

    if (!Array.isArray(updatesArray)) {
        errors.push('Updates must be an array');
        return { isValid: false, errors };
    }

    if (updatesArray.length === 0) {
        errors.push('Updates array cannot be empty');
        return { isValid: false, errors };
    }

    if (updatesArray.length > 100) {
        errors.push('Cannot update more than 100 inventory records at once');
        return { isValid: false, errors };
    }

    // Validate each update
    updatesArray.forEach((update, index) => {
        const validation = validateInventoryUpdate(update);

        // Also validate that ID is provided for updates
        if (!update.id) {
            validation.errors.push('Inventory ID is required');
            validation.isValid = false;
        } else if (!ValidationUtil.isValidId(update.id)) {
            validation.errors.push('Invalid inventory ID');
            validation.isValid = false;
        }

        results.push({
            index,
            update,
            isValid: validation.isValid,
            errors: validation.errors
        });

        if (!validation.isValid) {
            errors.push(`Update at index ${index}: ${validation.errors.join(', ')}`);
        }
    });

    // Check for duplicate IDs within the batch
    const ids = updatesArray.map(u => u.id).filter(Boolean);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
        errors.push(`Duplicate inventory IDs found in batch: ${duplicateIds.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        results
    };
};

/**
 * Low stock threshold validation
 */
export const validateLowStockThreshold = (threshold) => {
    const errors = [];

    if (threshold !== undefined && threshold !== null) {
        if (typeof threshold !== 'number' && isNaN(Number(threshold))) {
            errors.push('Threshold must be a number');
        } else if (Number(threshold) < 0) {
            errors.push('Threshold cannot be negative');
        } else if (!Number.isInteger(Number(threshold))) {
            errors.push('Threshold must be a whole number');
        } else if (Number(threshold) > 999999) {
            errors.push('Threshold cannot exceed 999,999');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Inventory filter validation
 */
export const validateInventoryFilters = (filters) => {
    const errors = [];
    const {
        product_id,
        category_id,
        low_stock,
        out_of_stock,
        min_quantity,
        max_quantity,
        threshold
    } = filters;

    // Product ID validation (optional)
    if (product_id !== undefined && !ValidationUtil.isValidId(product_id)) {
        errors.push('Invalid product ID in filter');
    }

    // Category ID validation (optional)
    if (category_id !== undefined && !ValidationUtil.isValidId(category_id)) {
        errors.push('Invalid category ID in filter');
    }

    // Low stock validation (optional)
    if (low_stock !== undefined) {
        if (typeof low_stock !== 'boolean' && !['true', 'false', '1', '0'].includes(String(low_stock))) {
            errors.push('Low stock filter must be a boolean');
        }
    }

    // Out of stock validation (optional)
    if (out_of_stock !== undefined) {
        if (typeof out_of_stock !== 'boolean' && !['true', 'false', '1', '0'].includes(String(out_of_stock))) {
            errors.push('Out of stock filter must be a boolean');
        }
    }

    // Min quantity validation (optional)
    if (min_quantity !== undefined) {
        if (typeof min_quantity !== 'number' && isNaN(Number(min_quantity))) {
            errors.push('Minimum quantity must be a number');
        } else if (Number(min_quantity) < 0) {
            errors.push('Minimum quantity cannot be negative');
        }
    }

    // Max quantity validation (optional)
    if (max_quantity !== undefined) {
        if (typeof max_quantity !== 'number' && isNaN(Number(max_quantity))) {
            errors.push('Maximum quantity must be a number');
        } else if (Number(max_quantity) < 0) {
            errors.push('Maximum quantity cannot be negative');
        }
    }

    // Check min/max relationship
    if (min_quantity !== undefined && max_quantity !== undefined) {
        if (Number(min_quantity) > Number(max_quantity)) {
            errors.push('Minimum quantity cannot be greater than maximum quantity');
        }
    }

    // Threshold validation (optional)
    if (threshold !== undefined) {
        const thresholdValidation = validateLowStockThreshold(threshold);
        if (!thresholdValidation.isValid) {
            errors.push(...thresholdValidation.errors);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
