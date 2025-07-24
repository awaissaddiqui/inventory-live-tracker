import DashboardService from '../services/dasboard-services.js';
import { ResponseUtil, ErrorUtil } from '../utils/index.js';
import { MESSAGES } from '../constant/index.js';

class DashboardController {

    /**
     * Get complete dashboard data
     * @route GET /api/dashboard
     */
    static async getDashboard(req, res) {
        try {
            const dashboardData = await DashboardService.getDashboardData();

            return ResponseUtil.success(
                res,
                dashboardData,
                'Dashboard data retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getDashboard' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get inventory statistics only
     * @route GET /api/dashboard/stats  
     */
    static async getInventoryStats(req, res) {
        try {
            const stats = await DashboardService.getInventoryStats();

            return ResponseUtil.success(
                res,
                stats,
                'Inventory statistics retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getInventoryStats' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get low stock alerts
     * @route GET /api/dashboard/alerts
     */
    static async getLowStockAlerts(req, res) {
        try {
            const alerts = await DashboardService.getLowStockAlerts();

            return ResponseUtil.success(
                res,
                alerts,
                'Low stock alerts retrieved successfully',
                200,
                { count: alerts.length }
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getLowStockAlerts' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get recent transactions
     * @route GET /api/dashboard/transactions
     */
    static async getRecentTransactions(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const transactions = await DashboardService.getRecentTransactions(limit);

            return ResponseUtil.success(
                res,
                transactions,
                'Recent transactions retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getRecentTransactions' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get stock movement trends
     * @route GET /api/dashboard/trends
     */
    static async getStockMovementTrends(req, res) {
        try {
            const trends = await DashboardService.getStockMovementTrends();

            return ResponseUtil.success(
                res,
                trends,
                'Stock movement trends retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getStockMovementTrends' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get category-wise stock distribution
     * @route GET /api/dashboard/categories
     */
    static async getCategoryWiseStock(req, res) {
        try {
            const categoryStats = await DashboardService.getCategoryWiseStock();

            return ResponseUtil.success(
                res,
                categoryStats,
                'Category-wise stock data retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getCategoryWiseStock' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get top selling products
     * @route GET /api/dashboard/top-products
     */
    static async getTopSellingProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const topProducts = await DashboardService.getTopSellingProducts(limit);

            return ResponseUtil.success(
                res,
                topProducts,
                'Top selling products retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, { controller: 'DashboardController', method: 'getTopSellingProducts' });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }
}

export default DashboardController;
