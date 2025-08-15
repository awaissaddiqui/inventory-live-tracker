import dotenv from 'dotenv';
import path from 'path';

export const loadEnv = () => {
    try {

        const envPath = path.resolve(process.cwd(), '.env');
        dotenv.config({ path: envPath });

        console.log('✅ Environment variables loaded');
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
        console.log('❌ Failed to load environment variables');
        console.log(error);
    }
};