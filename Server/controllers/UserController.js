import UserService from '../services/user-services.js';
import {
    ResponseUtil,
    ErrorUtil,
    ValidationError,
    NotFoundError,
    ConflictError,
    UnauthorizedError
} from '../utils/index.js';
import { MESSAGES } from '../constant/index.js';
import jwt from 'jsonwebtoken';

class UserController {

    /**
     * Get all users with filters
     * @route GET /api/users
     */
    static async getAllUsers(req, res) {
        try {
            const result = await UserService.getAllUsers(req.query);

            return ResponseUtil.paginated(
                res,
                result.users,
                result.pagination,
                'Users retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'getAllUsers',
                query: req.query
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get user by ID
     * @route GET /api/users/:id
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);

            return ResponseUtil.success(
                res,
                user,
                'User retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'getUserById',
                params: req.params
            });

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get current user profile
     * @route GET /api/users/me
     */
    static async getCurrentUser(req, res) {
        try {
            // Assuming user ID is set in req.user by authentication middleware
            const userId = req.user?.id;

            if (!userId) {
                return ResponseUtil.unauthorized(res, 'Authentication required');
            }

            const user = await UserService.getUserById(userId);

            return ResponseUtil.success(
                res,
                user,
                'Current user profile retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'getCurrentUser',
                user: req.user
            });

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Create new user (Admin only)
     * @route POST /api/users
     */
    static async createUser(req, res) {
        try {
            const user = await UserService.createUser(req.body);

            return ResponseUtil.created(
                res,
                user,
                'User created successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'createUser',
                body: { ...req.body, password: '[REDACTED]' }
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Update user
     * @route PUT /api/users/:id
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.updateUser(id, req.body);

            return ResponseUtil.updated(
                res,
                user,
                'User updated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'updateUser',
                params: req.params,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Update current user profile
     * @route PUT /api/users/me
     */
    static async updateCurrentUser(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return ResponseUtil.unauthorized(res, 'Authentication required');
            }

            // Remove sensitive fields that users shouldn't be able to update themselves
            const { role, status, email_verified, ...allowedUpdates } = req.body;

            const user = await UserService.updateUser(userId, allowedUpdates);

            return ResponseUtil.updated(
                res,
                user,
                'Profile updated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'updateCurrentUser',
                user: req.user,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Delete user (Admin only)
     * @route DELETE /api/users/:id
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await UserService.deleteUser(id);

            return ResponseUtil.deleted(res, result.message);
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'deleteUser',
                params: req.params
            });

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * User login
     * @route POST /api/auth/login
     */
    static async login(req, res) {
        try {
            const { login, password } = req.body;

            if (!login || !password) {
                return ResponseUtil.badRequest(res, 'Login credential and password are required');
            }

            const user = await UserService.authenticateUser(login, password);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'fallback-secret',
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
                }
            );

            return ResponseUtil.success(
                res,
                {
                    user,
                    token,
                    expires_in: process.env.JWT_EXPIRES_IN || '24h'
                },
                'Login successful'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'login',
                body: { login: req.body.login, password: '[REDACTED]' }
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof UnauthorizedError) {
                return ResponseUtil.unauthorized(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * User registration
     * @route POST /api/auth/register
     */
    static async register(req, res) {
        try {
            const user = await UserService.createUser({
                ...req.body,
                role: 'user', // Force role to 'user' for registration
                status: 'active'
            });

            // Generate email verification token
            const verificationResult = await UserService.generateEmailVerificationToken(user.id);

            return ResponseUtil.created(
                res,
                {
                    user,
                    verification_token: verificationResult.token,
                    message: 'Registration successful. Please verify your email.'
                },
                'User registered successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'register',
                body: { ...req.body, password: '[REDACTED]' }
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Change password
     * @route POST /api/users/change-password
     */
    static async changePassword(req, res) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return ResponseUtil.unauthorized(res, 'Authentication required');
            }

            const { currentPassword, newPassword } = req.body;
            const result = await UserService.changePassword(userId, currentPassword, newPassword);

            return ResponseUtil.success(
                res,
                result,
                'Password changed successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'changePassword',
                user: req.user,
                body: { currentPassword: '[REDACTED]', newPassword: '[REDACTED]' }
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof UnauthorizedError) {
                return ResponseUtil.unauthorized(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Request password reset
     * @route POST /api/auth/forgot-password
     */
    static async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            const result = await UserService.generatePasswordResetToken(email);

            return ResponseUtil.success(
                res,
                {
                    message: result.message,
                    expires: result.expires
                    // Note: Don't send the actual token in response for security
                },
                'Password reset email sent'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'requestPasswordReset',
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Reset password with token
     * @route POST /api/auth/reset-password
     */
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const result = await UserService.resetPassword(token, newPassword);

            return ResponseUtil.success(
                res,
                result,
                'Password reset successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'resetPassword',
                body: { token: req.body.token, newPassword: '[REDACTED]' }
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof UnauthorizedError) {
                return ResponseUtil.unauthorized(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Verify email
     * @route POST /api/auth/verify-email
     */
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            const result = await UserService.verifyEmail(token);

            return ResponseUtil.success(
                res,
                result,
                'Email verified successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'verifyEmail',
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof UnauthorizedError) {
                return ResponseUtil.unauthorized(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get user statistics (Admin only)
     * @route GET /api/users/statistics
     */
    static async getUserStatistics(req, res) {
        try {
            const statistics = await UserService.getUserStatistics();

            return ResponseUtil.success(
                res,
                statistics,
                'User statistics retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'UserController',
                method: 'getUserStatistics'
            });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }
}

export default UserController;
