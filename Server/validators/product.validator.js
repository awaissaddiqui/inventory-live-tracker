import { ValidationUtil } from '../utils/index.js';
import { PRODUCT_UNITS } from '../constant/index.js';

/**
 * Product creation validation
 */
export const validateProductCreation = (productData) => {
    const errors = [];
    const {
        name,
        sku,
        category_id,
        unit,
        cost_price,
        selling_price,
        reorder_level,
        description,
        barcode
    } = productData;

    // Name validation
    if (!name) {
        errors.push('Product name is required');
    } else if (typeof name !== 'string') {
        errors.push('Product name must be a string');
    } else if (name.trim().length === 0) {
        errors.push('Product name cannot be empty');
    } else if (name.trim().length > 255) {
        errors.push('Product name cannot exceed 255 characters');
    }

    // SKU validation
    if (!sku) {
        errors.push('SKU is required');
    } else if (typeof sku !== 'string') {
        errors.push('SKU must be a string');
    } else if (sku.trim().length === 0) {
        errors.push('SKU cannot be empty');
    } else if (sku.trim().length > 100) {
        errors.push('SKU cannot exceed 100 characters');
    } else if (!/^[A-Z0-9\-_]+$/i.test(sku.trim())) {
        errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
    }

    // Category ID validation
    if (!category_id) {
        errors.push('Category is required');
    } else if (!ValidationUtil.isValidId(category_id)) {
        errors.push('Invalid category ID');
    }

    // Unit validation
    if (!unit) {
        errors.push('Unit is required');
    } else if (!Object.values(PRODUCT_UNITS).includes(unit)) {
        errors.push(`Unit must be one of: ${Object.values(PRODUCT_UNITS).join(', ')}`);
    }

    // Cost price validation (optional)
    if (cost_price !== undefined && cost_price !== null) {
        if (typeof cost_price !== 'number' && isNaN(Number(cost_price))) {
            errors.push('Cost price must be a number');
        } else if (Number(cost_price) < 0) {
            errors.push('Cost price cannot be negative');
        } else if (Number(cost_price) > 999999.99) {
            errors.push('Cost price cannot exceed 999,999.99');
        }
    }

    // Selling price validation (optional)
    if (selling_price !== undefined && selling_price !== null) {
        if (typeof selling_price !== 'number' && isNaN(Number(selling_price))) {
            errors.push('Selling price must be a number');
        } else if (Number(selling_price) < 0) {
            errors.push('Selling price cannot be negative');
        } else if (Number(selling_price) > 999999.99) {
            errors.push('Selling price cannot exceed 999,999.99');
        }
    }

    // Reorder level validation (optional)
    if (reorder_level !== undefined && reorder_level !== null) {
        if (typeof reorder_level !== 'number' && isNaN(Number(reorder_level))) {
            errors.push('Reorder level must be a number');
        } else if (Number(reorder_level) < 0) {
            errors.push('Reorder level cannot be negative');
        } else if (!Number.isInteger(Number(reorder_level))) {
            errors.push('Reorder level must be a whole number');
        }
    }

    // Description validation (optional)
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 1000) {
            errors.push('Description cannot exceed 1000 characters');
        }
    }

    // Barcode validation (optional)
    if (barcode !== undefined && barcode !== null) {
        if (typeof barcode !== 'string') {
            errors.push('Barcode must be a string');
        } else if (barcode.trim().length > 100) {
            errors.push('Barcode cannot exceed 100 characters');
        } else if (barcode.trim().length > 0 && !/^[0-9A-Z\-]+$/i.test(barcode.trim())) {
            errors.push('Barcode can only contain letters, numbers, and hyphens');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Product update validation
 */
export const validateProductUpdate = (updateData) => {
    const errors = [];
    const {
        name,
        sku,
        category_id,
        unit,
        cost_price,
        selling_price,
        reorder_level,
        description,
        barcode,
        status
    } = updateData;

    // Name validation (optional)
    if (name !== undefined) {
        if (typeof name !== 'string') {
            errors.push('Product name must be a string');
        } else if (name.trim().length === 0) {
            errors.push('Product name cannot be empty');
        } else if (name.trim().length > 255) {
            errors.push('Product name cannot exceed 255 characters');
        }
    }

    // SKU validation (optional)
    if (sku !== undefined) {
        if (typeof sku !== 'string') {
            errors.push('SKU must be a string');
        } else if (sku.trim().length === 0) {
            errors.push('SKU cannot be empty');
        } else if (sku.trim().length > 100) {
            errors.push('SKU cannot exceed 100 characters');
        } else if (!/^[A-Z0-9\-_]+$/i.test(sku.trim())) {
            errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
        }
    }

    // Category ID validation (optional)
    if (category_id !== undefined) {
        if (!ValidationUtil.isValidId(category_id)) {
            errors.push('Invalid category ID');
        }
    }

    // Unit validation (optional)
    if (unit !== undefined) {
        if (!Object.values(PRODUCT_UNITS).includes(unit)) {
            errors.push(`Unit must be one of: ${Object.values(PRODUCT_UNITS).join(', ')}`);
        }
    }

    // Cost price validation (optional)
    if (cost_price !== undefined && cost_price !== null) {
        if (typeof cost_price !== 'number' && isNaN(Number(cost_price))) {
            errors.push('Cost price must be a number');
        } else if (Number(cost_price) < 0) {
            errors.push('Cost price cannot be negative');
        } else if (Number(cost_price) > 999999.99) {
            errors.push('Cost price cannot exceed 999,999.99');
        }
    }

    // Selling price validation (optional)
    if (selling_price !== undefined && selling_price !== null) {
        if (typeof selling_price !== 'number' && isNaN(Number(selling_price))) {
            errors.push('Selling price must be a number');
        } else if (Number(selling_price) < 0) {
            errors.push('Selling price cannot be negative');
        } else if (Number(selling_price) > 999999.99) {
            errors.push('Selling price cannot exceed 999,999.99');
        }
    }

    // Reorder level validation (optional)
    if (reorder_level !== undefined && reorder_level !== null) {
        if (typeof reorder_level !== 'number' && isNaN(Number(reorder_level))) {
            errors.push('Reorder level must be a number');
        } else if (Number(reorder_level) < 0) {
            errors.push('Reorder level cannot be negative');
        } else if (!Number.isInteger(Number(reorder_level))) {
            errors.push('Reorder level must be a whole number');
        }
    }

    // Description validation (optional)
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 1000) {
            errors.push('Description cannot exceed 1000 characters');
        }
    }

    // Barcode validation (optional)
    if (barcode !== undefined && barcode !== null) {
        if (typeof barcode !== 'string') {
            errors.push('Barcode must be a string');
        } else if (barcode.trim().length > 100) {
            errors.push('Barcode cannot exceed 100 characters');
        } else if (barcode.trim().length > 0 && !/^[0-9A-Z\-]+$/i.test(barcode.trim())) {
            errors.push('Barcode can only contain letters, numbers, and hyphens');
        }
    }

    // Status validation (optional)
    if (status !== undefined) {
        if (!['active', 'inactive'].includes(status)) {
            errors.push('Status must be either active or inactive');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Bulk product import validation
 */
export const validateBulkProductImport = (productsArray) => {
    const errors = [];
    const results = [];

    if (!Array.isArray(productsArray)) {
        errors.push('Products must be an array');
        return { isValid: false, errors };
    }

    if (productsArray.length === 0) {
        errors.push('Products array cannot be empty');
        return { isValid: false, errors };
    }

    if (productsArray.length > 100) {
        errors.push('Cannot import more than 100 products at once');
        return { isValid: false, errors };
    }

    // Validate each product
    productsArray.forEach((product, index) => {
        const validation = validateProductCreation(product);
        results.push({
            index,
            product,
            isValid: validation.isValid,
            errors: validation.errors
        });

        if (!validation.isValid) {
            errors.push(`Product at index ${index}: ${validation.errors.join(', ')}`);
        }
    });

    // Check for duplicate SKUs within the batch
    const skus = productsArray.map(p => p.sku?.trim().toLowerCase()).filter(Boolean);
    const duplicateSKUs = skus.filter((sku, index) => skus.indexOf(sku) !== index);

    if (duplicateSKUs.length > 0) {
        errors.push(`Duplicate SKUs found in batch: ${[...new Set(duplicateSKUs)].join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        results
    };
};

/**
 * SKU validation
 */
export const validateSKU = (sku) => {
    const errors = [];

    if (!sku) {
        errors.push('SKU is required');
    } else if (typeof sku !== 'string') {
        errors.push('SKU must be a string');
    } else if (sku.trim().length === 0) {
        errors.push('SKU cannot be empty');
    } else if (sku.trim().length > 100) {
        errors.push('SKU cannot exceed 100 characters');
    } else if (!/^[A-Z0-9\-_]+$/i.test(sku.trim())) {
        errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Barcode validation
 */
export const validateBarcode = (barcode) => {
    const errors = [];

    if (barcode !== undefined && barcode !== null && barcode !== '') {
        if (typeof barcode !== 'string') {
            errors.push('Barcode must be a string');
        } else if (barcode.trim().length > 100) {
            errors.push('Barcode cannot exceed 100 characters');
        } else if (!/^[0-9A-Z\-]+$/i.test(barcode.trim())) {
            errors.push('Barcode can only contain letters, numbers, and hyphens');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
