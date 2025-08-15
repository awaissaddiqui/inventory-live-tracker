import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserService {
    // Create a new user
    static async createUser(userData) {
        try {
            const { username, email, password, role = 'user', first_name, last_name } = userData;

            // Check if user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user (matching your model structure)
            const user = await User.create({
                username,
                email,
                password_hash: hashedPassword, // Use password_hash as in your model
                first_name: first_name || username,
                last_name: last_name || 'User',
                role,
                status: 'active'
            });

            // Remove password from response
            const userResponse = user.toJSON();
            delete userResponse.password_hash;

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return {
                user: userResponse,
                token
            };
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    // Login user
    static async loginUser(credentials) {
        try {
            const { email, password } = credentials;

            // Find user by email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check if user is active
            if (user.status !== 'active') {
                throw new Error('Account is deactivated');
            }

            // Verify password (using password_hash from model)
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Remove password from response
            const userResponse = user.toJSON();
            delete userResponse.password_hash;

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return {
                user: userResponse,
                token
            };
        } catch (error) {
            console.error('Login user error:', error);
            throw error;
        }
    }

    // Get all users
    static async getAllUsers() {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password_hash'] }, // Don't return passwords
                order: [['created_at', 'DESC']]
            });
            return users;
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    }

    // Get user by ID
    static async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password_hash'] }
            });
            return user;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw error;
        }
    }

    // Update user
    static async updateUser(id, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password) {
                const saltRounds = 10;
                updateData.password_hash = await bcrypt.hash(updateData.password, saltRounds);
                delete updateData.password; // Remove plain password
            }

            updateData.updated_at = new Date();

            const [updatedRowsCount] = await User.update(updateData, {
                where: { id }
            });

            if (updatedRowsCount === 0) {
                return null;
            }

            // Get updated user
            const updatedUser = await User.findByPk(id, {
                attributes: { exclude: ['password_hash'] }
            });

            return updatedUser;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    // Delete user
    static async deleteUser(id) {
        try {
            const deletedRowsCount = await User.destroy({
                where: { id }
            });
            return deletedRowsCount > 0;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    // Verify JWT token
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

export default UserService;
