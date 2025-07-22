import dotenv from 'dotenv';
import path from 'path';

export const loadEnv = () => {
    const envPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: envPath });

    console.log('✅ Environment variables loaded');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
};