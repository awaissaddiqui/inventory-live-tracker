import CategoryService from '../services/category-services.js';
import {
    ResponseUtil,
    ErrorUtil,
    ValidationError,
    NotFoundError,
    ConflictError
} from '../utils/index.js';
import { MESSAGES } from '../constant/index.js';

class CategoryController {

    /**
     * Get all categories with filters
     * @route GET /api/categories
     */
    static async getAllCategories(req, res) {
        try {
            const result = await CategoryService.getAllCategories(req.query);

            return ResponseUtil.paginated(
                res,
                result.categories,
                result.pagination,
                'Categories retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'CategoryController',
                method: 'getAllCategories',
                query: req.query
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get category by ID
     * @route GET /api/categories/:id
     */
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.getCategoryById(id);

            return ResponseUtil.success(
                res,
                category,
                'Category retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'CategoryController',
                method: 'getCategoryById',
                params: req.params
            });

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Create new category
     * @route POST /api/categories
     */
    static async createCategory(req, res) {
        try {
            const category = await CategoryService.createCategory(req.body);

            return ResponseUtil.created(
                res,
                category,
                'Category created successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'CategoryController',
                method: 'createCategory',
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Update category
     * @route PUT /api/categories/:id
     */
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.updateCategory(id, req.body);

            return ResponseUtil.updated(
                res,
                category,
                'Category updated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'CategoryController',
                method: 'updateCategory',
                params: req.params,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Delete category (soft delete)
     * @route DELETE /api/categories/:id
     */
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const result = await CategoryService.deleteCategory(id);

            return ResponseUtil.deleted(res, result.message);
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'CategoryController',
                method: 'deleteCategory',
                params: req.params
            });

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get category statistics
     * @route GET /api/categories/:id/stats
     */
    static async getCategoryStats(req, res) {
        try {
            const { id } = req.params;
            const statsData = await CategoryService.getCategoryStats(id);

            return ResponseUtil.success(
                res,
                statsData,
                'Category statistics retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'CategoryController',
                method: 'getCategoryStats',
                params: req.params
            });

            if (error instanceof NotFoundError) {
                return ResponseUtil.notFound(res, error.message);
            }

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }
}

export default CategoryController;
