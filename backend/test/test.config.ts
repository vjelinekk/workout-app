import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables from .env.test file
const envPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envPath });

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.POSTGRES_TEST_HOST || 'localhost',
    port: Number(process.env.POSTGRES_TEST_PORT) || 5433,
    username: process.env.POSTGRES_TEST_USER || 'workout_test',
    password: process.env.POSTGRES_TEST_PASSWORD || 'workout_test',
    database: process.env.POSTGRES_TEST_DB || 'workout_test_db',
    entities: [__dirname + '/../src/**/*.entity.{ts,js}'],
    synchronize: true, // Only for tests! Automatically creates schema
    dropSchema: true, // Clean database before each test run
    logging: false, // Set to true for debugging
});

export const getTestRedisConfig = () => ({
    host: process.env.REDIS_TEST_HOST || 'localhost',
    port: Number(process.env.REDIS_TEST_PORT) || 6380,
});
