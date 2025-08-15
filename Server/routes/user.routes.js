import express from 'express';
import UserController from '../controllers/UserController.js';

const router = express.Router();

// Public routes (no authentication needed)
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes ( can add authentication middleware later)
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
