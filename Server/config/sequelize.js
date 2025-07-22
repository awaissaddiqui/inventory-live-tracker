import { Sequelize } from 'sequelize';
import config from './database.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

export const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database: inventory-live-tracker-db');

        if (env === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Database synchronized successfully.');
        }

        return sequelize;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

export default sequelize;