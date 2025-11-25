import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';
import { ENV_REDIS_HOST, ENV_REDIS_PORT } from '../constants/env-keys';

/**
 * Redis module for providing Redis client throughout the application.
 * This is a global module that makes the Redis client available for dependency injection.
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: (configService: ConfigService) => {
                return new Redis({
                    host: configService.get<string>(
                        ENV_REDIS_HOST,
                        'localhost',
                    ),
                    port: configService.get<number>(ENV_REDIS_PORT, 6379),
                    retryStrategy: (times: number) => {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                });
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
