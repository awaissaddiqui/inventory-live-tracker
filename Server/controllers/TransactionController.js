import { Transaction, Product } from '../models/index.js';

class TransactionController {
    // Get all transactions
    static async getAllTransactions(req, res) {
        try {
            const transactions = await Transaction.findAll({
                include: [{
                    model: Product,
                    as: 'product'
                }],
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: transactions
            });
        } catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve transactions'
            });
        }
    }

    // Get transaction by ID
    static async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await Transaction.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'product'
                }]
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Transaction retrieved successfully',
                data: transaction
            });
        } catch (error) {
            console.error('Get transaction by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve transaction'
            });
        }
    }

    // Create new transaction
    static async createTransaction(req, res) {
        try {
            const { product_id, type, quantity, notes } = req.body;

            if (!product_id || !type || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID, type, and quantity are required'
                });
            }

            const transaction = await Transaction.create({
                product_id,
                type, // 'in' or 'out'
                quantity,
                notes: notes || '',
                transaction_date: new Date()
            });

            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction
            });
        } catch (error) {
            console.error('Create transaction error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create transaction'
            });
        }
    }

    // Get transactions by product
    static async getTransactionsByProduct(req, res) {
        try {
            const { productId } = req.params;
            const transactions = await Transaction.findAll({
                where: { product_id: productId },
                include: [{
                    model: Product,
                    as: 'product'
                }],
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                message: 'Product transactions retrieved successfully',
                data: transactions
            });
        } catch (error) {
            console.error('Get transactions by product error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve product transactions'
            });
        }
    }
}

export default TransactionController;
