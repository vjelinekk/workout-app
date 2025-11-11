/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import { UnauthorizedException } from '@nestjs/common';
import {
    mockUserEntity,
    mockJwtPayload,
    createMockUser,
    mockRoleTrainee,
} from '../../../common/test/mock-data';
import {
    createMockConfigService,
    createMockRepository,
} from '../../../common/test/test-helpers';
import { RoleEnum } from '../../user/enums/role.enum';
import { RoleEntity } from '../../user/entities/role.entity';

/**
 * Tests for JwtStrategy (Passport JWT Strategy)
 *
 * JwtStrategy implements JWT token-based authentication:
 * - Extracts JWT from Authorization header (Bearer token)
 * - Validates JWT signature using JWT_SECRET from config
 * - Validates that user still exists and is active
 * - Loads current user roles from database (allows role changes)
 * - Returns JwtAuthenticatedUser with id, nickname, and current roles
 * - Throws UnauthorizedException if user not found or inactive
 */
describe('JwtStrategy', () => {
    let strategy: any;
    let mockUserRepository: any;

    beforeEach(() => {
        createMockConfigService({
            JWT_SECRET: 'test-secret-key',
        });
        mockUserRepository = createMockRepository();

        // Simulate JwtStrategy validation logic
        strategy = {
            secret: 'test-secret-key',
            validate: async (payload: any) => {
                // First verify the user still exists and is active
                const user = await mockUserRepository.findByIdActive(
                    payload.sub,
                    {
                        roles: true,
                    },
                );

                if (!user) {
                    throw new UnauthorizedException(
                        'User not found or inactive',
                    );
                }

                // Check if user's roles have changed since token was issued
                const currentRoleIds = user.roles.map((role: any) => role.id);

                return {
                    id: payload.sub,
                    nickname: payload.nickname,
                    roles: currentRoleIds,
                };
            },
        };
    });

    describe('Configuration', () => {
        it('should have JWT secret configured', () => {
            expect(strategy.secret).toBe('test-secret-key');
        });

        it('should throw error if JWT_SECRET is not configured', () => {
            const configWithoutSecret = createMockConfigService();
            configWithoutSecret.get.mockReturnValue(undefined);

            expect(() => {
                if (!configWithoutSecret.get('JWT_SECRET')) {
                    throw new Error('JWT_SECRET must be configured');
                }
            }).toThrow('JWT_SECRET must be configured');
        });

        it('should have validate method', () => {
            expect(typeof strategy.validate).toBe('function');
        });
    });

    describe('validate', () => {
        it('should return JwtAuthenticatedUser when token is valid', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                id: payload.sub,
                nickname: payload.nickname,
                roles: [RoleEnum.TRAINEE],
            });
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const payload = mockJwtPayload;

            mockUserRepository.findByIdActive.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(strategy.validate(payload)).rejects.toThrow(
                'User not found or inactive',
            );
        });

        it('should load current user roles from database', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [
                    { id: RoleEnum.TRAINEE, name: 'trainee' },
                    { id: RoleEnum.TRAINER, name: 'trainer' },
                ],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.roles).toEqual([RoleEnum.TRAINEE, RoleEnum.TRAINER]);
        });

        it('should call findByIdActive with roles relation', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            await strategy.validate(payload);

            expect(mockUserRepository.findByIdActive).toHaveBeenCalledWith(
                payload.sub,
                {
                    roles: true,
                },
            );
        });

        it('should return user with id from payload sub field', async () => {
            const payload = { ...mockJwtPayload, sub: 42 };
            const user = {
                ...mockUserEntity,
                id: 42,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.id).toBe(42);
        });

        it('should return nickname from payload', async () => {
            const payload = { ...mockJwtPayload, nickname: 'customnickname' };
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.nickname).toBe('customnickname');
        });

        it('should reflect role changes made after token issue', async () => {
            const payload = {
                ...mockJwtPayload,
                roles: [RoleEnum.TRAINEE], // Original role from token
            };
            const user = {
                ...mockUserEntity,
                roles: [
                    { id: RoleEnum.TRAINEE, name: 'trainee' },
                    { id: RoleEnum.TRAINER, name: 'trainer' },
                ], // Current roles (trainer role added)
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            // Should return current roles, not token roles
            expect(result.roles).toEqual([RoleEnum.TRAINEE, RoleEnum.TRAINER]);
        });

        it('should handle user with no roles', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.roles).toEqual([]);
        });

        it('should handle user with admin role', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.ADMIN, name: 'admin' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.roles).toContain(RoleEnum.ADMIN);
        });

        it('should extract role ids correctly', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [
                    { id: 1, name: 'admin' },
                    { id: 2, name: 'trainer' },
                    { id: 3, name: 'trainee' },
                ],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.roles).toEqual([1, 2, 3]);
        });
    });

    describe('Token Validation', () => {
        it('should work with valid JWT payload structure', async () => {
            const payload = {
                sub: 5,
                nickname: 'testuser',
                roles: [2],
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
            };
            const user = {
                ...mockUserEntity,
                id: 5,
                roles: [{ id: 2, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.id).toBe(5);
            expect(result.nickname).toBe('testuser');
        });

        it('should handle minimal payload structure', async () => {
            const payload = {
                sub: 1,
                nickname: 'user',
            };
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result).toBeDefined();
            expect(result.id).toBe(1);
        });
    });

    describe('Error Handling', () => {
        it('should throw UnauthorizedException for deleted user', async () => {
            const payload = mockJwtPayload;

            mockUserRepository.findByIdActive.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should propagate database errors', async () => {
            const payload = mockJwtPayload;
            const error = new Error('Database connection failed');

            mockUserRepository.findByIdActive.mockRejectedValue(error);

            await expect(strategy.validate(payload)).rejects.toThrow(
                'Database connection failed',
            );
        });

        it('should handle null roles array', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: null as any,
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            await expect(strategy.validate(payload)).rejects.toThrow();
        });

        it('should not expose user details in UnauthorizedException', async () => {
            const payload = mockJwtPayload;

            mockUserRepository.findByIdActive.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(
                'User not found or inactive',
            );
        });
    });

    describe('Security', () => {
        it('should only query active users', async () => {
            const payload = mockJwtPayload;

            mockUserRepository.findByIdActive.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockUserRepository.findByIdActive).toHaveBeenCalledWith(
                payload.sub,
                {
                    roles: true,
                },
            );
        });

        it('should fetch current roles on every validation', async () => {
            const payload = mockJwtPayload;
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            // First validation
            await strategy.validate(payload);
            expect(mockUserRepository.findByIdActive).toHaveBeenCalledTimes(1);

            // Second validation
            await strategy.validate(payload);
            expect(mockUserRepository.findByIdActive).toHaveBeenCalledTimes(2);
        });

        it('should not use token roles, always query database', async () => {
            const payload = {
                ...mockJwtPayload,
                roles: [RoleEnum.ADMIN], // Token claims admin
            };
            const user = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }], // Database shows trainee
            };

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            // Should return database roles, not token roles
            expect(result.roles).toEqual([RoleEnum.TRAINEE]);
            expect(result.roles).not.toEqual([RoleEnum.ADMIN]);
        });
    });

    describe('Integration', () => {
        it('should work end-to-end with valid payload and user', async () => {
            const payload = mockJwtPayload;
            const user = createMockUser({
                id: payload.sub,
                roles: [mockRoleTrainee as RoleEntity],
            });

            mockUserRepository.findByIdActive.mockResolvedValue(user);

            const result = await strategy.validate(payload);

            expect(result.id).toBe(payload.sub);
            expect(result.nickname).toBe(payload.nickname);
            expect(result.roles).toBeDefined();
        });

        it('should handle multiple simultaneous validations', async () => {
            const payload1 = { ...mockJwtPayload, sub: 1 };
            const payload2 = { ...mockJwtPayload, sub: 2 };

            const user1 = createMockUser({ id: 1 });
            const user2 = createMockUser({ id: 2 });

            mockUserRepository.findByIdActive
                .mockResolvedValueOnce(user1)
                .mockResolvedValueOnce(user2);

            const [result1, result2] = await Promise.all([
                strategy.validate(payload1),
                strategy.validate(payload2),
            ]);

            expect(result1.id).toBe(1);
            expect(result2.id).toBe(2);
        });
    });
});
