import { Inventory, Product } from '../models/index.js';

class InventoryController {
    // Get all inventory items
    static async getAllInventory(req, res) {
        try {
            const inventory = await Inventory.findAll({
                include: [{
                    model: Product,
                    as: 'product'
                }],
                order: [['updated_at', 'DESC']]
            });

            res.status(200).json({
                success: true,
                message: 'Inventory retrieved successfully',
                data: inventory
            });
        } catch (error) {
            console.error('Get all inventory error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve inventory'
            });
        }
    }

    // Get inventory by product ID
    static async getInventoryByProductId(req, res) {
        try {
            const { productId } = req.params;
            const inventory = await Inventory.findOne({
                where: { product_id: productId },
                include: [{
                    model: Product,
                    as: 'product'
                }]
            });

            if (!inventory) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory not found for this product'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Inventory retrieved successfully',
                data: inventory
            });
        } catch (error) {
            console.error('Get inventory by product ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve inventory'
            });
        }
    }

    // Update inventory stock
    static async updateInventory(req, res) {
        try {
            const { productId } = req.params;
            const { quantity, minimum_stock } = req.body;

            const [updatedRowsCount] = await Inventory.update(
                {
                    quantity,
                    minimum_stock,
                    updated_at: new Date()
                },
                { where: { product_id: productId } }
            );

            if (updatedRowsCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory not found for this product'
                });
            }

            const updatedInventory = await Inventory.findOne({
                where: { product_id: productId },
                include: [{
                    model: Product,
                    as: 'product'
                }]
            });

            res.status(200).json({
                success: true,
                message: 'Inventory updated successfully',
                data: updatedInventory
            });
        } catch (error) {
            console.error('Update inventory error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update inventory'
            });
        }
    }

    // Get low stock items
    static async getLowStockItems(req, res) {
        try {
            const lowStockItems = await Inventory.findAll({
                include: [{
                    model: Product,
                    as: 'product'
                }],
                order: [['quantity', 'ASC']]
            });

            // Filter low stock items in JavaScript (simpler approach)
            const filteredItems = lowStockItems.filter(item =>
                item.quantity <= (item.minimum_stock || 0)
            );

            res.status(200).json({
                success: true,
                message: 'Low stock items retrieved successfully',
                data: filteredItems
            });
        } catch (error) {
            console.error('Get low stock items error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve low stock items'
            });
        }
    }
}

export default InventoryController;
