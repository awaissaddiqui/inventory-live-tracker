import { Server } from 'socket.io';

class SocketService {
    static io = null;

    static initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });

        this.setupConnection();
        return this.io;
    }

    static setupConnection() {
        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Join user to their role-based room
            socket.on('join_role_room', (role) => {
                socket.join(`role_${role}`);
                console.log(`User ${socket.id} joined role room: ${role}`);
            });

            // Join user to product-specific rooms for updates
            socket.on('subscribe_product', (productId) => {
                socket.join(`product_${productId}`);
                console.log(`User ${socket.id} subscribed to product: ${productId}`);
            });

            // Join dashboard room for real-time stats
            socket.on('join_dashboard', () => {
                socket.join('dashboard');
                console.log(`User ${socket.id} joined dashboard room`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });
    }

    // Inventory Events
    static emitStockUpdate(data) {
        if (this.io) {
            // Emit to all users
            this.io.emit('inventory:stock_updated', data);

            // Emit to specific product subscribers
            this.io.to(`product_${data.product_id}`).emit('product:stock_changed', data);

            // Emit to dashboard
            this.io.to('dashboard').emit('dashboard:inventory_changed', data);
        }
    }

    static emitLowStockAlert(data) {
        if (this.io) {
            // Send to admins and managers only
            this.io.to('role_admin').emit('inventory:low_stock_alert', data);
            this.io.to('role_manager').emit('inventory:low_stock_alert', data);
        }
    }

    static emitOutOfStockAlert(data) {
        if (this.io) {
            // Critical alert to all users
            this.io.emit('inventory:out_of_stock_alert', data);
        }
    }

    // Transaction Events
    static emitNewTransaction(data) {
        if (this.io) {
            this.io.emit('transaction:new', data);
            this.io.to('dashboard').emit('dashboard:transaction_added', data);
        }
    }

    // Product Events
    static emitProductCreated(data) {
        if (this.io) {
            this.io.emit('product:created', data);
            this.io.to('dashboard').emit('dashboard:product_added', data);
        }
    }

    static emitProductUpdated(data) {
        if (this.io) {
            this.io.emit('product:updated', data);
            this.io.to(`product_${data.id}`).emit('product:details_changed', data);
        }
    }

    // Dashboard Events
    static emitDashboardUpdate(data) {
        if (this.io) {
            this.io.to('dashboard').emit('dashboard:stats_updated', data);
        }
    }

    // User Events
    static emitUserActivity(data) {
        if (this.io) {
            // Only to admins
            this.io.to('role_admin').emit('user:activity', data);
        }
    }

    // Bulk Operation Events
    static emitBulkOperationProgress(data) {
        if (this.io) {
            this.io.to('dashboard').emit('bulk_operation:progress', data);
        }
    }

    static emitBulkOperationComplete(data) {
        if (this.io) {
            this.io.emit('bulk_operation:complete', data);
        }
    }
}

export default SocketService;
