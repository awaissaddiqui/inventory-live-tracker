import { Product, Category } from '../models/index.js';

class ProductController {
    // Get all products
    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll({
                include: [{
                    model: Category,
                    as: 'category'
                }],
                order: [['name', 'ASC']]
            });

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: products
            });
        } catch (error) {
            console.error('Get all products error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve products'
            });
        }
    }

    // Get product by ID
    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByPk(id, {
                include: [{
                    model: Category,
                    as: 'category'
                }]
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product retrieved successfully',
                data: product
            });
        } catch (error) {
            console.error('Get product by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve product'
            });
        }
    }

    // Create new product
    static async createProduct(req, res) {
        try {
            const { name, description, price, sku, category_id } = req.body;

            if (!name || !price || !sku) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, price, and SKU are required'
                });
            }

            const product = await Product.create({
                name,
                description: description || '',
                price,
                sku,
                category_id,
                is_active: true
            });

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create product'
            });
        }
    }

    // Update product
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const [updatedRowsCount] = await Product.update(updateData, {
                where: { id }
            });

            if (updatedRowsCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            const updatedProduct = await Product.findByPk(id, {
                include: [{
                    model: Category,
                    as: 'category'
                }]
            });

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: updatedProduct
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update product'
            });
        }
    }

    // Delete product
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const deletedRowsCount = await Product.destroy({
                where: { id }
            });

            if (deletedRowsCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete product'
            });
        }
    }
}

export default ProductController;
