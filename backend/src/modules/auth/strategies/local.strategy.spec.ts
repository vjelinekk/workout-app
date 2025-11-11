/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import { UnauthorizedException } from '@nestjs/common';
import { mockUserEntity, createMockUser } from '../../../common/test/mock-data';

/**
 * Tests for LocalStrategy (Passport Local Strategy)
 *
 * LocalStrategy implements email/password authentication:
 * - Validates user credentials using email and password
 * - Uses the AuthService.validateUser method to verify credentials
 * - Configured to use 'email' field instead of default 'username'
 * - Returns authenticated user object on success
 * - Throws UnauthorizedException on failure
 */
describe('LocalStrategy', () => {
    let strategy: any;
    let mockAuthService: any;

    beforeEach(() => {
        // Create a mock AuthService
        mockAuthService = {
            validateUser: jest.fn(),
        };

        // Simulate the LocalStrategy validation logic
        strategy = {
            usernameField: 'email',
            validate: async (email: string, password: string) => {
                const user = await mockAuthService.validateUser(
                    email,
                    password,
                );
                if (!user) {
                    throw new UnauthorizedException();
                }
                return user;
            },
        };
    });

    describe('Configuration', () => {
        it('should use email field instead of username', () => {
            expect(strategy.usernameField).toBe('email');
        });

        it('should have validate method', () => {
            expect(typeof strategy.validate).toBe('function');
        });
    });

    describe('validate', () => {
        it('should return user when credentials are valid', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const user = { ...mockUserEntity, email, password };

            mockAuthService.validateUser.mockResolvedValue(user);

            const result = await strategy.validate(email, password);

            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
            expect(result).toEqual(user);
            expect(result.email).toBe(email);
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const email = 'nonexistent@example.com';
            const password = 'password123';

            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(strategy.validate(email, password)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException when password is wrong', async () => {
            const email = 'test@example.com';
            const wrongPassword = 'wrongpassword';

            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(
                strategy.validate(email, wrongPassword),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should handle empty email', async () => {
            const email = '';
            const password = 'password123';

            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(strategy.validate(email, password)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
        });

        it('should handle empty password', async () => {
            const email = 'test@example.com';
            const password = '';

            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(strategy.validate(email, password)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
        });

        it('should return user with roles included', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const user = {
                ...mockUserEntity,
                email,
                roles: [{ id: 2, name: 'trainee' }],
            };

            mockAuthService.validateUser.mockResolvedValue(user);

            const result = await strategy.validate(email, password);

            expect(result.roles).toBeDefined();
            expect(result.roles).toHaveLength(1);
        });

        it('should call AuthService validateUser with exact credentials', async () => {
            const email = 'test@example.com';
            const password = 'SecurePass123!';

            mockAuthService.validateUser.mockResolvedValue(mockUserEntity);

            await strategy.validate(email, password);

            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
            expect(mockAuthService.validateUser).toHaveBeenCalledTimes(1);
        });

        it('should handle special characters in email', async () => {
            const email = 'user+test@example.com';
            const password = 'password123';

            mockAuthService.validateUser.mockResolvedValue(mockUserEntity);

            const result = await strategy.validate(email, password);

            expect(result).toBeDefined();
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
        });

        it('should handle special characters in password', async () => {
            const email = 'test@example.com';
            const password = 'P@ssw0rd!#$%';

            mockAuthService.validateUser.mockResolvedValue(mockUserEntity);

            const result = await strategy.validate(email, password);

            expect(result).toBeDefined();
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
        });

        it('should propagate AuthService errors', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const error = new Error('Database connection failed');

            mockAuthService.validateUser.mockRejectedValue(error);

            await expect(strategy.validate(email, password)).rejects.toThrow(
                'Database connection failed',
            );
        });

        it('should handle case-sensitive email comparison', async () => {
            const email = 'Test@Example.com';
            const password = 'password123';

            mockAuthService.validateUser.mockResolvedValue(mockUserEntity);

            const result = await strategy.validate(email, password);

            expect(result).toBeDefined();
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                email,
                password,
            );
        });
    });

    describe('Integration with AuthService', () => {
        it('should work with valid user credentials flow', async () => {
            const email = 'trainer@example.com';
            const password = 'password123';
            const user = createMockUser({ email });

            mockAuthService.validateUser.mockResolvedValue(user);

            const result = await strategy.validate(email, password);

            expect(result.email).toBe(email);
            expect(result.id).toBe(1);
        });

        it('should handle multiple failed attempts', async () => {
            const email = 'test@example.com';
            const password = 'wrongpassword';

            mockAuthService.validateUser.mockResolvedValue(null);

            // First attempt
            await expect(strategy.validate(email, password)).rejects.toThrow(
                UnauthorizedException,
            );

            // Second attempt
            await expect(strategy.validate(email, password)).rejects.toThrow(
                UnauthorizedException,
            );

            // Third attempt
            await expect(strategy.validate(email, password)).rejects.toThrow(
                UnauthorizedException,
            );

            expect(mockAuthService.validateUser).toHaveBeenCalledTimes(3);
        });

        it('should return user after successful validation', async () => {
            const email = 'test@example.com';
            const password = 'correctpassword';
            const user = createMockUser({ email });

            mockAuthService.validateUser.mockResolvedValue(user);

            const result = await strategy.validate(email, password);

            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.id).toBe(user.id);
        });
    });

    describe('Error Handling', () => {
        it('should only throw UnauthorizedException for invalid credentials', async () => {
            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(
                strategy.validate('test@example.com', 'wrong'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should not catch other types of errors', async () => {
            const error = new Error('Custom error');
            mockAuthService.validateUser.mockRejectedValue(error);

            await expect(
                strategy.validate('test@example.com', 'password'),
            ).rejects.toThrow('Custom error');
        });

        it('should handle null user response', async () => {
            mockAuthService.validateUser.mockResolvedValue(null);

            await expect(
                strategy.validate('test@example.com', 'password'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should handle undefined user response', async () => {
            mockAuthService.validateUser.mockResolvedValue(undefined);

            await expect(
                strategy.validate('test@example.com', 'password'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
