import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectToDatabase } from './config/sequelize.js';
import { loadEnv } from './config/env.js';
import { useMiddlewares } from './middlewares/use-middlewares.js';
import apiRoutes from './routes/index.js';
import SocketService from './services/socket-services.js';

// Load environment variables
loadEnv();

// CORS whitelist configuration
const Whitelist = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://example.com',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS configuration
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, postman, etc.)
            if (!origin || Whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize Socket Service with io instance
SocketService.initialize(io);

// Setup Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle user joining rooms
    socket.on('join:inventory', () => {
        socket.join('inventory');
        console.log(`📦 Client ${socket.id} joined inventory room`);
    });

    socket.on('join:dashboard', () => {
        socket.join('dashboard');
        console.log(`📊 Client ${socket.id} joined dashboard room`);
    });

    socket.on('join:transactions', () => {
        socket.join('transactions');
        console.log(`💰 Client ${socket.id} joined transactions room`);
    });

    socket.on('join:product', (productId) => {
        socket.join(`product:${productId}`);
        console.log(`🏷️ Client ${socket.id} joined product:${productId} room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, postman, etc.)
        if (!origin || Whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

async function startServer() {
    try {
        // Connect to database first
        await connectToDatabase();
        console.log('✅ Database connected successfully');

        // Apply all custom middleware
        useMiddlewares(app);
        console.log('✅ Middleware loaded successfully');

        // Mount API routes
        app.use('/api', apiRoutes);
        console.log('✅ Routes loaded successfully');

        // Global error handler (should be last)
        app.use((error, req, res, next) => {
            console.error('Global error handler:', error);

            if (error.message === 'Not allowed by CORS') {
                return res.status(403).json({
                    success: false,
                    message: 'CORS policy violation',
                    error: 'Origin not allowed'
                });
            }

            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });

        // 404 handler for undefined routes
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl,
                availableRoutes: {
                    api: '/api',
                    health: '/api/health',
                    users: '/api/users',
                    categories: '/api/categories',
                    products: '/api/products',
                    inventory: '/api/inventory',
                    transactions: '/api/transactions',
                    dashboard: '/api/dashboard'
                }
            });
        });

        const PORT = process.env.PORT || 8000;

        httpServer.listen(PORT, () => {
            console.log(`📍 Server running on http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 API available at http://localhost:${PORT}/api`);
            console.log(`🔍 Health check at http://localhost:${PORT}/api/health`);
            console.log(`⚡ Socket.io enabled for real-time updates`);
            console.log('════════════════════════════════════════════════════');
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();