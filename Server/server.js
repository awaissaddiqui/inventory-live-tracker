import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/sequelize.js';

// loadEnv()

const app = express();
const Whitelist = ['http://localhost:3000', 'http://example.com'];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || Whitelist.indexOf(origin) !== -1) {
            callback(null, true); // Allow requests from whitelisted origins
        } else {
            callback(new Error('Not allowed by CORS')); // Reject requests from non-whitelisted origins
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

async function startServer() {
    try {
        // useMiddlewares(app)
        // loadRoutes(app)

        await connectToDatabase()

        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        }
        );
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1); // Stop app if there's an error

    }

}

startServer();