import { ResponseUtil } from '../utils/index.js';
import { USER_ROLES } from '../constant/index.js';

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return ResponseUtil.unauthorized(res, 'Authentication required.');
        }

        // Validate allowed roles
        const validRoles = allowedRoles.filter(role => USER_ROLES.includes(role));
        if (validRoles.length === 0) {
            return ResponseUtil.error(res, 'Invalid role configuration.');
        }

        // Check if user's role is in allowed roles
        if (!validRoles.includes(req.user.role)) {
            return ResponseUtil.forbidden(res, 'Insufficient permissions to access this resource.');
        }

        next();
    };
};

/**
 * Admin only middleware
 */
export const adminOnly = allowRoles('admin');

/**
 * Admin and Manager middleware
 */
export const adminOrManager = allowRoles('admin', 'manager');

/**
 * All authenticated users middleware
 */
export const allUsers = allowRoles('admin', 'manager', 'user');

/**
 * Owner or Admin middleware - checks if user owns the resource or is admin
 * @param {string} userIdParam - Parameter name containing the user ID to check
 */
export const ownerOrAdmin = (userIdParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return ResponseUtil.unauthorized(res, 'Authentication required.');
        }

        const resourceUserId = req.params[userIdParam];
        const currentUserId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Allow if user is admin or owns the resource
        if (isAdmin || parseInt(resourceUserId) === parseInt(currentUserId)) {
            return next();
        }

        return ResponseUtil.forbidden(res, 'You can only access your own resources.');
    };
};

/**
 * Check if user can perform specific action based on role hierarchy
 * @param {string} targetAction - The action to check
 */
export const canPerformAction = (targetAction) => {
    const actionPermissions = {
        'create_user': ['admin'],
        'delete_user': ['admin'],
        'update_user_role': ['admin'],
        'view_all_users': ['admin'],
        'manage_inventory': ['admin', 'manager'],
        'view_reports': ['admin', 'manager'],
        'manage_categories': ['admin', 'manager'],
        'manage_products': ['admin', 'manager'],
        'view_inventory': ['admin', 'manager', 'user'],
        'update_profile': ['admin', 'manager', 'user'],
    };

    return (req, res, next) => {
        if (!req.user) {
            return ResponseUtil.unauthorized(res, 'Authentication required.');
        }

        const allowedRoles = actionPermissions[targetAction];
        if (!allowedRoles) {
            return ResponseUtil.error(res, 'Unknown action permission.');
        }

        if (!allowedRoles.includes(req.user.role)) {
            return ResponseUtil.forbidden(res, `Insufficient permissions to ${targetAction.replace('_', ' ')}.`);
        }

        next();
    };
};
