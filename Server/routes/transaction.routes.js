import express from 'express';
import TransactionController from '../controllers/TransactionController.js';

const router = express.Router();

// Basic routes for transaction management
router.get('/', TransactionController.getAllTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.post('/', TransactionController.createTransaction);
router.get('/product/:productId', TransactionController.getTransactionsByProduct);

export default router;
