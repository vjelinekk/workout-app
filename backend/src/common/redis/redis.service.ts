import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis service providing a wrapper around the Redis client.
 * Handles Redis operations and cleanup.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

    /**
     * Get the Redis client instance
     */
    getClient(): Redis {
        return this.redisClient;
    }

    /**
     * Set a key-value pair with optional expiration
     */
    async set(
        key: string,
        value: string,
        expirationSeconds?: number,
    ): Promise<void> {
        if (expirationSeconds) {
            await this.redisClient.setex(key, expirationSeconds, value);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    /**
     * Get a value by key
     */
    async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    /**
     * Delete a key
     */
    async del(key: string): Promise<number> {
        return await this.redisClient.del(key);
    }

    /**
     * Check if a key exists
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }

    /**
     * Cleanup on module destroy
     */
    async onModuleDestroy() {
        await this.redisClient.quit();
    }
}
