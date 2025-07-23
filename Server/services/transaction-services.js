import { Transaction, Product, Category } from '../routes/index.js';
import { Op } from 'sequelize';
import { TRANSACTION_TYPES, PAGINATION } from '../constant/index.js';
import { DatabaseUtil, ValidationUtil, NotFoundError, ValidationError } from '../utils/index.js';

class TransactionService {

    // Get all transactions with filters
    static async getAllTransactions(filters = {}) {
        try {
            // Validate pagination
            const paginationValidation = ValidationUtil.validatePagination(filters);
            if (!paginationValidation.isValid) {
                throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
            }

            const { page, limit } = paginationValidation.sanitized;

            // Build query options using DatabaseUtil
            const queryOptions = DatabaseUtil.buildQueryOptions(filters, {
                searchFields: ['reference_number'],
                sortableFields: ['transaction_date', 'quantity', 'transaction_type', 'created_at'],
                defaultSort: 'transaction_date',
                includes: [{
                    association: 'product',
                    attributes: ['id', 'name', 'sku'],
                    include: [{
                        association: 'category',
                        attributes: ['id', 'name']
                    }]
                }]
            });

            // Add custom filters
            const whereConditions = [];

            if (filters.product_id) {
                whereConditions.push({ product_id: filters.product_id });
            }

            if (filters.transaction_type) {
                // Validate transaction type
                const typeValidation = ValidationUtil.validateTransactionType(filters.transaction_type);
                if (!typeValidation.isValid) {
                    throw new ValidationError('Invalid transaction type', typeValidation.errors);
                }
                whereConditions.push({ transaction_type: filters.transaction_type });
            }

            if (filters.reference_number) {
                whereConditions.push({
                    reference_number: { [Op.iLike]: `%${filters.reference_number}%` }
                });
            }

            // Add date range filter
            if (filters.start_date || filters.end_date) {
                whereConditions.push(
                    DatabaseUtil.buildDateRangeFilter(filters.start_date, filters.end_date, 'transaction_date')
                );
            }

            // Combine all where conditions
            const finalWhereClause = DatabaseUtil.combineFilters([queryOptions.where, ...whereConditions]);

            const { count, rows } = await Transaction.findAndCountAll({
                ...queryOptions,
                where: finalWhereClause
            });

            return {
                transactions: rows,
                pagination: DatabaseUtil.calculatePaginationMeta(count, page, limit)
            };
        } catch (error) {
            throw new Error(`Failed to get transactions: ${error.message}`);
        }
    }

    // Get transaction by ID
    static async getTransactionById(id) {
        try {
            const transaction = await Transaction.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{
                        model: Category,
                        as: 'category'
                    }]
                }]
            });

            if (!transaction) {
                throw new NotFoundError('Transaction not found');
            }

            return transaction;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to get transaction: ${error.message}`);
        }
    }

    // Get transactions by product ID
    static async getTransactionsByProduct(productId, filters = {}) {
        try {
            // Validate pagination
            const paginationValidation = ValidationUtil.validatePagination(filters);
            if (!paginationValidation.isValid) {
                throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
            }

            const { page, limit } = paginationValidation.sanitized;
            const pagination = DatabaseUtil.buildPagination(page, limit);

            const whereClause = { product_id: productId };

            if (filters.transaction_type) {
                const typeValidation = ValidationUtil.validateTransactionType(filters.transaction_type);
                if (!typeValidation.isValid) {
                    throw new ValidationError('Invalid transaction type', typeValidation.errors);
                }
                whereClause.transaction_type = filters.transaction_type;
            }

            const { count, rows } = await Transaction.findAndCountAll({
                where: whereClause,
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku']
                }],
                ...pagination,
                order: [['transaction_date', 'DESC']],
                distinct: true
            });

            return {
                transactions: rows,
                pagination: DatabaseUtil.calculatePaginationMeta(count, page, limit)
            };
        } catch (error) {
            throw new Error(`Failed to get product transactions: ${error.message}`);
        }
    }

    // Get transaction summary by date range
    static async getTransactionSummary(startDate, endDate) {
        try {
            const whereClause = {};

            if (startDate || endDate) {
                Object.assign(whereClause,
                    DatabaseUtil.buildDateRangeFilter(startDate, endDate, 'transaction_date')
                );
            }

            const transactions = await Transaction.findAll({
                where: whereClause,
                attributes: [
                    'transaction_type',
                    [Op.fn('COUNT', Op.col('id')), 'count'],
                    [Op.fn('SUM', Op.col('quantity')), 'total_quantity']
                ],
                group: ['transaction_type'],
                raw: true
            });

            // Initialize summary with all transaction types
            const summary = {};
            Object.values(TRANSACTION_TYPES).forEach(type => {
                summary[type] = { count: 0, total_quantity: 0 };
            });

            // Populate with actual data
            transactions.forEach(transaction => {
                summary[transaction.transaction_type] = {
                    count: parseInt(transaction.count),
                    total_quantity: parseInt(transaction.total_quantity)
                };
            });

            return summary;
        } catch (error) {
            throw new Error(`Failed to get transaction summary: ${error.message}`);
        }
    }

    // Create manual transaction (for adjustments)
    static async createTransaction(transactionData) {
        try {
            const {
                product_id,
                transaction_type,
                quantity,
                reference_number,
                notes
            } = transactionData;

            // Validate required fields
            const requiredValidation = ValidationUtil.validateRequired(transactionData, [
                'product_id', 'transaction_type', 'quantity'
            ]);
            if (!requiredValidation.isValid) {
                throw new ValidationError('Missing required fields', requiredValidation.errors);
            }

            // Validate transaction type
            const typeValidation = ValidationUtil.validateTransactionType(transaction_type);
            if (!typeValidation.isValid) {
                throw new ValidationError('Invalid transaction type', typeValidation.errors);
            }

            // Validate quantity
            const quantityValidation = ValidationUtil.validateNumeric(quantity, 'quantity', {
                required: true,
                min: 1,
                integer: true
            });
            if (!quantityValidation.isValid) {
                throw new ValidationError('Invalid quantity', quantityValidation.errors);
            }

            // Verify product exists
            const product = await Product.findByPk(product_id);
            if (!product) {
                throw new NotFoundError('Product not found');
            }

            const transaction = await Transaction.create({
                product_id,
                transaction_type,
                quantity: ValidationUtil.sanitizeNumber(quantity, true),
                reference_number: ValidationUtil.sanitizeString(reference_number),
                notes: ValidationUtil.sanitizeString(notes),
                transaction_date: new Date()
            });

            return await this.getTransactionById(transaction.id);
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to create transaction: ${error.message}`);
        }
    }

    // Get recent transactions
    static async getRecentTransactions(limit = PAGINATION.DEFAULT_LIMIT) {
        try {
            // Validate limit
            const limitValidation = ValidationUtil.validateNumeric(limit, 'limit', {
                min: 1,
                max: PAGINATION.MAX_LIMIT,
                integer: true
            });

            const sanitizedLimit = limitValidation.isValid
                ? ValidationUtil.sanitizeNumber(limit, true)
                : PAGINATION.DEFAULT_LIMIT;

            const transactions = await Transaction.findAll({
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku'],
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['name']
                    }]
                }],
                limit: sanitizedLimit,
                order: [['transaction_date', 'DESC']]
            });

            return transactions;
        } catch (error) {
            throw new Error(`Failed to get recent transactions: ${error.message}`);
        }
    }
}

export default TransactionService;