import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { auth, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Main dashboard data (accessible to all authenticated users)
router.get('/',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getDashboard
);

// Dashboard components
router.get('/stats',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getInventoryStats
);

router.get('/alerts',
    validateRequest(commonValidators.validatePagination, 'query'),
    DashboardController.getLowStockAlerts
);

router.get('/transactions/recent',
    validateRequest(commonValidators.validatePagination, 'query'),
    DashboardController.getRecentTransactions
);

router.get('/trends/stock-movement',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getStockMovementTrends
);

router.get('/trends/transaction-volume',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getTransactionVolumeTrends
);

// Quick actions data
router.get('/quick-stats',
    DashboardController.getQuickStats
);

router.get('/top-products',
    validateRequest(commonValidators.validatePagination, 'query'),
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getTopProducts
);

router.get('/top-categories',
    validateRequest(commonValidators.validatePagination, 'query'),
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getTopCategories
);

// Critical alerts
router.get('/alerts/critical',
    DashboardController.getCriticalAlerts
);

router.get('/alerts/stock',
    validateRequest(commonValidators.validatePagination, 'query'),
    DashboardController.getStockAlerts
);

router.get('/alerts/expiry',
    validateRequest(commonValidators.validatePagination, 'query'),
    DashboardController.getExpiryAlerts
);

// Performance metrics
router.get('/metrics/inventory-turnover',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getInventoryTurnoverMetrics
);

router.get('/metrics/stock-accuracy',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getStockAccuracyMetrics
);

// Manager and Admin routes
router.use(requireRole(['admin', 'manager']));

// Advanced analytics
router.get('/analytics/overview',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getAnalyticsOverview
);

router.get('/analytics/predictive',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getPredictiveAnalytics
);

router.get('/analytics/performance',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getPerformanceAnalytics
);

// Custom dashboard configuration
router.get('/config',
    DashboardController.getDashboardConfig
);

router.put('/config',
    validateRequest((data) => {
        const errors = [];
        if (!data.widgets || !Array.isArray(data.widgets)) {
            errors.push('Widgets configuration is required and must be an array');
        }
        return { isValid: errors.length === 0, errors };
    }),
    DashboardController.updateDashboardConfig
);

// Admin-only routes
router.use(requireRole(['admin']));

// System health and monitoring
router.get('/system/health',
    DashboardController.getSystemHealth
);

router.get('/system/performance',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getSystemPerformance
);

router.get('/system/usage-stats',
    validateRequest(commonValidators.validateDateRange, 'query'),
    DashboardController.getUsageStatistics
);

// Export dashboard data
router.post('/export',
    validateRequest(commonValidators.validateDateRange),
    DashboardController.exportDashboardData
);

export default router;