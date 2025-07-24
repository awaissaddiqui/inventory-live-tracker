import express from 'express';
import UserController from '../controllers/UserController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { allowRoles, adminOnly, adminOrManager } from '../middlewares/authorization.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { generalRateLimit, authRateLimit, strictRateLimit, passwordResetRateLimit } from '../middlewares/rateLimit.middleware.js';
import * as userValidators from '../validators/user.validator.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register',
    authRateLimit,
    validate(userValidators.validateUserRegistration),
    UserController.register
);

router.post('/login',
    authRateLimit,
    validate(userValidators.validateUserLogin),
    UserController.login
);

// Password reset routes
router.post('/forgot-password',
    passwordResetRateLimit,
    validate(userValidators.validateForgotPassword),
    UserController.forgotPassword
);

router.post('/reset-password',
    passwordResetRateLimit,
    validate(userValidators.validatePasswordReset),
    UserController.resetPassword
);

// Protected routes (authentication required)
router.use(authenticate); // Apply authentication middleware to all routes below

// Current user routes
router.get('/profile', UserController.getProfile);

router.put('/profile',
    validate(userValidators.validateUserUpdate),
    UserController.updateProfile
);

router.post('/change-password',
    strictRateLimit,
    validate(userValidators.validatePasswordChange),
    UserController.changePassword
);

router.post('/logout', UserController.logout);

// Admin-only routes
router.use(adminOnly); // Apply admin role requirement to all routes below

// User management routes
router.get('/',
    validate(commonValidators.validatePagination, 'query'),
    UserController.getAllUsers
);

router.get('/search',
    validate(commonValidators.validateSearch, 'query'),
    UserController.searchUsers
);

router.get('/:id',
    validate(commonValidators.validateId, 'params'),
    UserController.getUserById
);

router.put('/:id',
    validate(commonValidators.validateId, 'params'),
    validate(userValidators.validateUserUpdate),
    UserController.updateUser
);

router.delete('/:id',
    validate(commonValidators.validateId, 'params'),
    UserController.deleteUser
);

// Bulk operations
router.post('/bulk/create',
    validate(userValidators.validateBulkUserImport),
    UserController.bulkCreateUsers
);

router.patch('/bulk/update',
    validate(userValidators.validateBulkUserUpdate),
    UserController.bulkUpdateUsers
);

router.delete('/bulk/delete',
    validate(commonValidators.validateBulkIds),
    UserController.bulkDeleteUsers
);

// User status management
router.patch('/:id/activate',
    validate(commonValidators.validateId, 'params'),
    UserController.activateUser
);

router.patch('/:id/deactivate',
    validate(commonValidators.validateId, 'params'),
    UserController.deactivateUser
);

// User statistics (admin only)
router.get('/stats/overview', UserController.getUserStats);

export default router;
