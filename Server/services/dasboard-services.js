import { Category, Product, Inventory, Transaction } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../config/sequelize.js';

class DashboardService {

    // Get overall inventory statistics
    static async getInventoryStats() {
        try {
            const stats = await Inventory.findAll({
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_products'],
                    [Sequelize.fn('SUM', Sequelize.col('current_stock')), 'total_stock'],
                    [Sequelize.fn('SUM', Sequelize.col('reserved_stock')), 'total_reserved'],
                    [Sequelize.fn('AVG', Sequelize.col('current_stock')), 'avg_stock_per_product']
                ],
                raw: true
            });

            const totalValue = await Product.findAll({
                include: [{
                    model: Inventory,
                    as: 'inventory',
                    attributes: ['current_stock']
                }],
                attributes: ['price'],
                raw: true
            });

            let inventoryValue = 0;
            totalValue.forEach(item => {
                inventoryValue += parseFloat(item.price) * parseInt(item['inventory.current_stock'] || 0);
            });

            return {
                ...stats[0],
                total_inventory_value: inventoryValue.toFixed(2),
                available_stock: parseInt(stats[0].total_stock || 0) - parseInt(stats[0].total_reserved || 0)
            };
        } catch (error) {
            throw new Error(`Failed to get inventory stats: ${error.message}`);
        }
    }

    // Get low stock alerts
    static async getLowStockAlerts() {
        try {
            const lowStockProducts = await Product.findAll({
                include: [{
                    model: Inventory,
                    as: 'inventory',
                    where: {
                        current_stock: {
                            [Op.lte]: Sequelize.col('Product.minimum_stock')
                        }
                    }
                }, {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }],
                attributes: ['id', 'name', 'sku', 'minimum_stock'],
                where: {
                    is_active: true
                }
            });

            return lowStockProducts.map(product => ({
                id: product.id,
                name: product.name,
                sku: product.sku,
                category: product.category.name,
                current_stock: product.inventory.current_stock,
                minimum_stock: product.minimum_stock,
                shortage: product.minimum_stock - product.inventory.current_stock
            }));
        } catch (error) {
            throw new Error(`Failed to get low stock alerts: ${error.message}`);
        }
    }

    // Get recent transactions
    static async getRecentTransactions(limit = 10) {
        try {
            const transactions = await Transaction.findAll({
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'sku'],
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['name']
                    }]
                }],
                order: [['transaction_date', 'DESC']],
                limit: limit
            });

            return transactions.map(transaction => ({
                id: transaction.id,
                product_name: transaction.product.name,
                product_sku: transaction.product.sku,
                category: transaction.product.category.name,
                transaction_type: transaction.transaction_type,
                quantity: transaction.quantity,
                reference_number: transaction.reference_number,
                transaction_date: transaction.transaction_date,
                notes: transaction.notes
            }));
        } catch (error) {
            throw new Error(`Failed to get recent transactions: ${error.message}`);
        }
    }

    // Get category-wise stock distribution
    static async getCategoryWiseStock() {
        try {
            const categoryStats = await Category.findAll({
                include: [{
                    model: Product,
                    as: 'products',
                    include: [{
                        model: Inventory,
                        as: 'inventory',
                        attributes: ['current_stock']
                    }],
                    attributes: ['id', 'price']
                }],
                attributes: ['id', 'name']
            });

            return categoryStats.map(category => {
                const totalProducts = category.products.length;
                const totalStock = category.products.reduce((sum, product) => {
                    return sum + (product.inventory?.current_stock || 0);
                }, 0);
                const totalValue = category.products.reduce((sum, product) => {
                    return sum + (parseFloat(product.price) * (product.inventory?.current_stock || 0));
                }, 0);

                return {
                    category_id: category.id,
                    category_name: category.name,
                    total_products: totalProducts,
                    total_stock: totalStock,
                    total_value: totalValue.toFixed(2)
                };
            });
        } catch (error) {
            throw new Error(`Failed to get category-wise stock: ${error.message}`);
        }
    }

    // Get stock movement trends (last 30 days)
    static async getStockMovementTrends() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const movements = await Transaction.findAll({
                attributes: [
                    [Sequelize.fn('DATE', Sequelize.col('transaction_date')), 'date'],
                    'transaction_type',
                    [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity']
                ],
                where: {
                    transaction_date: {
                        [Op.gte]: thirtyDaysAgo
                    }
                },
                group: [
                    Sequelize.fn('DATE', Sequelize.col('transaction_date')),
                    'transaction_type'
                ],
                order: [[Sequelize.fn('DATE', Sequelize.col('transaction_date')), 'ASC']],
                raw: true
            });

            // Group by date and organize by transaction type
            const groupedMovements = {};
            movements.forEach(movement => {
                const date = movement.date;
                if (!groupedMovements[date]) {
                    groupedMovements[date] = { date, IN: 0, OUT: 0, ADJUSTMENT: 0 };
                }
                groupedMovements[date][movement.transaction_type] = parseInt(movement.total_quantity);
            });

            return Object.values(groupedMovements);
        } catch (error) {
            throw new Error(`Failed to get stock movement trends: ${error.message}`);
        }
    }

    // Get top selling products (based on OUT transactions)
    static async getTopSellingProducts(limit = 5) {
        try {
            const topProducts = await Transaction.findAll({
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'sku'],
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['name']
                    }]
                }],
                attributes: [
                    'product_id',
                    [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_sold']
                ],
                where: {
                    transaction_type: 'OUT'
                },
                group: ['product_id', 'product.id', 'product.name', 'product.sku', 'product.category.id', 'product.category.name'],
                order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],
                limit: limit
            });

            return topProducts.map(item => ({
                product_id: item.product_id,
                product_name: item.product.name,
                product_sku: item.product.sku,
                category: item.product.category.name,
                total_sold: parseInt(item.dataValues.total_sold)
            }));
        } catch (error) {
            throw new Error(`Failed to get top selling products: ${error.message}`);
        }
    }

    // Get complete dashboard data
    static async getDashboardData() {
        try {
            const [
                inventoryStats,
                lowStockAlerts,
                recentTransactions,
                categoryWiseStock,
                stockMovementTrends,
                topSellingProducts
            ] = await Promise.all([
                this.getInventoryStats(),
                this.getLowStockAlerts(),
                this.getRecentTransactions(10),
                this.getCategoryWiseStock(),
                this.getStockMovementTrends(),
                this.getTopSellingProducts(5)
            ]);

            return {
                inventory_stats: inventoryStats,
                low_stock_alerts: lowStockAlerts,
                recent_transactions: recentTransactions,
                category_wise_stock: categoryWiseStock,
                stock_movement_trends: stockMovementTrends,
                top_selling_products: topSellingProducts,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Failed to get dashboard data: ${error.message}`);
        }
    }
}

export default DashboardService;