import { Category, Product } from '../routes/index.js';
import { Op } from 'sequelize';
import { PAGINATION, DATABASE_CONSTRAINTS } from '../constant/index.js';
import {
    DatabaseUtil,
    ValidationUtil,
    StringUtil,
    NotFoundError,
    ValidationError,
    ConflictError
} from '../utils/index.js';

class CategoryService {

    // Get all categories with optional filters
    static async getAllCategories(filters = {}) {
        try {
            // Validate pagination
            const paginationValidation = ValidationUtil.validatePagination(filters);
            if (!paginationValidation.isValid) {
                throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
            }

            const { page, limit } = paginationValidation.sanitized;

            // Build query options
            const queryOptions = DatabaseUtil.buildQueryOptions(filters, {
                searchFields: ['name'],
                sortableFields: ['name', 'created_at', 'updated_at'],
                defaultSort: 'created_at',
                includes: [{
                    association: 'products',
                    attributes: ['id'],
                    required: false
                }]
            });

            // Add custom filters
            const whereConditions = [];

            if (filters.is_active !== undefined) {
                whereConditions.push(
                    DatabaseUtil.buildBooleanFilter(filters.is_active, 'is_active')
                );
            }

            // Combine all where conditions
            const finalWhereClause = DatabaseUtil.combineFilters([queryOptions.where, ...whereConditions]);

            const { count, rows } = await Category.findAndCountAll({
                ...queryOptions,
                where: finalWhereClause
            });

            // Add product count to each category
            const categoriesWithCount = rows.map(category => ({
                ...category.toJSON(),
                product_count: category.products.length
            }));

            return {
                categories: categoriesWithCount,
                pagination: DatabaseUtil.calculatePaginationMeta(count, page, limit)
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new Error(`Failed to get categories: ${error.message}`);
        }
    }

    // Get category by ID
    static async getCategoryById(id) {
        try {
            const category = await Category.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'sku', 'price', 'is_active'],
                    include: [{
                        model: 'Inventory',
                        as: 'inventory',
                        attributes: ['current_stock', 'available_stock']
                    }]
                }]
            });

            if (!category) {
                throw new NotFoundError('Category not found');
            }

            return category;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to get category: ${error.message}`);
        }
    }

    // Create new category
    static async createCategory(categoryData) {
        try {
            const { name, description, is_active = true } = categoryData;

            // Validate required fields
            const requiredValidation = ValidationUtil.validateRequired(categoryData, ['name']);
            if (!requiredValidation.isValid) {
                throw new ValidationError('Missing required fields', requiredValidation.errors);
            }

            // Validate name length
            const nameValidation = ValidationUtil.validateStringLength(name, 'name', {
                required: true,
                min: DATABASE_CONSTRAINTS.CATEGORY_NAME.MIN_LENGTH,
                max: DATABASE_CONSTRAINTS.CATEGORY_NAME.MAX_LENGTH
            });
            if (!nameValidation.isValid) {
                throw new ValidationError('Invalid category name', nameValidation.errors);
            }

            // Check if category name already exists
            const trimmedName = StringUtil.normalizeWhitespace(name);
            const existingCategory = await Category.findOne({
                where: { name: { [Op.iLike]: trimmedName } }
            });

            if (existingCategory) {
                throw new ConflictError('Category name already exists');
            }

            const category = await Category.create({
                name: trimmedName,
                description: ValidationUtil.sanitizeString(description),
                is_active: Boolean(is_active)
            });

            return category;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof ConflictError) {
                throw error;
            }
            throw new Error(`Failed to create category: ${error.message}`);
        }
    }

    // Update category
    static async updateCategory(id, updateData) {
        try {
            const category = await Category.findByPk(id);

            if (!category) {
                throw new Error('Category not found');
            }

            // Check if new name conflicts with existing category
            if (updateData.name && updateData.name !== category.name) {
                const existingCategory = await Category.findOne({
                    where: {
                        name: { [Op.iLike]: updateData.name.trim() },
                        id: { [Op.ne]: id }
                    }
                });

                if (existingCategory) {
                    throw new Error('Category name already exists');
                }
            }

            // Update category
            await category.update({
                name: updateData.name?.trim() || category.name,
                description: updateData.description?.trim() || category.description,
                is_active: updateData.is_active !== undefined ? updateData.is_active : category.is_active
            });

            return category;
        } catch (error) {
            throw new Error(`Failed to update category: ${error.message}`);
        }
    }

    // Delete category (soft delete by setting is_active to false)
    static async deleteCategory(id) {
        try {
            const category = await Category.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'products',
                    where: { is_active: true },
                    required: false
                }]
            });

            if (!category) {
                throw new Error('Category not found');
            }

            // Check if category has active products
            if (category.products && category.products.length > 0) {
                throw new Error('Cannot delete category with active products. Please deactivate or move products first.');
            }

            // Soft delete
            await category.update({ is_active: false });

            return { message: 'Category deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete category: ${error.message}`);
        }
    }

    // Get category statistics
    static async getCategoryStats(id) {
        try {
            const category = await Category.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'products',
                    include: [{
                        model: 'Inventory',
                        as: 'inventory',
                        attributes: ['current_stock']
                    }]
                }]
            });

            if (!category) {
                throw new Error('Category not found');
            }

            const stats = {
                total_products: category.products.length,
                active_products: category.products.filter(p => p.is_active).length,
                total_stock: category.products.reduce((sum, product) => {
                    return sum + (product.inventory?.current_stock || 0);
                }, 0),
                total_value: category.products.reduce((sum, product) => {
                    return sum + (parseFloat(product.price) * (product.inventory?.current_stock || 0));
                }, 0)
            };

            return {
                category: category.toJSON(),
                stats
            };
        } catch (error) {
            throw new Error(`Failed to get category stats: ${error.message}`);
        }
    }
}

export default CategoryService;