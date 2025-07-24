import express from 'express';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import inventoryRoutes from './inventory.routes.js';
import transactionRoutes from './transaction.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = express.Router();

// Mount all route modules
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API info endpoint
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Inventory Management API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            categories: '/api/categories',
            products: '/api/products',
            inventory: '/api/inventory',
            transactions: '/api/transactions',
            dashboard: '/api/dashboard'
        },
        documentation: 'Contact administrator for API documentation'
    });
});

export default router;