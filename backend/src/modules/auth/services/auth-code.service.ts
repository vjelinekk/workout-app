import { Injectable, Logger } from '@nestjs/common';
import { AuthCodeData } from '../types/auth-code-data.type';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { randomBytes } from 'crypto';
import { RedisService } from '../../../common/redis/redis.service';

const AUTH_CODE_EXPIRATION_SECONDS = 5 * 60; // 5 minutes in seconds

/**
 * Authentication code service for generating and managing temporary authentication codes.
 * Provides temporary code-based authentication for OAuth flows and QR code login scenarios.
 * Uses Redis for distributed storage with automatic expiration.
 */
@Injectable()
export class AuthCodeService {
    private readonly logger = new Logger(AuthCodeService.name);

    constructor(private readonly redisService: RedisService) {}

    /**
     * Generates a unique authentication code linked to the provided login response.
     * The code is stored in Redis with a 5-minute expiration.
     *
     * @param loginResponse LoginResponseDto from AuthService
     * @returns Generated auth code as a string
     */
    async generateAuthCode(loginResponse: LoginResponseDto): Promise<string> {
        const authCode = randomBytes(32).toString('hex');
        const key = `auth_code:${authCode}`;

        const authCodeData: AuthCodeData = {
            loginResponse,
            expiresAt: new Date(
                Date.now() + AUTH_CODE_EXPIRATION_SECONDS * 1000,
            ),
        };

        // Store in Redis with automatic expiration
        await this.redisService.set(
            key,
            JSON.stringify(authCodeData),
            AUTH_CODE_EXPIRATION_SECONDS,
        );

        this.logger.log(
            `Generated auth code for user ${loginResponse.userId} (expires in ${AUTH_CODE_EXPIRATION_SECONDS}s)`,
        );

        return authCode;
    }

    /**
     * Exchanges an authentication code for the associated login response.
     * The code is consumed (deleted) upon successful exchange.
     *
     * @param authCode Authentication code to be exchanged
     * @returns LoginResponseDto if valid, otherwise null
     */
    async exchangeAuthCode(authCode: string): Promise<LoginResponseDto | null> {
        const key = `auth_code:${authCode}`;

        // Get the data from Redis
        const dataString = await this.redisService.get(key);

        if (!dataString) {
            this.logger.warn(
                `Auth code exchange failed: Invalid or expired code`,
            );
            return null;
        }

        // Parse the stored data
        const data: AuthCodeData = JSON.parse(dataString) as AuthCodeData;

        // Double-check expiration (Redis should handle this, but extra safety)
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
            await this.redisService.del(key);
            this.logger.warn(`Auth code exchange failed: Expired code`);
            return null;
        }

        // Delete the code immediately to ensure single use
        await this.redisService.del(key);

        this.logger.log(
            `Auth code successfully exchanged for user ${data.loginResponse.userId}`,
        );

        return data.loginResponse;
    }
}
