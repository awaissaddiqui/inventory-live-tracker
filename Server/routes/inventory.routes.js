import express from 'express';
import InventoryController from '../controllers/InventoryController.js';

const router = express.Router();

// Basic routes for inventory management
router.get('/', InventoryController.getAllInventory);
router.get('/low-stock', InventoryController.getLowStockItems);
router.get('/product/:productId', InventoryController.getInventoryByProductId);
router.put('/product/:productId', InventoryController.updateInventory);

export default router;
