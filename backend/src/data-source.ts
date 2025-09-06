import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || 'workout',
    password: process.env.POSTGRES_PASSWORD || 'workout',
    database: process.env.POSTGRES_DB || 'workout_db',
    entities: [__dirname + '/**/*.entity.{ts,js}'],
    migrations: ['src/migrations/*.{ts,js}'],
    synchronize: false,
    logging: true,
});
