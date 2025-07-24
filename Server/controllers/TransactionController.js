import TransactionService from '../services/transaction-services.js';
import {
    ResponseUtil,
    ErrorUtil,
    ValidationError,
    NotFoundError,
    ConflictError
} from '../utils/index.js';
import { MESSAGES } from '../constant/index.js';

class TransactionController {

    /**
     * Get all transactions with filters
     * @route GET /api/transactions
     */
    static async getAllTransactions(req, res) {
        try {
            const result = await TransactionService.getAllTransactions(req.query);

            return ResponseUtil.paginated(
                res,
                result.transactions,
                result.pagination,
                'Transactions retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getAllTransactions',
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
     * Get transaction by ID
     * @route GET /api/transactions/:id
     */
    static async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await TransactionService.getTransactionById(id);

            return ResponseUtil.success(
                res,
                transaction,
                'Transaction retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getTransactionById',
                params: req.params
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
     * Get transactions by product ID
     * @route GET /api/transactions/product/:productId
     */
    static async getTransactionsByProductId(req, res) {
        try {
            const { productId } = req.params;
            const filters = { ...req.query, product_id: productId };
            const result = await TransactionService.getAllTransactions(filters);

            return ResponseUtil.paginated(
                res,
                result.transactions,
                result.pagination,
                'Product transactions retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getTransactionsByProductId',
                params: req.params,
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
     * Get transactions by type
     * @route GET /api/transactions/type/:type
     */
    static async getTransactionsByType(req, res) {
        try {
            const { type } = req.params;
            const filters = { ...req.query, type: type };
            const result = await TransactionService.getAllTransactions(filters);

            return ResponseUtil.paginated(
                res,
                result.transactions,
                result.pagination,
                `${type} transactions retrieved successfully`
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getTransactionsByType',
                params: req.params,
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
     * Create new transaction (NOT RECOMMENDED - Use specific operations)
     * @route POST /api/transactions
     * @deprecated Use specific inventory operations instead
     */
    static async createTransaction(req, res) {
        try {
            const transaction = await TransactionService.createTransaction(req.body);

            return ResponseUtil.created(
                res,
                transaction,
                'Transaction created successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'createTransaction',
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
     * Get recent transactions
     * @route GET /api/transactions/recent
     */
    static async getRecentTransactions(req, res) {
        try {
            const { limit = 10 } = req.query;
            const filters = {
                ...req.query,
                limit: parseInt(limit),
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            const result = await TransactionService.getAllTransactions(filters);

            return ResponseUtil.success(
                res,
                result.transactions,
                'Recent transactions retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getRecentTransactions',
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
     * Get transaction statistics
     * @route GET /api/transactions/statistics
     */
    static async getTransactionStatistics(req, res) {
        try {
            const { start_date, end_date } = req.query;
            const statistics = await TransactionService.getTransactionStatistics(
                start_date,
                end_date
            );

            return ResponseUtil.success(
                res,
                statistics,
                'Transaction statistics retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getTransactionStatistics',
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
     * Get stock movement report
     * @route GET /api/transactions/stock-movement
     */
    static async getStockMovement(req, res) {
        try {
            const {
                product_id,
                start_date,
                end_date,
                type,
                limit = 50
            } = req.query;

            const filters = {
                product_id,
                start_date,
                end_date,
                type,
                limit: parseInt(limit),
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            const result = await TransactionService.getAllTransactions(filters);

            // Calculate movement summary
            const summary = {
                total_in: 0,
                total_out: 0,
                total_adjustments: 0,
                net_movement: 0
            };

            result.transactions.forEach(transaction => {
                switch (transaction.type) {
                    case 'stock_in':
                        summary.total_in += transaction.quantity;
                        break;
                    case 'stock_out':
                        summary.total_out += transaction.quantity;
                        break;
                    case 'adjustment':
                        summary.total_adjustments += Math.abs(transaction.quantity);
                        break;
                }
            });

            summary.net_movement = summary.total_in - summary.total_out;

            return ResponseUtil.success(
                res,
                {
                    summary,
                    transactions: result.transactions,
                    pagination: result.pagination
                },
                'Stock movement report generated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getStockMovement',
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
     * Get daily transaction summary
     * @route GET /api/transactions/daily-summary
     */
    static async getDailyTransactionSummary(req, res) {
        try {
            const { date } = req.query;
            const targetDate = date || new Date().toISOString().split('T')[0];

            const filters = {
                start_date: targetDate,
                end_date: targetDate
            };

            const result = await TransactionService.getAllTransactions(filters);

            // Group by type and calculate totals
            const summary = {
                date: targetDate,
                total_transactions: result.transactions.length,
                stock_in: {
                    count: 0,
                    total_quantity: 0
                },
                stock_out: {
                    count: 0,
                    total_quantity: 0
                },
                adjustments: {
                    count: 0,
                    total_quantity: 0
                }
            };

            result.transactions.forEach(transaction => {
                switch (transaction.type) {
                    case 'stock_in':
                        summary.stock_in.count++;
                        summary.stock_in.total_quantity += transaction.quantity;
                        break;
                    case 'stock_out':
                        summary.stock_out.count++;
                        summary.stock_out.total_quantity += transaction.quantity;
                        break;
                    case 'adjustment':
                        summary.adjustments.count++;
                        summary.adjustments.total_quantity += Math.abs(transaction.quantity);
                        break;
                }
            });

            return ResponseUtil.success(
                res,
                summary,
                'Daily transaction summary retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'getDailyTransactionSummary',
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
     * Export transactions to CSV
     * @route GET /api/transactions/export
     */
    static async exportTransactions(req, res) {
        try {
            const filters = { ...req.query, limit: null }; // Remove pagination for export
            const result = await TransactionService.getAllTransactions(filters);

            // Set CSV headers
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');

            // CSV header
            const csvHeader = 'ID,Product SKU,Product Name,Type,Quantity,Previous Quantity,New Quantity,Notes,Created At\n';
            res.write(csvHeader);

            // CSV data
            result.transactions.forEach(transaction => {
                const row = [
                    transaction.id,
                    transaction.Product?.sku || '',
                    transaction.Product?.name || '',
                    transaction.type,
                    transaction.quantity,
                    transaction.previous_quantity,
                    transaction.new_quantity,
                    `"${transaction.notes || ''}"`,
                    transaction.created_at
                ].join(',') + '\n';

                res.write(row);
            });

            res.end();
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'TransactionController',
                method: 'exportTransactions',
                query: req.query
            });

            if (!res.headersSent) {
                if (error instanceof ValidationError) {
                    return ResponseUtil.badRequest(res, error.message, error.errors);
                }

                if (ErrorUtil.isOperationalError(error)) {
                    return ResponseUtil.error(res, error.message, error.statusCode);
                }

                return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
            }
        }
    }
}

export default TransactionController;
