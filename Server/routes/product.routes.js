import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOrManager, adminOnly } from '../middlewares/authorization.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as productValidators from '../validators/product.validator.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes (accessible to all authenticated users)
router.get('/',
    validate(commonValidators.validatePagination, 'query'),
    ProductController.getAllProducts
);

router.get('/search',
    validate(commonValidators.validateSearch, 'query'),
    ProductController.searchProducts
);

router.get('/active',
    validate(commonValidators.validatePagination, 'query'),
    ProductController.getActiveProducts
);

router.get('/low-stock',
    validate(commonValidators.validatePagination, 'query'),
    ProductController.getLowStockProducts
);

router.get('/by-category/:categoryId',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validatePagination, 'query'),
    ProductController.getProductsByCategory
);

router.get('/:id',
    validate(commonValidators.validateId, 'params'),
    ProductController.getProductById
);

router.get('/:id/inventory',
    validate(commonValidators.validateId, 'params'),
    ProductController.getProductInventory
);

router.get('/:id/transactions',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validatePagination, 'query'),
    validate(commonValidators.validateDateRange, 'query'),
    ProductController.getProductTransactions
);

// SKU and Barcode lookup
router.get('/sku/:sku',
    validate(productValidators.validateSKU, 'params'),
    ProductController.getProductBySKU
);

router.get('/barcode/:barcode',
    validate(productValidators.validateBarcode, 'params'),
    ProductController.getProductByBarcode
);

// Management routes (admin and manager roles)
router.use(requireRole(['admin', 'manager']));

router.post('/',
    validate(productValidators.validateProductCreation),
    ProductController.createProduct
);

router.put('/:id',
    validate(commonValidators.validateId, 'params'),
    validate(productValidators.validateProductUpdate),
    ProductController.updateProduct
);

router.patch('/:id/status',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validateStatus),
    ProductController.updateProductStatus
);

// router.patch('/:id/price',
//   validate(commonValidators.validateId, 'params'),
//   validate(productValidators.validatePriceUpdate),
//   ProductController.updateProductPrice
// );

// Bulk operations
router.post('/bulk/import',
    validate(productValidators.validateBulkProductImport),
    ProductController.bulkImportProducts
);

// router.patch('/bulk/update',
//   validate(commonValidators.validateBulkUpdate),
//   ProductController.bulkUpdateProducts
// );

router.patch('/bulk/status',
    validate(commonValidators.validateBulkStatus),
    ProductController.bulkUpdateProductStatus
);

router.patch('/bulk/prices',
    validate(productValidators.validateBulkPriceUpdate),
    ProductController.bulkUpdateProductPrices
);

// Image and file management
router.post('/:id/images',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validateFileUpload),
    ProductController.uploadProductImages
);

// router.delete('/:id/images/:imageId',
//   validate(commonValidators.validateId, 'params'),
//   ProductController.deleteProductImage
// );

// Admin-only routes
router.use(requireRole(['admin']));

router.delete('/:id',
    validate(commonValidators.validateId, 'params'),
    ProductController.deleteProduct
);

// router.delete('/bulk/delete',
//   validate(commonValidators.validateBulkIds),
//   ProductController.bulkDeleteProducts
// );

// Reports and analytics
router.get('/reports/overview', ProductController.getProductsReport);

router.get('/reports/performance',
    validate(commonValidators.validateDateRange, 'query'),
    ProductController.getProductPerformanceReport
);

router.get('/reports/stock-analysis',
    ProductController.getStockAnalysisReport
);

export default router;
