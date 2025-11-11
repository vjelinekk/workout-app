import { AuthCodeService } from './auth-code.service';
import {
    mockLoginResponse,
    mockTrainerLoginResponse,
} from '../../../common/test/mock-data';
import { RedisService } from '../../../common/redis/redis.service';

describe('AuthCodeService', () => {
    let service: AuthCodeService;
    let redisService: RedisService;
    let mockRedisData: Map<string, { value: string; expiresAt?: number }>;

    beforeEach(() => {
        mockRedisData = new Map();

        // Create mock RedisService
        redisService = {
            set: jest.fn((key: string, value: string, ttl?: number) => {
                const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
                mockRedisData.set(key, { value, expiresAt });
                return Promise.resolve();
            }),
            get: jest.fn((key: string) => {
                const data = mockRedisData.get(key);
                if (!data) {
                    return Promise.resolve(null);
                }
                if (data.expiresAt && data.expiresAt < Date.now()) {
                    mockRedisData.delete(key);
                    return Promise.resolve(null);
                }
                return Promise.resolve(data.value);
            }),
            del: jest.fn((key: string) => {
                const existed = mockRedisData.has(key);
                mockRedisData.delete(key);
                return Promise.resolve(existed ? 1 : 0);
            }),
        } as any;

        service = new AuthCodeService(redisService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAuthCode', () => {
        it('should generate a unique authentication code', async () => {
            const code = await service.generateAuthCode(mockLoginResponse);

            expect(code).toBeDefined();
            expect(typeof code).toBe('string');
            expect(code.length).toBe(64); // 32 bytes = 64 hex characters
        });

        it('should generate different codes for each call', async () => {
            const code1 = await service.generateAuthCode(mockLoginResponse);
            const code2 = await service.generateAuthCode(mockLoginResponse);

            expect(code1).not.toBe(code2);
        });

        it('should store login response associated with code', async () => {
            const code = await service.generateAuthCode(mockLoginResponse);
            const result = await service.exchangeAuthCode(code);

            expect(result).toEqual(mockLoginResponse);
        });

        it('should handle different login responses', async () => {
            const code1 = await service.generateAuthCode(mockLoginResponse);
            const code2 = await service.generateAuthCode(mockTrainerLoginResponse);

            const result1 = await service.exchangeAuthCode(code1);
            const result2 = await service.exchangeAuthCode(code2);

            expect(result1).toEqual(mockLoginResponse);
            expect(result2).toEqual(mockTrainerLoginResponse);
        });
    });

    describe('exchangeAuthCode', () => {
        it('should return login response for valid code', async () => {
            const code = await service.generateAuthCode(mockLoginResponse);
            const result = await service.exchangeAuthCode(code);

            expect(result).toEqual(mockLoginResponse);
        });

        it('should return null for non-existent code', async () => {
            const result = await service.exchangeAuthCode('non-existent-code');

            expect(result).toBeNull();
        });

        it('should delete code after successful exchange', async () => {
            const code = await service.generateAuthCode(mockLoginResponse);

            await service.exchangeAuthCode(code);
            const secondAttempt = await service.exchangeAuthCode(code);

            expect(secondAttempt).toBeNull();
        });

        it('should return null for expired code', async () => {
            const code = await service.generateAuthCode(mockLoginResponse);

            // Simulate code expiration by moving time forward
            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes (past 5 minute expiry)

            const result = await service.exchangeAuthCode(code);

            expect(result).toBeNull();

            jest.useRealTimers();
        });

        it('should delete expired code during exchange attempt', async () => {
            const code = await service.generateAuthCode(mockLoginResponse);

            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000);

            await service.exchangeAuthCode(code);

            // Try to exchange again to ensure it was deleted
            const secondAttempt = await service.exchangeAuthCode(code);

            expect(secondAttempt).toBeNull();

            jest.useRealTimers();
        });
    });

    describe('cleanup of expired codes', () => {
        it('should remove expired codes automatically via Redis TTL', async () => {
            const code1 = await service.generateAuthCode(mockLoginResponse);

            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000);

            // Redis TTL should handle expiration automatically
            const result = await service.exchangeAuthCode(code1);
            expect(result).toBeNull();

            jest.useRealTimers();
        });

        it('should not affect new codes when old ones expire', async () => {
            const code1 = await service.generateAuthCode(mockLoginResponse);

            jest.useFakeTimers();
            jest.advanceTimersByTime(6 * 60 * 1000);

            const code2 = await service.generateAuthCode(mockTrainerLoginResponse);

            // Verify expired code is gone
            const result1 = await service.exchangeAuthCode(code1);
            expect(result1).toBeNull();

            // Verify new code still works
            const result2 = await service.exchangeAuthCode(code2);
            expect(result2).toEqual(mockTrainerLoginResponse);

            jest.useRealTimers();
        });
    });

    describe('multiple codes management', () => {
        it('should manage multiple codes independently', async () => {
            const code1 = await service.generateAuthCode(mockLoginResponse);
            const code2 = await service.generateAuthCode(mockTrainerLoginResponse);

            const result1 = await service.exchangeAuthCode(code1);
            const result2 = await service.exchangeAuthCode(code2);

            expect(result1).toEqual(mockLoginResponse);
            expect(result2).toEqual(mockTrainerLoginResponse);
        });

        it('should not affect other codes when one expires', async () => {
            jest.useFakeTimers();

            const code1 = await service.generateAuthCode(mockLoginResponse);

            jest.advanceTimersByTime(3 * 60 * 1000); // 3 minutes

            const code2 = await service.generateAuthCode(mockTrainerLoginResponse);

            jest.advanceTimersByTime(3 * 60 * 1000); // Advance another 3 minutes (6 total)

            // code1 should be expired (6 minutes old), code2 should still be valid (3 minutes old)
            const result1 = await service.exchangeAuthCode(code1);
            const result2 = await service.exchangeAuthCode(code2);

            expect(result1).toBeNull();
            expect(result2).toEqual(mockTrainerLoginResponse);

            jest.useRealTimers();
        });
    });

    describe('edge cases', () => {
        it('should handle empty login response data', async () => {
            const emptyResponse = {
                accessToken: '',
                userId: 0,
                userFirstName: '',
                userLastName: '',
                userNickname: '',
                userEmail: '',
                roles: [],
            };

            const code = await service.generateAuthCode(emptyResponse);
            const result = await service.exchangeAuthCode(code);

            expect(result).toEqual(emptyResponse);
        });

        it('should handle large number of codes', async () => {
            const codes: string[] = [];

            for (let i = 0; i < 100; i++) {
                const code = await service.generateAuthCode(mockLoginResponse);
                codes.push(code);
            }

            // All codes should be retrievable
            for (const code of codes) {
                const result = await service.exchangeAuthCode(code);
                expect(result).toEqual(mockLoginResponse);
            }
        });

        it('should preserve code order in FIFO manner', async () => {
            const code1 = await service.generateAuthCode(mockLoginResponse);
            const code2 = await service.generateAuthCode(mockTrainerLoginResponse);

            const result1 = await service.exchangeAuthCode(code1);
            const result2 = await service.exchangeAuthCode(code2);

            expect(result1).toEqual(mockLoginResponse);
            expect(result2).toEqual(mockTrainerLoginResponse);
        });
    });
});
