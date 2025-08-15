import UserService from '../services/user-service.js';

class UserController {
    // Register a new user
    static async register(req, res) {
        try {
            const { username, email, password, role, first_name, last_name } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email, and password are required'
                });
            }

            const userData = {
                username,
                email,
                password,
                role: role || 'user',
                first_name: first_name || username,
                last_name: last_name || 'User'
            };

            const result = await UserService.createUser(userData);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to register user'
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await UserService.loginUser({ email, password });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }

    // Get all users
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: users
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users'
            });
        }
    }

    // Get user by ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user'
            });
        }
    }

    // Update user
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const user = await UserService.updateUser(id, updateData);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await UserService.deleteUser(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
}

export default UserController;
