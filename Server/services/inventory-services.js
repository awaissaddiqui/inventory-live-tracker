import { Inventory, Product, Category, Transaction } from '../routes/index.js';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize.js';
import { TRANSACTION_TYPES, PAGINATION } from '../constant/index.js';
import {
    DatabaseUtil,
    ValidationUtil,
    NotFoundError,
    ValidationError,
    BusinessLogicError
} from '../utils/index.js';

class InventoryService {

    // Get all inventory records with filters
    static async getAllInventory(filters = {}) {
        try {
            // Validate pagination
            const paginationValidation = ValidationUtil.validatePagination(filters);
            if (!paginationValidation.isValid) {
                throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
            }

            const { page, limit } = paginationValidation.sanitized;

            // Build query options
            const queryOptions = DatabaseUtil.buildQueryOptions(filters, {
                searchFields: [], // Search will be handled in product include
                sortableFields: ['current_stock', 'last_updated', 'location'],
                defaultSort: 'last_updated',
                includes: [{
                    association: 'product',
                    include: [{
                        association: 'category',
                        attributes: ['id', 'name']
                    }]
                }]
            });

            // Add custom filters
            const whereConditions = [];

            if (filters.location) {
                whereConditions.push({
                    location: { [Op.iLike]: `%${filters.location}%` }
                });
            }

            if (filters.low_stock) {
                whereConditions.push({
                    current_stock: { [Op.lte]: Sequelize.col('product.minimum_stock') }
                });
            }

            if (filters.out_of_stock) {
                whereConditions.push({ current_stock: 0 });
            }

            // Handle search in product
            if (filters.search) {
                const productInclude = queryOptions.include.find(inc => inc.association === 'product');
                if (productInclude) {
                    productInclude.where = {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${filters.search}%` } },
                            { sku: { [Op.iLike]: `%${filters.search}%` } }
                        ]
                    };
                }
            }

            // Handle category filter
            if (filters.category_id) {
                const productInclude = queryOptions.include.find(inc => inc.association === 'product');
                if (productInclude) {
                    productInclude.where = {
                        ...productInclude.where,
                        category_id: filters.category_id
                    };
                }
            }

            // Combine all where conditions
            const finalWhereClause = DatabaseUtil.combineFilters(whereConditions);

            const { count, rows } = await Inventory.findAndCountAll({
                ...queryOptions,
                where: finalWhereClause
            });

            return {
                inventory: rows,
                pagination: DatabaseUtil.calculatePaginationMeta(count, page, limit)
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new Error(`Failed to get inventory: ${error.message}`);
        }
    }

    // Get inventory by product ID
    static async getInventoryByProductId(productId) {
        try {
            const inventory = await Inventory.findOne({
                where: { product_id: productId },
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{
                        model: Category,
                        as: 'category'
                    }]
                }]
            });

            if (!inventory) {
                throw new NotFoundError('Inventory record not found');
            }

            return inventory;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to get inventory: ${error.message}`);
        }
    }

    // Update stock (with transaction logging)
    static async updateStock(productId, updateData) {
        const dbTransaction = await sequelize.transaction();

        try {
            const {
                quantity,
                transaction_type, // 'IN', 'OUT', 'ADJUSTMENT'
                reference_number,
                notes,
                location
            } = updateData;

            // Validate required fields
            const requiredValidation = ValidationUtil.validateRequired(updateData, [
                'quantity', 'transaction_type'
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

            // Get current inventory
            const inventory = await Inventory.findOne({
                where: { product_id: productId },
                include: [{
                    model: Product,
                    as: 'product'
                }],
                transaction: dbTransaction
            });

            if (!inventory) {
                throw new NotFoundError('Inventory record not found');
            }

            // Calculate new stock based on transaction type
            let newStock = inventory.current_stock;
            let transactionQuantity = ValidationUtil.sanitizeNumber(quantity, true);

            switch (transaction_type) {
                case TRANSACTION_TYPES.IN:
                    newStock += transactionQuantity;
                    break;
                case TRANSACTION_TYPES.OUT:
                    if (transactionQuantity > inventory.current_stock) {
                        throw new BusinessLogicError('Insufficient stock for this transaction');
                    }
                    newStock -= transactionQuantity;
                    transactionQuantity = -transactionQuantity; // Store as negative for OUT transactions
                    break;
                case TRANSACTION_TYPES.ADJUSTMENT:
                    newStock = transactionQuantity;
                    transactionQuantity = transactionQuantity - inventory.current_stock;
                    break;
            }

            if (newStock < 0) {
                throw new BusinessLogicError('Stock cannot be negative');
            }

            // Update inventory
            await inventory.update({
                current_stock: newStock,
                location: ValidationUtil.sanitizeString(location) || inventory.location,
                last_updated: new Date()
            }, { transaction: dbTransaction });

            // Create transaction record
            await Transaction.create({
                product_id: productId,
                transaction_type,
                quantity: Math.abs(transactionQuantity),
                reference_number: ValidationUtil.sanitizeString(reference_number),
                notes: ValidationUtil.sanitizeString(notes),
                transaction_date: new Date()
            }, { transaction: dbTransaction });

            await dbTransaction.commit();

            // Return updated inventory
            return await this.getInventoryByProductId(productId);
        } catch (error) {
            await dbTransaction.rollback();
            if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof BusinessLogicError) {
                throw error;
            }
            throw new Error(`Failed to update stock: ${error.message}`);
        }
    }

    // Reserve stock
    static async reserveStock(productId, quantity) {
        try {
            const inventory = await Inventory.findOne({
                where: { product_id: productId }
            });

            if (!inventory) {
                throw new Error('Inventory record not found');
            }

            const availableStock = inventory.current_stock - inventory.reserved_stock;

            if (quantity > availableStock) {
                throw new Error('Insufficient available stock for reservation');
            }

            await inventory.update({
                reserved_stock: inventory.reserved_stock + parseInt(quantity),
                last_updated: new Date()
            });

            return await this.getInventoryByProductId(productId);
        } catch (error) {
            throw new Error(`Failed to reserve stock: ${error.message}`);
        }
    }

    // Release reserved stock
    static async releaseStock(productId, quantity) {
        try {
            const inventory = await Inventory.findOne({
                where: { product_id: productId }
            });

            if (!inventory) {
                throw new Error('Inventory record not found');
            }

            if (quantity > inventory.reserved_stock) {
                throw new Error('Cannot release more stock than is reserved');
            }

            await inventory.update({
                reserved_stock: inventory.reserved_stock - parseInt(quantity),
                last_updated: new Date()
            });

            return await this.getInventoryByProductId(productId);
        } catch (error) {
            throw new Error(`Failed to release stock: ${error.message}`);
        }
    }

    // Get low stock items
    static async getLowStockItems() {
        try {
            const lowStockItems = await Inventory.findAll({
                where: {
                    current_stock: {
                        [Op.lte]: Sequelize.col('product.minimum_stock')
                    }
                },
                include: [{
                    model: Product,
                    as: 'product',
                    where: { is_active: true },
                    include: [{
                        model: Category,
                        as: 'category'
                    }]
                }],
                order: [['current_stock', 'ASC']]
            });

            return lowStockItems.map(item => ({
                ...item.toJSON(),
                shortage: item.product.minimum_stock - item.current_stock
            }));
        } catch (error) {
            throw new Error(`Failed to get low stock items: ${error.message}`);
        }
    }

    // Get out of stock items
    static async getOutOfStockItems() {
        try {
            const outOfStockItems = await Inventory.findAll({
                where: { current_stock: 0 },
                include: [{
                    model: Product,
                    as: 'product',
                    where: { is_active: true },
                    include: [{
                        model: Category,
                        as: 'category'
                    }]
                }],
                order: [['last_updated', 'DESC']]
            });

            return outOfStockItems;
        } catch (error) {
            throw new Error(`Failed to get out of stock items: ${error.message}`);
        }
    }

    // Update inventory location
    static async updateLocation(productId, location) {
        try {
            const inventory = await Inventory.findOne({
                where: { product_id: productId }
            });

            if (!inventory) {
                throw new Error('Inventory record not found');
            }

            await inventory.update({
                location: location.trim(),
                last_updated: new Date()
            });

            return await this.getInventoryByProductId(productId);
        } catch (error) {
            throw new Error(`Failed to update location: ${error.message}`);
        }
    }
}

export default InventoryService;