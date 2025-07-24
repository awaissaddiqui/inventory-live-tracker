import express from 'express';
import TransactionController from '../controllers/TransactionController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOrManager, adminOnly, allUsers } from '../middlewares/authorization.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as transactionValidators from '../validators/transaction.validator.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes (accessible to all authenticated users)
router.get('/',
    validate(commonValidators.validatePagination, 'query'),
    validate(transactionValidators.validateTransactionFilters, 'query'),
    TransactionController.getAllTransactions
);

router.get('/search',
    validate(commonValidators.validateSearch, 'query'),
    TransactionController.searchTransactions
);

router.get('/recent',
    validate(commonValidators.validatePagination, 'query'),
    TransactionController.getRecentTransactions
);

router.get('/by-type/:type',
    validate(transactionValidators.validateTransactionType, 'params'),
    validate(commonValidators.validatePagination, 'query'),
    validate(commonValidators.validateDateRange, 'query'),
    TransactionController.getTransactionsByType
);

router.get('/by-product/:productId',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validatePagination, 'query'),
    validate(commonValidators.validateDateRange, 'query'),
    TransactionController.getTransactionsByProduct
);

// router.get('/by-user/:userId',
//   validate(commonValidators.validateId, 'params'),
//   validate(commonValidators.validatePagination, 'query'),
//   validate(commonValidators.validateDateRange, 'query'),
//   TransactionController.getTransactionById
// );

router.get('/:id',
    validate(commonValidators.validateId, 'params'),
    TransactionController.getTransactionById
);

router.get('/:id/details',
    validate(commonValidators.validateId, 'params'),
    TransactionController.getTransactionDetails
);

// Transaction statistics
router.get('/stats/summary',
    validate(commonValidators.validateDateRange, 'query'),
    TransactionController.getTransactionsSummary
);

router.get('/stats/by-type',
    validate(commonValidators.validateDateRange, 'query'),
    TransactionController.getTransactionsByType
);

router.get('/stats/trends',
    validate(transactionValidators.validateStatsFilters, 'query'),
    TransactionController.getTransactionStatistics
);

// Management routes (admin and manager roles)
router.use(requireRole(['admin', 'manager']));

router.post('/',
    validate(transactionValidators.validateTransactionCreation),
    TransactionController.createTransaction
);

// router.put('/:id',
//   validate(commonValidators.validateId, 'params'),
//   validate(transactionValidators.validateTransactionUpdate),
//   TransactionController.
// );

router.patch('/:id/status',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validateStatus),
    TransactionController.updateTransactionStatus
);

// Bulk operations


router.patch('/bulk/update',
    validate(commonValidators.validateBulkUpdate),
    TransactionController.bulkUpdateTransactions
);

router.patch('/bulk/status',
    validate(commonValidators.validateBulkStatus),
    TransactionController.bulkUpdateTransactionStatus
);

// Transaction approval workflow
router.patch('/:id/approve',
    validate(commonValidators.validateId, 'params'),
    TransactionController.approveTransaction
);

// Admin-only routes
router.use(requireRole(['admin']));

router.delete('/:id',
    validate(commonValidators.validateId, 'params'),
    TransactionController.deleteTransaction
);

router.delete('/bulk/delete',
    validate(commonValidators.validateBulkIds),
    TransactionController.bulkDeleteTransactions
);

// Advanced reports
router.get('/reports/overview',
    validate(transactionValidators.validateReportFilters, 'query'),
    TransactionController.getTransactionsReport
);

router.get('/reports/detailed',
    validate(transactionValidators.validateReportFilters, 'query'),
    TransactionController.getDetailedTransactionsReport
);

router.get('/reports/audit-trail',
    validate(commonValidators.validateDateRange, 'query'),
    TransactionController.getAuditTrailReport
);

router.get('/reports/performance',
    validate(transactionValidators.validatePerformanceReportFilters, 'query'),
    TransactionController.getPerformanceReport
);

router.get('/reports/variance',
    validate(commonValidators.validateDateRange, 'query'),
    TransactionController.getVarianceReport
);

// Export functionality
router.post('/export',
    validate(transactionValidators.validateExportFilters),
    TransactionController.exportTransactions
);

router.get('/export/:exportId/download',
    validate(commonValidators.validateId, 'params'),
    TransactionController.downloadExport
);

export default router;
