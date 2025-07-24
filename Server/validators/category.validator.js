/**
 * Category creation validation
 */
export const validateCategoryCreation = (categoryData) => {
    const errors = [];
    const { name, description } = categoryData;

    // Name validation
    if (!name) {
        errors.push('Category name is required');
    } else if (typeof name !== 'string') {
        errors.push('Category name must be a string');
    } else if (name.trim().length === 0) {
        errors.push('Category name cannot be empty');
    } else if (name.trim().length > 100) {
        errors.push('Category name cannot exceed 100 characters');
    } else if (name.trim().length < 2) {
        errors.push('Category name must be at least 2 characters long');
    } else if (!/^[a-zA-Z0-9\s\-_&()]+$/.test(name.trim())) {
        errors.push('Category name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and parentheses');
    }

    // Description validation (optional)
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Category update validation
 */
export const validateCategoryUpdate = (updateData) => {
    const errors = [];
    const { name, description, status } = updateData;

    // Name validation (optional)
    if (name !== undefined) {
        if (typeof name !== 'string') {
            errors.push('Category name must be a string');
        } else if (name.trim().length === 0) {
            errors.push('Category name cannot be empty');
        } else if (name.trim().length > 100) {
            errors.push('Category name cannot exceed 100 characters');
        } else if (name.trim().length < 2) {
            errors.push('Category name must be at least 2 characters long');
        } else if (!/^[a-zA-Z0-9\s\-_&()]+$/.test(name.trim())) {
            errors.push('Category name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and parentheses');
        }
    }

    // Description validation (optional)
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('Description must be a string');
        } else if (description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
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
 * Category name validation (for checking duplicates)
 */
export const validateCategoryName = (name) => {
    const errors = [];

    if (!name) {
        errors.push('Category name is required');
    } else if (typeof name !== 'string') {
        errors.push('Category name must be a string');
    } else if (name.trim().length === 0) {
        errors.push('Category name cannot be empty');
    } else if (name.trim().length > 100) {
        errors.push('Category name cannot exceed 100 characters');
    } else if (name.trim().length < 2) {
        errors.push('Category name must be at least 2 characters long');
    } else if (!/^[a-zA-Z0-9\s\-_&()]+$/.test(name.trim())) {
        errors.push('Category name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and parentheses');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Bulk category import validation
 */
export const validateBulkCategoryImport = (categoriesArray) => {
    const errors = [];
    const results = [];

    if (!Array.isArray(categoriesArray)) {
        errors.push('Categories must be an array');
        return { isValid: false, errors };
    }

    if (categoriesArray.length === 0) {
        errors.push('Categories array cannot be empty');
        return { isValid: false, errors };
    }

    if (categoriesArray.length > 50) {
        errors.push('Cannot import more than 50 categories at once');
        return { isValid: false, errors };
    }

    // Validate each category
    categoriesArray.forEach((category, index) => {
        const validation = validateCategoryCreation(category);
        results.push({
            index,
            category,
            isValid: validation.isValid,
            errors: validation.errors
        });

        if (!validation.isValid) {
            errors.push(`Category at index ${index}: ${validation.errors.join(', ')}`);
        }
    });

    // Check for duplicate names within the batch
    const names = categoriesArray
        .map(c => c.name?.trim().toLowerCase())
        .filter(Boolean);
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);

    if (duplicateNames.length > 0) {
        errors.push(`Duplicate category names found in batch: ${[...new Set(duplicateNames)].join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        results
    };
};

// Default export
export default {
    validateCategoryCreation,
    validateCategoryUpdate,
    validateCategoryName,
    validateBulkCategoryImport
};