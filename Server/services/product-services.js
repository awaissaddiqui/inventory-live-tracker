import { Product, Category, Inventory, Transaction } from '../routes/index.js';
import { Op } from 'sequelize';
import { PRODUCT_UNITS, DATABASE_CONSTRAINTS, PAGINATION } from '../constant/index.js';
import {
    DatabaseUtil,
    ValidationUtil,
    StringUtil,
    NotFoundError,
    ValidationError,
    ConflictError
} from '../utils/index.js';

class ProductService {

    // Get all products with filters
    static async getAllProducts(filters = {}) {
        try {
            // Validate pagination
            const paginationValidation = ValidationUtil.validatePagination(filters);
            if (!paginationValidation.isValid) {
                throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
            }

            const { page, limit } = paginationValidation.sanitized;

            // Build query options
            const queryOptions = DatabaseUtil.buildQueryOptions(filters, {
                searchFields: ['name', 'sku', 'barcode'],
                sortableFields: ['name', 'sku', 'price', 'created_at', 'updated_at'],
                defaultSort: 'created_at',
                includes: [
                    {
                        association: 'category',
                        attributes: ['id', 'name']
                    },
                    {
                        association: 'inventory',
                        attributes: ['current_stock', 'reserved_stock', 'location', 'last_updated']
                    }
                ]
            });

            // Add custom filters
            const whereConditions = [];

            if (filters.category_id) {
                whereConditions.push({ category_id: filters.category_id });
            }

            if (filters.is_active !== undefined) {
                whereConditions.push(
                    DatabaseUtil.buildBooleanFilter(filters.is_active, 'is_active')
                );
            }

            // Add low stock filter if requested
            if (filters.low_stock) {
                // This will be handled in the include clause
                const inventoryInclude = queryOptions.include.find(inc => inc.association === 'inventory');
                if (inventoryInclude) {
                    inventoryInclude.where = {
                        current_stock: { [Op.lte]: Op.col('Product.minimum_stock') }
                    };
                }
            }

            // Combine all where conditions
            const finalWhereClause = DatabaseUtil.combineFilters([queryOptions.where, ...whereConditions]);

            const { count, rows } = await Product.findAndCountAll({
                ...queryOptions,
                where: finalWhereClause
            });

            return {
                products: rows,
                pagination: DatabaseUtil.calculatePaginationMeta(count, page, limit)
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new Error(`Failed to get products: ${error.message}`);
        }
    }

    // Get product by ID
    static async getProductById(id) {
        try {
            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: Inventory,
                        as: 'inventory'
                    },
                    {
                        model: Transaction,
                        as: 'transactions',
                        limit: 10,
                        order: [['transaction_date', 'DESC']]
                    }
                ]
            });

            if (!product) {
                throw new Error('Product not found');
            }

            return product;
        } catch (error) {
            throw new Error(`Failed to get product: ${error.message}`);
        }
    }

    // Create new product
    static async createProduct(productData) {
        try {
            const {
                sku,
                name,
                description,
                category_id,
                price,
                cost_price,
                unit = 'pcs',
                barcode,
                minimum_stock = 0,
                maximum_stock = 1000,
                initial_stock = 0,
                location
            } = productData;

            // Check if SKU already exists
            const existingSKU = await Product.findOne({
                where: { sku: sku.trim().toUpperCase() }
            });

            if (existingSKU) {
                throw new Error('SKU already exists');
            }

            // Check if barcode already exists (if provided)
            if (barcode) {
                const existingBarcode = await Product.findOne({
                    where: { barcode: barcode.trim() }
                });

                if (existingBarcode) {
                    throw new Error('Barcode already exists');
                }
            }

            // Verify category exists
            const category = await Category.findByPk(category_id);
            if (!category) {
                throw new Error('Category not found');
            }

            // Create product
            const product = await Product.create({
                sku: sku.trim().toUpperCase(),
                name: name.trim(),
                description: description?.trim(),
                category_id,
                price: parseFloat(price),
                cost_price: cost_price ? parseFloat(cost_price) : null,
                unit,
                barcode: barcode?.trim(),
                minimum_stock: parseInt(minimum_stock),
                maximum_stock: parseInt(maximum_stock),
                is_active: true
            });

            // Create initial inventory record
            await Inventory.create({
                product_id: product.id,
                current_stock: parseInt(initial_stock),
                reserved_stock: 0,
                location: location?.trim(),
                last_updated: new Date()
            });

            // Create initial transaction if stock > 0
            if (initial_stock > 0) {
                await Transaction.create({
                    product_id: product.id,
                    transaction_type: 'IN',
                    quantity: parseInt(initial_stock),
                    reference_number: `INITIAL-${product.sku}`,
                    notes: 'Initial stock entry',
                    transaction_date: new Date()
                });
            }

            // Return product with relations
            return await this.getProductById(product.id);
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    // Update product
    static async updateProduct(id, updateData) {
        try {
            const product = await Product.findByPk(id);

            if (!product) {
                throw new Error('Product not found');
            }

            // Check SKU uniqueness if being updated
            if (updateData.sku && updateData.sku !== product.sku) {
                const existingSKU = await Product.findOne({
                    where: {
                        sku: updateData.sku.trim().toUpperCase(),
                        id: { [Op.ne]: id }
                    }
                });

                if (existingSKU) {
                    throw new Error('SKU already exists');
                }
            }

            // Check barcode uniqueness if being updated
            if (updateData.barcode && updateData.barcode !== product.barcode) {
                const existingBarcode = await Product.findOne({
                    where: {
                        barcode: updateData.barcode.trim(),
                        id: { [Op.ne]: id }
                    }
                });

                if (existingBarcode) {
                    throw new Error('Barcode already exists');
                }
            }

            // Verify category exists if being updated
            if (updateData.category_id && updateData.category_id !== product.category_id) {
                const category = await Category.findByPk(updateData.category_id);
                if (!category) {
                    throw new Error('Category not found');
                }
            }

            // Update product
            await product.update({
                sku: updateData.sku?.trim().toUpperCase() || product.sku,
                name: updateData.name?.trim() || product.name,
                description: updateData.description?.trim() || product.description,
                category_id: updateData.category_id || product.category_id,
                price: updateData.price ? parseFloat(updateData.price) : product.price,
                cost_price: updateData.cost_price !== undefined ?
                    (updateData.cost_price ? parseFloat(updateData.cost_price) : null) : product.cost_price,
                unit: updateData.unit || product.unit,
                barcode: updateData.barcode?.trim() || product.barcode,
                minimum_stock: updateData.minimum_stock !== undefined ?
                    parseInt(updateData.minimum_stock) : product.minimum_stock,
                maximum_stock: updateData.maximum_stock !== undefined ?
                    parseInt(updateData.maximum_stock) : product.maximum_stock,
                is_active: updateData.is_active !== undefined ? updateData.is_active : product.is_active
            });

            return await this.getProductById(id);
        } catch (error) {
            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    // Delete product (soft delete)
    static async deleteProduct(id) {
        try {
            const product = await Product.findByPk(id, {
                include: [{
                    model: Inventory,
                    as: 'inventory'
                }]
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Check if product has stock
            if (product.inventory && product.inventory.current_stock > 0) {
                throw new Error('Cannot delete product with current stock. Please adjust stock to zero first.');
            }

            // Soft delete
            await product.update({ is_active: false });

            return { message: 'Product deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    // Get product by SKU
    static async getProductBySKU(sku) {
        try {
            const product = await Product.findOne({
                where: { sku: sku.trim().toUpperCase() },
                include: [
                    {
                        model: Category,
                        as: 'category'
                    },
                    {
                        model: Inventory,
                        as: 'inventory'
                    }
                ]
            });

            if (!product) {
                throw new Error('Product not found');
            }

            return product;
        } catch (error) {
            throw new Error(`Failed to get product by SKU: ${error.message}`);
        }
    }

    // Get product by barcode
    static async getProductByBarcode(barcode) {
        try {
            const product = await Product.findOne({
                where: { barcode: barcode.trim() },
                include: [
                    {
                        model: Category,
                        as: 'category'
                    },
                    {
                        model: Inventory,
                        as: 'inventory'
                    }
                ]
            });

            if (!product) {
                throw new Error('Product not found');
            }

            return product;
        } catch (error) {
            throw new Error(`Failed to get product by barcode: ${error.message}`);
        }
    }
}

export default ProductService;