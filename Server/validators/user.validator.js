import { ValidationUtil } from '../utils/index.js';
import { USER_ROLES, USER_STATUS } from '../constant/index.js';

/**
 * User registration validation
 */
export const validateUserRegistration = (userData) => {
    const errors = [];
    const { username, email, password, first_name, last_name } = userData;

    // Username validation
    if (!username) {
        errors.push('Username is required');
    } else {
        if (typeof username !== 'string') {
            errors.push('Username must be a string');
        } else if (username.trim().length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else if (username.trim().length > 50) {
            errors.push('Username cannot exceed 50 characters');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
    }

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (!ValidationUtil.isValidEmail(email)) {
        errors.push('Invalid email format');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (!ValidationUtil.isValidPassword(password)) {
        errors.push('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // First name validation
    if (!first_name) {
        errors.push('First name is required');
    } else if (typeof first_name !== 'string' || first_name.trim().length === 0) {
        errors.push('First name cannot be empty');
    } else if (first_name.trim().length > 50) {
        errors.push('First name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(first_name.trim())) {
        errors.push('First name can only contain letters and spaces');
    }

    // Last name validation
    if (!last_name) {
        errors.push('Last name is required');
    } else if (typeof last_name !== 'string' || last_name.trim().length === 0) {
        errors.push('Last name cannot be empty');
    } else if (last_name.trim().length > 50) {
        errors.push('Last name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(last_name.trim())) {
        errors.push('Last name can only contain letters and spaces');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * User login validation
 */
export const validateUserLogin = (loginData) => {
    const errors = [];
    const { login, password } = loginData;

    // Login credential validation (can be username or email)
    if (!login) {
        errors.push('Username or email is required');
    } else if (typeof login !== 'string' || login.trim().length < 3) {
        errors.push('Username or email must be at least 3 characters long');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (typeof password !== 'string' || password.length === 0) {
        errors.push('Password cannot be empty');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * User update validation
 */
export const validateUserUpdate = (updateData) => {
    const errors = [];
    const { username, email, first_name, last_name, role, status } = updateData;

    // Username validation (optional)
    if (username !== undefined) {
        if (typeof username !== 'string') {
            errors.push('Username must be a string');
        } else if (username.trim().length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else if (username.trim().length > 50) {
            errors.push('Username cannot exceed 50 characters');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
    }

    // Email validation (optional)
    if (email !== undefined) {
        if (!ValidationUtil.isValidEmail(email)) {
            errors.push('Invalid email format');
        }
    }

    // First name validation (optional)
    if (first_name !== undefined) {
        if (typeof first_name !== 'string' || first_name.trim().length === 0) {
            errors.push('First name cannot be empty');
        } else if (first_name.trim().length > 50) {
            errors.push('First name cannot exceed 50 characters');
        } else if (!/^[a-zA-Z\s]+$/.test(first_name.trim())) {
            errors.push('First name can only contain letters and spaces');
        }
    }

    // Last name validation (optional)
    if (last_name !== undefined) {
        if (typeof last_name !== 'string' || last_name.trim().length === 0) {
            errors.push('Last name cannot be empty');
        } else if (last_name.trim().length > 50) {
            errors.push('Last name cannot exceed 50 characters');
        } else if (!/^[a-zA-Z\s]+$/.test(last_name.trim())) {
            errors.push('Last name can only contain letters and spaces');
        }
    }

    // Role validation (optional)
    if (role !== undefined) {
        if (!USER_ROLES.includes(role)) {
            errors.push(`Role must be one of: ${USER_ROLES.join(', ')}`);
        }
    }

    // Status validation (optional)
    if (status !== undefined) {
        if (!USER_STATUS.includes(status)) {
            errors.push(`Status must be one of: ${USER_STATUS.join(', ')}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Password change validation
 */
export const validatePasswordChange = (passwordData) => {
    const errors = [];
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Current password validation
    if (!currentPassword) {
        errors.push('Current password is required');
    } else if (typeof currentPassword !== 'string') {
        errors.push('Current password must be a string');
    }

    // New password validation
    if (!newPassword) {
        errors.push('New password is required');
    } else if (!ValidationUtil.isValidPassword(newPassword)) {
        errors.push('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // Confirm password validation
    if (confirmPassword !== undefined) {
        if (newPassword !== confirmPassword) {
            errors.push('New password and confirm password do not match');
        }
    }

    // Check if new password is different from current
    if (currentPassword && newPassword && currentPassword === newPassword) {
        errors.push('New password must be different from current password');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Email validation
 */
export const validateEmail = (email) => {
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    } else if (!ValidationUtil.isValidEmail(email)) {
        errors.push('Invalid email format');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Password reset validation
 */
export const validatePasswordReset = (resetData) => {
    const errors = [];
    const { token, newPassword, confirmPassword } = resetData;

    // Token validation
    if (!token) {
        errors.push('Reset token is required');
    } else if (typeof token !== 'string' || token.trim().length === 0) {
        errors.push('Invalid reset token');
    }

    // New password validation
    if (!newPassword) {
        errors.push('New password is required');
    } else if (!ValidationUtil.isValidPassword(newPassword)) {
        errors.push('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }

    // Confirm password validation
    if (confirmPassword !== undefined) {
        if (newPassword !== confirmPassword) {
            errors.push('New password and confirm password do not match');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
