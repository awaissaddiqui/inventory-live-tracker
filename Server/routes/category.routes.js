import express from 'express';
import CategoryController from '../controllers/CategoryController.js';

const router = express.Router();

// Basic CRUD routes for categories
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
