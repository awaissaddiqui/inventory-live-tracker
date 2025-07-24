import { User } from '../models/index.js';
import {
    ValidationError,
    NotFoundError,
    ConflictError,
    UnauthorizedError
} from '../utils/index.js';
import {
    VALIDATION_PATTERNS,
    USER_ROLES,
    USER_STATUS,
    PAGINATION
} from '../constant/index.js';
import {
    ValidationUtil,
    DatabaseUtil,
    StringUtil
} from '../utils/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserService {

    /**
     * Get all users with filters and pagination
     */
    static async getAllUsers(filters = {}) {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            sort_by = 'created_at',
            sort_order = 'desc',
            role,
            status,
            search,
            email_verified
        } = filters;

        // Validate pagination parameters
        const validatedPage = ValidationUtil.validatePositiveInteger(page, 'Page');
        const validatedLimit = ValidationUtil.validatePositiveInteger(limit, 'Limit', PAGINATION.MAX_LIMIT);

        // Build where conditions
        const whereConditions = {};

        if (role && USER_ROLES.includes(role)) {
            whereConditions.role = role;
        }

        if (status && USER_STATUS.includes(status)) {
            whereConditions.status = status;
        }

        if (email_verified !== undefined) {
            whereConditions.email_verified = ValidationUtil.parseBoolean(email_verified);
        }

        // Search functionality
        if (search && search.trim()) {
            const searchTerm = `%${search.trim()}%`;
            whereConditions[DatabaseUtil.Op.or] = [
                { username: { [DatabaseUtil.Op.iLike]: searchTerm } },
                { email: { [DatabaseUtil.Op.iLike]: searchTerm } },
                { first_name: { [DatabaseUtil.Op.iLike]: searchTerm } },
                { last_name: { [DatabaseUtil.Op.iLike]: searchTerm } }
            ];
        }

        // Validate sort parameters
        const validSortFields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'status', 'created_at', 'updated_at', 'last_login'];
        const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortOrder = ['asc', 'desc'].includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

        const offset = (validatedPage - 1) * validatedLimit;

        try {
            const result = await User.findAndCountAll({
                where: whereConditions,
                order: [[sortField, sortOrder]],
                limit: validatedLimit,
                offset: offset,
                attributes: { exclude: ['password_hash', 'email_verification_token', 'password_reset_token', 'password_reset_expires'] }
            });

            const pagination = DatabaseUtil.calculatePagination(
                result.count,
                validatedPage,
                validatedLimit
            );

            return {
                users: result.rows,
                pagination
            };
        } catch (error) {
            throw DatabaseUtil.handleDatabaseError(error, 'retrieving users');
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(id) {
        if (!ValidationUtil.isValidId(id)) {
            throw new ValidationError('Invalid user ID format');
        }

        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password_hash', 'email_verification_token', 'password_reset_token', 'password_reset_expires'] }
            });

            if (!user) {
                throw new NotFoundError('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'retrieving user');
        }
    }

    /**
     * Get user by email
     */
    static async getUserByEmail(email) {
        if (!ValidationUtil.isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        try {
            const user = await User.findByEmail(email);

            if (!user) {
                throw new NotFoundError('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'retrieving user by email');
        }
    }

    /**
     * Get user by username
     */
    static async getUserByUsername(username) {
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            throw new ValidationError('Username must be at least 3 characters long');
        }

        try {
            const user = await User.findByUsername(username.trim());

            if (!user) {
                throw new NotFoundError('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'retrieving user by username');
        }
    }

    /**
     * Create new user
     */
    static async createUser(userData) {
        const {
            username,
            email,
            password,
            first_name,
            last_name,
            role = 'user',
            status = 'active',
            phone,
            profile_image
        } = userData;

        // Validate required fields
        if (!username || !email || !password || !first_name || !last_name) {
            throw new ValidationError('Username, email, password, first name, and last name are required');
        }

        // Validate email format
        if (!ValidationUtil.isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        // Validate password strength
        if (!ValidationUtil.isValidPassword(password)) {
            throw new ValidationError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
        }

        // Validate role
        if (!USER_ROLES.includes(role)) {
            throw new ValidationError(`Role must be one of: ${USER_ROLES.join(', ')}`);
        }

        // Validate status
        if (!USER_STATUS.includes(status)) {
            throw new ValidationError(`Status must be one of: ${USER_STATUS.join(', ')}`);
        }

        try {
            // Check if username already exists
            const existingUsername = await User.findByUsername(username);
            if (existingUsername) {
                throw new ConflictError('Username already exists');
            }

            // Check if email already exists
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                throw new ConflictError('Email already exists');
            }

            // Create user
            const user = await User.create({
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password_hash: password, // Will be hashed by the model hook
                first_name: StringUtil.capitalizeFirst(first_name.trim()),
                last_name: StringUtil.capitalizeFirst(last_name.trim()),
                role,
                status,
                phone: phone ? phone.trim() : null,
                profile_image: profile_image ? profile_image.trim() : null
            });

            return user;
        } catch (error) {
            if (error instanceof ConflictError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'creating user');
        }
    }

    /**
     * Update user
     */
    static async updateUser(id, updateData) {
        if (!ValidationUtil.isValidId(id)) {
            throw new ValidationError('Invalid user ID format');
        }

        const {
            username,
            email,
            first_name,
            last_name,
            role,
            status,
            phone,
            profile_image,
            email_verified
        } = updateData;

        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Validate email if provided
            if (email && !ValidationUtil.isValidEmail(email)) {
                throw new ValidationError('Invalid email format');
            }

            // Validate role if provided
            if (role && !USER_ROLES.includes(role)) {
                throw new ValidationError(`Role must be one of: ${USER_ROLES.join(', ')}`);
            }

            // Validate status if provided
            if (status && !USER_STATUS.includes(status)) {
                throw new ValidationError(`Status must be one of: ${USER_STATUS.join(', ')}`);
            }

            // Check for conflicts
            if (username && username !== user.username) {
                const existingUsername = await User.findByUsername(username);
                if (existingUsername) {
                    throw new ConflictError('Username already exists');
                }
            }

            if (email && email !== user.email) {
                const existingEmail = await User.findByEmail(email);
                if (existingEmail) {
                    throw new ConflictError('Email already exists');
                }
            }

            // Update user
            const updatedUser = await user.update({
                username: username ? username.trim() : user.username,
                email: email ? email.toLowerCase().trim() : user.email,
                first_name: first_name ? StringUtil.capitalizeFirst(first_name.trim()) : user.first_name,
                last_name: last_name ? StringUtil.capitalizeFirst(last_name.trim()) : user.last_name,
                role: role || user.role,
                status: status || user.status,
                phone: phone !== undefined ? (phone ? phone.trim() : null) : user.phone,
                profile_image: profile_image !== undefined ? (profile_image ? profile_image.trim() : null) : user.profile_image,
                email_verified: email_verified !== undefined ? ValidationUtil.parseBoolean(email_verified) : user.email_verified
            });

            return updatedUser;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'updating user');
        }
    }

    /**
     * Delete user (soft delete by setting status to inactive)
     */
    static async deleteUser(id) {
        if (!ValidationUtil.isValidId(id)) {
            throw new ValidationError('Invalid user ID format');
        }

        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Soft delete by setting status to inactive
            await user.update({ status: 'inactive' });

            return {
                message: 'User deactivated successfully'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'deleting user');
        }
    }

    /**
     * Authenticate user
     */
    static async authenticateUser(loginCredential, password) {
        if (!loginCredential || !password) {
            throw new ValidationError('Login credential and password are required');
        }

        try {
            // Find user by email or username
            let user;
            if (ValidationUtil.isValidEmail(loginCredential)) {
                user = await User.findByEmail(loginCredential);
            } else {
                user = await User.findByUsername(loginCredential);
            }

            if (!user) {
                throw new UnauthorizedError('Invalid credentials');
            }

            // Check if user is active
            if (!user.isActive()) {
                throw new UnauthorizedError('Account is inactive or suspended');
            }

            // Validate password
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new UnauthorizedError('Invalid credentials');
            }

            // Update last login
            await user.updateLastLogin();

            return user;
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'authenticating user');
        }
    }

    /**
     * Change user password
     */
    static async changePassword(id, currentPassword, newPassword) {
        if (!ValidationUtil.isValidId(id)) {
            throw new ValidationError('Invalid user ID format');
        }

        if (!currentPassword || !newPassword) {
            throw new ValidationError('Current password and new password are required');
        }

        if (!ValidationUtil.isValidPassword(newPassword)) {
            throw new ValidationError('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
        }

        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Validate current password
            const isValidCurrentPassword = await user.validatePassword(currentPassword);
            if (!isValidCurrentPassword) {
                throw new UnauthorizedError('Current password is incorrect');
            }

            // Update password
            await user.update({
                password_hash: newPassword // Will be hashed by the model hook
            });

            return {
                message: 'Password changed successfully'
            };
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'changing password');
        }
    }

    /**
     * Reset password with token
     */
    static async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            throw new ValidationError('Reset token and new password are required');
        }

        if (!ValidationUtil.isValidPassword(newPassword)) {
            throw new ValidationError('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
        }

        try {
            const user = await User.findByPasswordResetToken(token);
            if (!user) {
                throw new UnauthorizedError('Invalid or expired reset token');
            }

            // Update password and clear reset token
            await user.update({
                password_hash: newPassword, // Will be hashed by the model hook
                password_reset_token: null,
                password_reset_expires: null
            });

            return {
                message: 'Password reset successfully'
            };
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'resetting password');
        }
    }

    /**
     * Generate password reset token
     */
    static async generatePasswordResetToken(email) {
        if (!ValidationUtil.isValidEmail(email)) {
            throw new ValidationError('Invalid email format');
        }

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            const resetToken = user.generatePasswordResetToken();
            await user.save();

            return {
                token: resetToken,
                expires: user.password_reset_expires,
                message: 'Password reset token generated successfully'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'generating password reset token');
        }
    }

    /**
     * Verify email
     */
    static async verifyEmail(token) {
        if (!token) {
            throw new ValidationError('Verification token is required');
        }

        try {
            const user = await User.findByEmailVerificationToken(token);
            if (!user) {
                throw new UnauthorizedError('Invalid verification token');
            }

            await user.update({
                email_verified: true,
                email_verification_token: null
            });

            return {
                message: 'Email verified successfully'
            };
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'verifying email');
        }
    }

    /**
     * Generate email verification token
     */
    static async generateEmailVerificationToken(userId) {
        if (!ValidationUtil.isValidId(userId)) {
            throw new ValidationError('Invalid user ID format');
        }

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            const verificationToken = user.generateEmailVerificationToken();
            await user.save();

            return {
                token: verificationToken,
                message: 'Email verification token generated successfully'
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw DatabaseUtil.handleDatabaseError(error, 'generating email verification token');
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStatistics() {
        try {
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { status: 'active' } });
            const adminUsers = await User.count({ where: { role: 'admin' } });
            const managerUsers = await User.count({ where: { role: 'manager' } });
            const regularUsers = await User.count({ where: { role: 'user' } });
            const verifiedUsers = await User.count({ where: { email_verified: true } });

            return {
                total_users: totalUsers,
                active_users: activeUsers,
                inactive_users: totalUsers - activeUsers,
                admin_users: adminUsers,
                manager_users: managerUsers,
                regular_users: regularUsers,
                verified_users: verifiedUsers,
                unverified_users: totalUsers - verifiedUsers
            };
        } catch (error) {
            throw DatabaseUtil.handleDatabaseError(error, 'retrieving user statistics');
        }
    }
}

export default UserService;
