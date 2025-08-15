import { Category } from '../models/index.js';

class CategoryController {
    // Get all categories
    static async getAllCategories(req, res) {
        try {
            const categories = await Category.findAll({
                order: [['name', 'ASC']]
            });

            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: categories
            });
        } catch (error) {
            console.error('Get all categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve categories'
            });
        }
    }

    // Get category by ID
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Category retrieved successfully',
                data: category
            });
        } catch (error) {
            console.error('Get category by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve category'
            });
        }
    }

    // Create new category
    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required'
                });
            }

            const category = await Category.create({
                name,
                description: description || '',
                is_active: true
            });

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create category'
            });
        }
    }

    // Update category
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const [updatedRowsCount] = await Category.update(updateData, {
                where: { id }
            });

            if (updatedRowsCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const updatedCategory = await Category.findByPk(id);

            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory
            });
        } catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update category'
            });
        }
    }

    // Delete category
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const deletedRowsCount = await Category.destroy({
                where: { id }
            });

            if (deletedRowsCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete category'
            });
        }
    }
}

export default CategoryController;
