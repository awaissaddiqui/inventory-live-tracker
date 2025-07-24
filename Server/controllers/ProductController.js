import ProductService from '../services/product-services.js';
import {
    ResponseUtil,
    ErrorUtil,
    ValidationError,
    NotFoundError,
    ConflictError
} from '../utils/index.js';
import { MESSAGES } from '../constant/index.js';

class ProductController {

    /**
     * Get all products with filters
     * @route GET /api/products
     */
    static async getAllProducts(req, res) {
        try {
            const result = await ProductService.getAllProducts(req.query);

            return ResponseUtil.paginated(
                res,
                result.products,
                result.pagination,
                'Products retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'getAllProducts',
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
     * Get product by ID
     * @route GET /api/products/:id
     */
    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.getProductById(id);

            return ResponseUtil.success(
                res,
                product,
                'Product retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'getProductById',
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
     * Get product by SKU
     * @route GET /api/products/sku/:sku
     */
    static async getProductBySKU(req, res) {
        try {
            const { sku } = req.params;
            const product = await ProductService.getProductBySKU(sku);

            return ResponseUtil.success(
                res,
                product,
                'Product retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'getProductBySKU',
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
     * Get product by barcode
     * @route GET /api/products/barcode/:barcode
     */
    static async getProductByBarcode(req, res) {
        try {
            const { barcode } = req.params;
            const product = await ProductService.getProductByBarcode(barcode);

            return ResponseUtil.success(
                res,
                product,
                'Product retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'getProductByBarcode',
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
     * Create new product
     * @route POST /api/products
     */
    static async createProduct(req, res) {
        try {
            const product = await ProductService.createProduct(req.body);

            return ResponseUtil.created(
                res,
                product,
                'Product created successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'createProduct',
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
            }

            if (error instanceof ConflictError) {
                return ResponseUtil.conflict(res, error.message);
            }

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
     * Update product
     * @route PUT /api/products/:id
     */
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await ProductService.updateProduct(id, req.body);

            return ResponseUtil.updated(
                res,
                product,
                'Product updated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'updateProduct',
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
     * Delete product (soft delete)
     * @route DELETE /api/products/:id
     */
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const result = await ProductService.deleteProduct(id);

            return ResponseUtil.deleted(res, result.message);
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'deleteProduct',
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
     * Get low stock products
     * @route GET /api/products/low-stock
     */
    static async getLowStockProducts(req, res) {
        try {
            const filters = { ...req.query, low_stock: true };
            const result = await ProductService.getAllProducts(filters);

            return ResponseUtil.paginated(
                res,
                result.products,
                result.pagination,
                'Low stock products retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'getLowStockProducts',
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
     * Bulk import products
     * @route POST /api/products/bulk-import
     */
    static async bulkImportProducts(req, res) {
        try {
            const { products } = req.body;

            if (!products || !Array.isArray(products) || products.length === 0) {
                return ResponseUtil.badRequest(res, 'Products array is required and cannot be empty');
            }

            const results = [];
            const errors = [];

            for (let i = 0; i < products.length; i++) {
                try {
                    const product = await ProductService.createProduct(products[i]);
                    results.push({
                        index: i,
                        success: true,
                        product: product,
                        sku: products[i].sku
                    });
                } catch (error) {
                    errors.push({
                        index: i,
                        success: false,
                        error: error.message,
                        sku: products[i].sku || 'N/A'
                    });
                }
            }

            return ResponseUtil.success(
                res,
                {
                    total: products.length,
                    successful: results.length,
                    failed: errors.length,
                    results,
                    errors
                },
                `Bulk import completed. ${results.length} successful, ${errors.length} failed.`
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'ProductController',
                method: 'bulkImportProducts',
                body: req.body
            });

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }
}

export default ProductController;
