import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { ResponseUtil, UnauthorizedError } from '../utils/index.js';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return ResponseUtil.unauthorized(res, 'Access denied. No token provided.');
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            return ResponseUtil.unauthorized(res, 'Access denied. Invalid token format.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        // Verify user still exists and is active
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return ResponseUtil.unauthorized(res, 'Token is no longer valid. User not found.');
        }

        if (!user.isActive()) {
            return ResponseUtil.unauthorized(res, 'Account is inactive or suspended.');
        }

        // Attach user to request
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return ResponseUtil.unauthorized(res, 'Invalid token.');
        }

        if (error.name === 'TokenExpiredError') {
            return ResponseUtil.unauthorized(res, 'Token has expired.');
        }

        return ResponseUtil.error(res, 'Authentication failed.');
    }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User.findByPk(decoded.id);

        if (user && user.isActive()) {
            req.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            };
        }

        next();
    } catch (error) {
        // Ignore authentication errors for optional auth
        next();
    }
};
