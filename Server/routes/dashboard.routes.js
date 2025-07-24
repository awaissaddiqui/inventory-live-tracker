import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOrManager, adminOnly, allUsers } from '../middlewares/authorization.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Main dashboard data (accessible to all authenticated users)
router.get('/',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getDashboard
);

// Dashboard components
router.get('/stats',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getInventoryStats
);

router.get('/alerts',
  validate(commonValidators.validatePagination, 'query'),
  DashboardController.getLowStockAlerts
);

router.get('/transactions/recent',
  validate(commonValidators.validatePagination, 'query'),
  DashboardController.getRecentTransactions
);

router.get('/trends/stock-movement',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getStockMovementTrends
);

router.get('/trends/transaction-volume',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getTransactionVolumeTrends
);

// Quick actions data
router.get('/quick-stats',
  DashboardController.getQuickStats
);

router.get('/top-products',
  validate(commonValidators.validatePagination, 'query'),
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getTopProducts
);

router.get('/top-categories',
  validate(commonValidators.validatePagination, 'query'),
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getTopCategories
);

// Critical alerts
router.get('/alerts/critical',
  DashboardController.getCriticalAlerts
);

router.get('/alerts/stock',
  validate(commonValidators.validatePagination, 'query'),
  DashboardController.getStockAlerts
);

router.get('/alerts/expiry',
  validate(commonValidators.validatePagination, 'query'),
  DashboardController.getExpiryAlerts
);

// Performance metrics
router.get('/metrics/inventory-turnover',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getInventoryTurnoverMetrics
);

router.get('/metrics/stock-accuracy',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getStockAccuracyMetrics
);

// Manager and Admin routes
router.use(requireRole(['admin', 'manager']));

// Advanced analytics
router.get('/analytics/overview',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getAnalyticsOverview
);

router.get('/analytics/predictive',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getPredictiveAnalytics
);

router.get('/analytics/performance',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getPerformanceAnalytics
);

// Custom dashboard configuration
router.get('/config',
  DashboardController.getDashboardConfig
);

router.put('/config',
  validate((data) => {
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
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getSystemPerformance
);

router.get('/system/usage-stats',
  validate(commonValidators.validateDateRange, 'query'),
  DashboardController.getUsageStatistics
);

// Export dashboard data
router.post('/export',
  validate(commonValidators.validateDateRange),
  DashboardController.exportDashboardData
);

export default router;