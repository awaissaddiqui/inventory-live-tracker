import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectToDatabase } from './config/sequelize.js';
import { loadEnv } from './config/env.js';
import apiRoutes from './routes/index.js';

// Load environment variables
loadEnv();

const app = express();
const httpServer = createServer(app);

// Basic CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Initialize Socket.io
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ["GET", "POST"]
    }
});

// Basic socket connection
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

async function startServer() {
    try {
        // Connect to database
        await connectToDatabase();
        console.log('✅ Database connected successfully');

        // Health check route
        app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        // Mount API routes
        app.use('/api', apiRoutes);
        console.log('✅ Routes loaded successfully');

        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl
            });
        });

        // Error handler
        app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        });

        const PORT = process.env.PORT || 8002;

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 API available at http://localhost:${PORT}/api`);
            console.log('════════════════════════════════════════════════════');
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully');
    process.exit(0);
});

startServer();
