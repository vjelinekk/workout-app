/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthCodeService } from '../services/auth-code.service';
import { ConfigService } from '@nestjs/config';
import { createMockConfigService } from 'src/common/test/test-helpers';
import {
    mockUserEntity,
    mockLoginResponse,
    createMockUser,
} from 'src/common/test/mock-data';
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Tests for AuthController
 *
 * AuthController handles authentication endpoints:
 * - POST /login - Login with email/password (LocalAuthGuard)
 * - POST /register - Register new user
 * - GET /google - Initiate Google OAuth flow (GoogleAuthGuard)
 * - GET /google/callback - Google OAuth callback (GoogleAuthGuard)
 * - POST /exchange-code - Exchange auth code for login response
 */
describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;
    let authCodeService: any;
    let configService: any;

    beforeEach(async () => {
        authService = {
            login: jest.fn(),
            register: jest.fn(),
        };

        authCodeService = {
            generateAuthCode: jest.fn(),
            exchangeAuthCode: jest.fn(),
        };

        configService = createMockConfigService({
            FRONTEND_URL: 'http://localhost:3000',
        });

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: AuthCodeService, useValue: authCodeService },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    describe('POST /login', () => {
        it('should login user successfully with valid credentials', async () => {
            const user = mockUserEntity;

            authService.login.mockReturnValue(mockLoginResponse);

            const result = controller.login(user as any);

            expect(result).toEqual(mockLoginResponse);
            expect(authService.login).toHaveBeenCalledWith(user);
        });

        it('should return login response with accessToken', async () => {
            const user = createMockUser({ id: 1, email: 'test@example.com' });
            const loginResponse = {
                accessToken: 'jwt-token-123',
                userId: user.id,
                userNickname: user.nickname,
            };

            authService.login.mockReturnValue(loginResponse);

            const result = controller.login(user as any);

            expect(result.accessToken).toBe('jwt-token-123');
            expect(result.userId).toBe(user.id);
        });

        it('should handle different user types', async () => {
            const users = [
                mockUserEntity,
                createMockUser({ id: 2, email: 'trainer@test.com' }),
                createMockUser({ id: 3, email: 'admin@test.com' }),
            ];

            for (const user of users) {
                authService.login.mockReturnValue(mockLoginResponse);

                controller.login(user as any);

                expect(authService.login).toHaveBeenCalledWith(user);
            }
        });

        it('should propagate authentication errors', async () => {
            const user = mockUserEntity;

            authService.login.mockImplementation(() => {
                throw new Error('Invalid credentials');
            });

            expect(() => controller.login(user as any)).toThrow(
                'Invalid credentials',
            );
        });
    });

    describe('POST /register', () => {
        it('should register new user successfully', async () => {
            const registerDto = {
                email: 'newuser@example.com',
                nickname: 'newuser',
                password: 'SecurePassword123!',
                firstName: 'New',
                lastName: 'User',
            };

            authService.register.mockResolvedValue(mockLoginResponse);

            const result = await controller.register(registerDto);

            expect(result).toEqual(mockLoginResponse);
            expect(authService.register).toHaveBeenCalledWith(registerDto);
        });

        it('should return accessToken and user info after registration', async () => {
            const registerDto = {
                email: 'test@example.com',
                nickname: 'testuser',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User',
            };
            const response = {
                accessToken: 'new-jwt-token',
                userId: 5,
                userEmail: registerDto.email,
            };

            authService.register.mockResolvedValue(response);

            const result = await controller.register(registerDto);

            expect(result.accessToken).toBe('new-jwt-token');
            expect(result.userId).toBe(5);
        });

        it('should handle registration with different data', async () => {
            const dtos = [
                {
                    email: 'user1@example.com',
                    nickname: 'user1',
                    password: 'Pass123!',
                    firstName: 'User',
                    lastName: 'One',
                },
                {
                    email: 'user2@example.com',
                    nickname: 'user2',
                    password: 'Pass456!',
                    firstName: 'User',
                    lastName: 'Two',
                },
            ];

            for (const dto of dtos) {
                authService.register.mockResolvedValue(mockLoginResponse);

                await controller.register(dto);

                expect(authService.register).toHaveBeenCalledWith(dto);
            }
        });

        it('should handle registration errors (duplicate email)', async () => {
            const registerDto = {
                email: 'existing@example.com',
                nickname: 'existing',
                password: 'Password123!',
                firstName: 'Existing',
                lastName: 'User',
            };

            authService.register.mockRejectedValue(
                new Error('Email already exists'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow(
                'Email already exists',
            );
        });

        it('should handle registration errors (duplicate nickname)', async () => {
            const registerDto = {
                email: 'new@example.com',
                nickname: 'existing',
                password: 'Password123!',
                firstName: 'New',
                lastName: 'User',
            };

            authService.register.mockRejectedValue(
                new Error('Nickname already taken'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow(
                'Nickname already taken',
            );
        });

        it('should handle weak password validation', async () => {
            const registerDto = {
                email: 'test@example.com',
                nickname: 'testuser',
                password: 'weak',
                firstName: 'Test',
                lastName: 'User',
            };

            authService.register.mockRejectedValue(
                new Error('Password does not meet requirements'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow(
                'Password does not meet requirements',
            );
        });
    });

    describe('GET /google', () => {
        it('should initiate Google OAuth flow', async () => {
            // Google auth endpoint triggers redirect, no direct return
            const result = await controller.googleAuth();

            // googleAuth method is intentionally empty (Passport handles redirect)
            expect(result).toBeUndefined();
        });
    });

    describe('GET /google/callback', () => {
        it('should handle Google OAuth callback successfully', async () => {
            const user = mockUserEntity;
            const mockResponse = {
                redirect: jest.fn(),
            };

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue('auth-code-123');

            controller.googleAuthRedirect(user as any, mockResponse as any);

            expect(authService.login).toHaveBeenCalledWith(user);
            expect(authCodeService.generateAuthCode).toHaveBeenCalledWith(
                mockLoginResponse,
            );
            expect(mockResponse.redirect).toHaveBeenCalled();
        });

        it('should redirect to frontend with auth code', async () => {
            const user = mockUserEntity;
            const mockResponse = {
                redirect: jest.fn(),
            };

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue('test-code-123');

            controller.googleAuthRedirect(user as any, mockResponse as any);

            const redirectCall = mockResponse.redirect.mock.calls[0][0];
            expect(redirectCall).toContain(
                'http://localhost:3000/auth/callback',
            );
            expect(redirectCall).toContain('code=test-code-123');
        });

        it('should throw error when FRONTEND_URL is not configured', async () => {
            const user = mockUserEntity;
            const mockResponse = {
                redirect: jest.fn(),
            };

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue('auth-code');

            // Override configService to return undefined for FRONTEND_URL
            configService.get.mockReturnValue(undefined);

            expect(() =>
                controller.googleAuthRedirect(user as any, mockResponse as any),
            ).toThrow(InternalServerErrorException);
        });

        it('should build correct redirect URL with query parameters', async () => {
            const user = mockUserEntity;
            const mockResponse = {
                redirect: jest.fn(),
            };
            const authCode = 'generated-auth-code-456';

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue(authCode);

            controller.googleAuthRedirect(user as any, mockResponse as any);

            const redirectUrl = mockResponse.redirect.mock.calls[0][0];
            expect(redirectUrl).toContain(`code=${authCode}`);
        });

        it('should handle different users from Google auth', async () => {
            const users = [
                mockUserEntity,
                createMockUser({
                    id: 2,
                    googleId: 'google-id-2',
                    email: 'user2@gmail.com',
                }),
            ];

            for (const user of users) {
                const mockResponse = {
                    redirect: jest.fn(),
                };

                authService.login.mockReturnValue(mockLoginResponse);
                authCodeService.generateAuthCode.mockReturnValue('auth-code');

                controller.googleAuthRedirect(user as any, mockResponse as any);

                expect(authService.login).toHaveBeenCalledWith(user);
            }
        });
    });

    describe('POST /exchange-code', () => {
        it('should exchange valid auth code for login response', async () => {
            const code = 'valid-auth-code-123';

            authCodeService.exchangeAuthCode.mockReturnValue(mockLoginResponse);

            const result = controller.exchangeAuthCode(code);

            expect(result).toEqual(mockLoginResponse);
            expect(authCodeService.exchangeAuthCode).toHaveBeenCalledWith(code);
        });

        it('should return login response with accessToken', async () => {
            const code = 'auth-code-456';
            const response = {
                accessToken: 'jwt-token-from-code',
                userId: 1,
                userEmail: 'user@example.com',
            };

            authCodeService.exchangeAuthCode.mockReturnValue(response);

            const result = controller.exchangeAuthCode(code);

            expect(result.accessToken).toBe('jwt-token-from-code');
        });

        it('should throw UnauthorizedException for invalid code', async () => {
            const code = 'invalid-code';

            authCodeService.exchangeAuthCode.mockReturnValue(null);

            expect(() => controller.exchangeAuthCode(code)).toThrow(
                'Invalid or expired auth code',
            );
        });

        it('should throw UnauthorizedException for expired code', async () => {
            const code = 'expired-code';

            authCodeService.exchangeAuthCode.mockReturnValue(null);

            expect(() => controller.exchangeAuthCode(code)).toThrow(
                'Invalid or expired auth code',
            );
        });

        it('should handle different valid codes', async () => {
            const codes = ['code-1', 'code-2', 'code-3'];

            for (const code of codes) {
                authCodeService.exchangeAuthCode.mockReturnValue(
                    mockLoginResponse,
                );

                controller.exchangeAuthCode(code);

                expect(authCodeService.exchangeAuthCode).toHaveBeenCalledWith(
                    code,
                );
            }
        });

        it('should return null from service for non-existent code', async () => {
            const code = 'non-existent-code';

            authCodeService.exchangeAuthCode.mockReturnValue(null);

            expect(() => controller.exchangeAuthCode(code)).toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should propagate service errors', async () => {
            const registerDto = {
                email: 'test@example.com',
                nickname: 'test',
                password: 'Pass123!',
                firstName: 'Test',
                lastName: 'User',
            };

            authService.register.mockRejectedValue(new Error('Database error'));

            await expect(controller.register(registerDto)).rejects.toThrow(
                'Database error',
            );
        });

        it('should handle auth code service errors', async () => {
            const code = 'test-code';

            authCodeService.exchangeAuthCode.mockImplementation(() => {
                throw new Error('Code service error');
            });

            expect(() => controller.exchangeAuthCode(code)).toThrow(
                'Code service error',
            );
        });
    });

    describe('Configuration', () => {
        it('should use FRONTEND_URL from config', async () => {
            const user = mockUserEntity;
            const mockResponse = {
                redirect: jest.fn(),
            };

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue('auth-code');

            controller.googleAuthRedirect(user as any, mockResponse as any);

            expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
        });

        it('should handle different FRONTEND_URL configurations', async () => {
            const user = mockUserEntity;

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue('auth-code');

            const urls = [
                'http://localhost:3000',
                'http://localhost:8000',
                'https://example.com',
            ];

            for (const url of urls) {
                const mockResponse = {
                    redirect: jest.fn(),
                };

                configService.get.mockReturnValue(url);

                controller.googleAuthRedirect(user as any, mockResponse as any);

                expect(mockResponse.redirect).toHaveBeenCalled();
            }
        });
    });

    describe('Request/Response Handling', () => {
        it('should handle response object in google callback', async () => {
            const user = mockUserEntity;
            const mockResponse = {
                redirect: jest.fn(),
            };

            authService.login.mockReturnValue(mockLoginResponse);
            authCodeService.generateAuthCode.mockReturnValue('auth-code');

            controller.googleAuthRedirect(user as any, mockResponse as any);

            expect(mockResponse.redirect).toHaveBeenCalledWith(
                expect.stringContaining('/auth/callback'),
            );
        });
    });
});
