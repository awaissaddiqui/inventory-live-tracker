import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOrManager, adminOnly } from '../middlewares/authorization.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as categoryValidators from '../validators/category.validator.js';
import * as commonValidators from '../validators/common.validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes (accessible to all authenticated users)
router.get('/',
    validate(commonValidators.validatePagination, 'query'),
    CategoryController.getAllCategories
);

router.get('/search',
    validate(commonValidators.validateSearch, 'query'),
    CategoryController.searchCategories
);

router.get('/active',
    validate(commonValidators.validatePagination, 'query'),
    CategoryController.getActiveCategories
);

router.get('/:id',
    validate(commonValidators.validateId, 'params'),
    CategoryController.getCategoryById
);

router.get('/:id/products',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validatePagination, 'query'),
    CategoryController.getCategoryProducts
);

router.get('/:id/stats',
    validate(commonValidators.validateId, 'params'),
    CategoryController.getCategoryStats
);

// Management routes (admin and manager roles)
router.use(adminOrManager);

router.post('/',
    validate(categoryValidators.validateCategoryCreation),
    CategoryController.createCategory
);

router.put('/:id',
    validate(commonValidators.validateId, 'params'),
    validate(categoryValidators.validateCategoryUpdate),
    CategoryController.updateCategory
);

router.patch('/:id/status',
    validate(commonValidators.validateId, 'params'),
    validate(commonValidators.validateStatus),
    CategoryController.updateCategoryStatus
);

// Bulk operations
router.post('/bulk/import',
    validate(categoryValidators.validateBulkCategoryImport),
    CategoryController.bulkImportCategories
);



router.patch('/bulk/status',
    validate(commonValidators.validateBulkStatus),
    CategoryController.bulkUpdateCategoryStatus
);

// Admin-only routes
router.use(adminOnly);

router.delete('/:id',
    validate(commonValidators.validateId, 'params'),
    CategoryController.deleteCategory
);



// Statistics and reports
router.get('/reports/overview', CategoryController.getCategoriesReport);

export default router;
