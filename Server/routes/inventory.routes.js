import express from 'express';
import InventoryController from '../controllers/InventoryController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOrManager, adminOnly, allUsers } from '../middlewares/authorization.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as inventoryValidators from '../validators/inventory.validator.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes (accessible to all authenticated users)
router.get('/',
    validate(commonValidators.validatePagination, 'query'),
    InventoryController.getAllInventory
);

router.get('/search',
    validate(commonValidators.validateSearch, 'query'),
    InventoryController.searchInventory
);

router.get('/low-stock',
    validate(commonValidators.validatePagination, 'query'),
    InventoryController.getLowStockItems
);

router.get('/out-of-stock',
    validate(commonValidators.validatePagination, 'query'),
    InventoryController.getOutOfStockItems
);

router.get('/alerts',
    validate(commonValidators.validatePagination, 'query'),
    InventoryController.getStockAlerts
);

router.get('/:id',
    validate(commonValidators.validateId, 'params'),
    InventoryController.getInventoryById
);

router.get('/product/:productId',
    validate(commonValidators.validateId, 'params'),
    InventoryController.getInventoryByProduct
);

router.get('/:id/movements',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validatePagination, 'query'),
    validate(commonValidators.validateDateRange, 'query'),
    InventoryController.getInventoryMovements
);

// Stock level tracking
router.get('/:id/history',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validateDateRange, 'query'),
    InventoryController.getStockLevelHistory
);

// Management routes (admin and manager roles)
router.use(requireRole(['admin', 'manager']));

router.post('/',
    validate(inventoryValidators.validateInventoryCreation),
    InventoryController.createInventory
);

router.put('/:id',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validateInventoryUpdate),
    InventoryController.updateInventory
);

// Stock operations
router.post('/:id/adjust',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validateStockAdjustment),
    InventoryController.adjustStock
);

router.post('/:id/add',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validateStockOperation),
    InventoryController.addStock
);

router.post('/:id/remove',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validateStockOperation),
    InventoryController.removeStock
);

router.post('/:id/transfer',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validateStockTransfer),
    InventoryController.transferStock
);

// Threshold management
router.patch('/:id/thresholds',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validateThresholdUpdate),
    InventoryController.updateStockThresholds
);

// Bulk operations
// router.post('/bulk/create',
//   validate(inventoryValidators.validateBulkInventoryCreation),
//   InventoryController.bulkCreateInventory
// );

// router.patch('/bulk/adjust',
//   validate(inventoryValidators.validateBulkStockAdjustment),
//   InventoryController.bulkAdjustStock
// );

router.patch('/bulk/thresholds',
    validate(inventoryValidators.validateBulkThresholdUpdate),
    InventoryController.bulkUpdateThresholds
);

// Physical inventory count
router.post('/physical-count/start',
    validate(inventoryValidators.validatePhysicalCountStart),
    InventoryController.startPhysicalCount
);

router.patch('/physical-count/:countId/record',
    validate(commonValidators.validateId, 'params'),
    validate(inventoryValidators.validatePhysicalCountRecord),
    InventoryController.recordPhysicalCount
);

router.post('/physical-count/:countId/finalize',
    validate(commonValidators.validateId, 'params'),
    InventoryController.finalizePhysicalCount
);

// Admin-only routes
router.use(requireRole(['admin']));

router.delete('/:id',
    validate(commonValidators.validateId, 'params'),
    InventoryController.deleteInventory
);

// router.delete('/bulk/delete',
//   validate(commonValidators.validateBulkIds),
//   InventoryController.bulkDeleteInventory
// );

// Reports and analytics
router.get('/reports/overview', InventoryController.getInventoryReport);

router.get('/reports/valuation',
    InventoryController.getInventoryValuationReport
);

router.get('/reports/turnover',
    validate(commonValidators.validateDateRange, 'query'),
    InventoryController.getInventoryTurnoverReport
);

router.get('/reports/aging',
    InventoryController.getInventoryAgingReport
);

router.get('/reports/movement-analysis',
    validate(commonValidators.validateDateRange, 'query'),
    InventoryController.getMovementAnalysisReport
);

export default router;
