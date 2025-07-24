import InventoryService from '../services/inventory-services.js';
import {
    ResponseUtil,
    ErrorUtil,
    ValidationError,
    NotFoundError,
    ConflictError
} from '../utils/index.js';
import { MESSAGES } from '../constant/index.js';

class InventoryController {

    /**
     * Get all inventory records with filters
     * @route GET /api/inventory
     */
    static async getAllInventory(req, res) {
        try {
            const result = await InventoryService.getAllInventory(req.query);

            return ResponseUtil.paginated(
                res,
                result.inventory,
                result.pagination,
                'Inventory records retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'getAllInventory',
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
     * Get inventory by ID
     * @route GET /api/inventory/:id
     */
    static async getInventoryById(req, res) {
        try {
            const { id } = req.params;
            const inventory = await InventoryService.getInventoryById(id);

            return ResponseUtil.success(
                res,
                inventory,
                'Inventory record retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'getInventoryById',
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
     * Get inventory by product ID
     * @route GET /api/inventory/product/:productId
     */
    static async getInventoryByProductId(req, res) {
        try {
            const { productId } = req.params;
            const inventory = await InventoryService.getInventoryByProductId(productId);

            return ResponseUtil.success(
                res,
                inventory,
                'Product inventory retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'getInventoryByProductId',
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
     * Create new inventory record
     * @route POST /api/inventory
     */
    static async createInventory(req, res) {
        try {
            const inventory = await InventoryService.createInventory(req.body);

            const response = {
                inventory,
                message: 'Initial stock set successfully'
            };

            return ResponseUtil.created(
                res,
                response,
                'Inventory record created successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'createInventory',
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
     * Update inventory quantity
     * @route PUT /api/inventory/:id
     */
    static async updateInventory(req, res) {
        try {
            const { id } = req.params;
            const inventory = await InventoryService.updateInventory(id, req.body);

            return ResponseUtil.updated(
                res,
                inventory,
                'Inventory updated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'updateInventory',
                params: req.params,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
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
     * Delete inventory record
     * @route DELETE /api/inventory/:id
     */
    static async deleteInventory(req, res) {
        try {
            const { id } = req.params;
            const result = await InventoryService.deleteInventory(id);

            return ResponseUtil.deleted(res, result.message);
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'deleteInventory',
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
     * Add stock (Stock IN operation)
     * @route POST /api/inventory/:id/add-stock
     */
    static async addStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, notes } = req.body;

            const result = await InventoryService.addStock(id, quantity, notes);

            return ResponseUtil.updated(
                res,
                result,
                'Stock added successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'addStock',
                params: req.params,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
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
     * Remove stock (Stock OUT operation)
     * @route POST /api/inventory/:id/remove-stock
     */
    static async removeStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, notes } = req.body;

            const result = await InventoryService.removeStock(id, quantity, notes);

            return ResponseUtil.updated(
                res,
                result,
                'Stock removed successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'removeStock',
                params: req.params,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
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
     * Adjust stock (Stock adjustment operation)
     * @route POST /api/inventory/:id/adjust-stock
     */
    static async adjustStock(req, res) {
        try {
            const { id } = req.params;
            const { newQuantity, reason, notes } = req.body;

            const result = await InventoryService.adjustStock(id, newQuantity, reason, notes);

            return ResponseUtil.updated(
                res,
                result,
                'Stock adjusted successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'adjustStock',
                params: req.params,
                body: req.body
            });

            if (error instanceof ValidationError) {
                return ResponseUtil.badRequest(res, error.message, error.errors);
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
     * Get low stock items
     * @route GET /api/inventory/low-stock
     */
    static async getLowStockItems(req, res) {
        try {
            const { threshold } = req.query;
            const result = await InventoryService.getLowStockItems(threshold);

            return ResponseUtil.success(
                res,
                result,
                'Low stock items retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'getLowStockItems',
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
     * Get out of stock items
     * @route GET /api/inventory/out-of-stock
     */
    static async getOutOfStockItems(req, res) {
        try {
            const result = await InventoryService.getOutOfStockItems();

            return ResponseUtil.success(
                res,
                result,
                'Out of stock items retrieved successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'getOutOfStockItems',
                query: req.query
            });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Get inventory valuation
     * @route GET /api/inventory/valuation
     */
    static async getInventoryValuation(req, res) {
        try {
            const valuation = await InventoryService.getInventoryValuation();

            return ResponseUtil.success(
                res,
                valuation,
                'Inventory valuation calculated successfully'
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'getInventoryValuation'
            });

            if (ErrorUtil.isOperationalError(error)) {
                return ResponseUtil.error(res, error.message, error.statusCode);
            }

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }

    /**
     * Bulk update inventory
     * @route POST /api/inventory/bulk-update
     */
    static async bulkUpdateInventory(req, res) {
        try {
            const { updates } = req.body;

            if (!updates || !Array.isArray(updates) || updates.length === 0) {
                return ResponseUtil.badRequest(res, 'Updates array is required and cannot be empty');
            }

            const results = [];
            const errors = [];

            for (let i = 0; i < updates.length; i++) {
                try {
                    const { id, ...updateData } = updates[i];
                    const inventory = await InventoryService.updateInventory(id, updateData);
                    results.push({
                        index: i,
                        success: true,
                        inventory: inventory,
                        id: id
                    });
                } catch (error) {
                    errors.push({
                        index: i,
                        success: false,
                        error: error.message,
                        id: updates[i].id || 'N/A'
                    });
                }
            }

            return ResponseUtil.success(
                res,
                {
                    total: updates.length,
                    successful: results.length,
                    failed: errors.length,
                    results,
                    errors
                },
                `Bulk update completed. ${results.length} successful, ${errors.length} failed.`
            );
        } catch (error) {
            ErrorUtil.logError(error, {
                controller: 'InventoryController',
                method: 'bulkUpdateInventory',
                body: req.body
            });

            return ResponseUtil.error(res, MESSAGES.ERROR.SERVER_ERROR);
        }
    }
}

export default InventoryController;
