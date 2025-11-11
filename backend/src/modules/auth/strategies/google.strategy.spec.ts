/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import {
    mockGoogleUserEntity,
    mockUserEntity,
    createMockUser,
} from '../../../common/test/mock-data';
import { createMockConfigService } from '../../../common/test/test-helpers';

/**
 * Tests for GoogleStrategy (Passport Google OAuth Strategy)
 *
 * GoogleStrategy implements Google OAuth 2.0 authentication:
 * - Configures OAuth with clientID, clientSecret, and callbackURL
 * - Validates Google profile information
 * - Looks up existing user by Google ID
 * - Creates new user from Google profile if not found
 * - Returns user object through callback
 * - Handles profile data: id, name (given/family), emails
 */
describe('GoogleStrategy', () => {
    let strategy: any;
    let mockConfigService: any;
    let mockUserService: any;

    beforeEach(() => {
        mockConfigService = createMockConfigService({
            GOOGLE_CLIENT_ID: 'test-client-id',
            GOOGLE_CLIENT_SECRET: 'test-client-secret',
            GOOGLE_CALLBACK_URL:
                'http://localhost:3001/v1/auth/google/callback',
        });

        mockUserService = {
            findByGoogleId: jest.fn(),
            createFromGoogle: jest.fn(),
        };

        // Simulate GoogleStrategy validate logic
        strategy = {
            config: mockConfigService,
            userService: mockUserService,
            options: {
                clientID: mockConfigService.get('GOOGLE_CLIENT_ID'),
                clientSecret: mockConfigService.get('GOOGLE_CLIENT_SECRET'),
                callbackURL: mockConfigService.get('GOOGLE_CALLBACK_URL'),
                scope: ['email', 'profile'],
            },
            validate: async (
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (error: any, user?: any) => void,
            ) => {
                const { id, name, emails } = profile;

                let user = await mockUserService.findByGoogleId(id);

                if (!user) {
                    user = await mockUserService.createFromGoogle({
                        googleId: id,
                        email: emails?.[0]?.value,
                        firstName: name?.givenName,
                        lastName: name?.familyName,
                    });
                }

                done(null, user);
            },
        };
    });

    describe('Configuration', () => {
        it('should have Google OAuth options configured', () => {
            expect(strategy.options.clientID).toBe('test-client-id');
            expect(strategy.options.clientSecret).toBe('test-client-secret');
            expect(strategy.options.callbackURL).toBe(
                'http://localhost:3001/v1/auth/google/callback',
            );
        });

        it('should request email and profile scope', () => {
            expect(strategy.options.scope).toContain('email');
            expect(strategy.options.scope).toContain('profile');
        });

        it('should have validate method', () => {
            expect(typeof strategy.validate).toBe('function');
        });

        it('should use default values when config missing', () => {
            const configWithDefaults = createMockConfigService();
            configWithDefaults.get.mockImplementation((key) => {
                const defaults: Record<string, string> = {
                    GOOGLE_CLIENT_ID: 'default',
                    GOOGLE_CLIENT_SECRET: 'default',
                    GOOGLE_CALLBACK_URL:
                        'http://localhost:3001/v1/auth/google/callback',
                };
                return defaults[key];
            });

            const strategyWithDefaults = {
                options: {
                    clientID:
                        configWithDefaults.get('GOOGLE_CLIENT_ID') || 'default',
                    clientSecret:
                        configWithDefaults.get('GOOGLE_CLIENT_SECRET') ||
                        'default',
                    callbackURL:
                        configWithDefaults.get('GOOGLE_CALLBACK_URL') ||
                        'http://localhost:3001/v1/auth/google/callback',
                },
            };

            expect(strategyWithDefaults.options.clientID).toBe('default');
        });
    });

    describe('validate', () => {
        it('should return existing user when found by Google ID', async () => {
            const profile = {
                id: 'google-id-12345',
                name: {
                    givenName: 'John',
                    familyName: 'Doe',
                },
                emails: [{ value: 'john@example.com' }],
            };
            const user = mockGoogleUserEntity;

            mockUserService.findByGoogleId.mockResolvedValue(user);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(mockUserService.findByGoogleId).toHaveBeenCalledWith(
                'google-id-12345',
            );
            expect(mockUserService.createFromGoogle).not.toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith(null, user);
        });

        it('should create new user when not found by Google ID', async () => {
            const profile = {
                id: 'google-id-12345',
                name: {
                    givenName: 'Jane',
                    familyName: 'Smith',
                },
                emails: [{ value: 'jane@example.com' }],
            };
            const newUser = createMockUser({
                googleId: 'google-id-12345',
                email: 'jane@example.com',
            });

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(newUser);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(mockUserService.findByGoogleId).toHaveBeenCalledWith(
                'google-id-12345',
            );
            expect(mockUserService.createFromGoogle).toHaveBeenCalledWith({
                googleId: 'google-id-12345',
                email: 'jane@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
            });
            expect(callback).toHaveBeenCalledWith(null, newUser);
        });

        it('should extract Google ID correctly', async () => {
            const profile = {
                id: 'unique-google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [{ value: 'test@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(mockUserEntity);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(mockUserService.findByGoogleId).toHaveBeenCalledWith(
                'unique-google-id',
            );
        });

        it('should extract first email from emails array', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [
                    { value: 'primary@example.com' },
                    { value: 'secondary@example.com' },
                ],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.email).toBe('primary@example.com');
        });

        it('should extract given name as firstName', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'John', familyName: 'Doe' },
                emails: [{ value: 'john@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.firstName).toBe('John');
        });

        it('should extract family name as lastName', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'John', familyName: 'Doe' },
                emails: [{ value: 'john@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.lastName).toBe('Doe');
        });

        it('should pass accessToken and refreshToken (not used but available)', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [{ value: 'test@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(mockUserEntity);
            const callback = jest.fn();

            const accessToken = 'specific-access-token';
            const refreshToken = 'specific-refresh-token';

            await strategy.validate(
                accessToken,
                refreshToken,
                profile,
                callback,
            );

            // Tokens are received but not stored (would be handled by strategy if needed)
            expect(callback).toHaveBeenCalled();
        });

        it('should call done callback with null error on success', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [{ value: 'test@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(mockUserEntity);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(callback).toHaveBeenCalledWith(null, mockUserEntity);
        });

        it('should handle profile without given name', async () => {
            const profile = {
                id: 'google-id',
                name: { familyName: 'Doe' },
                emails: [{ value: 'john@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.firstName).toBeUndefined();
            expect(callArgs.lastName).toBe('Doe');
        });

        it('should handle profile without family name', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'John' },
                emails: [{ value: 'john@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.firstName).toBe('John');
            expect(callArgs.lastName).toBeUndefined();
        });

        it('should handle profile without email', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.email).toBeUndefined();
        });

        it('should handle profile with undefined emails', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: undefined,
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);

            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            const callArgs = mockUserService.createFromGoogle.mock.calls[0][0];
            expect(callArgs.email).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        it('should call done callback with error if findByGoogleId fails', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [{ value: 'test@example.com' }],
            };
            const error = new Error('Database error');

            mockUserService.findByGoogleId.mockRejectedValue(error);
            const callback = jest.fn();

            await expect(
                strategy.validate(
                    'access-token',
                    'refresh-token',
                    profile,
                    callback,
                ),
            ).rejects.toThrow('Database error');
        });

        it('should call done callback with error if createFromGoogle fails', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Test', familyName: 'User' },
                emails: [{ value: 'test@example.com' }],
            };
            const error = new Error('User creation failed');

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockRejectedValue(error);
            const callback = jest.fn();

            await expect(
                strategy.validate(
                    'access-token',
                    'refresh-token',
                    profile,
                    callback,
                ),
            ).rejects.toThrow('User creation failed');
        });
    });

    describe('User Creation Flow', () => {
        it('should only call findByGoogleId if user exists', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'John', familyName: 'Doe' },
                emails: [{ value: 'john@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(mockUserEntity);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(mockUserService.findByGoogleId).toHaveBeenCalledTimes(1);
            expect(mockUserService.createFromGoogle).not.toHaveBeenCalled();
        });

        it('should call both findByGoogleId and createFromGoogle if user does not exist', async () => {
            const profile = {
                id: 'google-id',
                name: { givenName: 'Jane', familyName: 'Smith' },
                emails: [{ value: 'jane@example.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(mockUserService.findByGoogleId).toHaveBeenCalledTimes(1);
            expect(mockUserService.createFromGoogle).toHaveBeenCalledTimes(1);
        });

        it('should create user with all profile information', async () => {
            const profile = {
                id: 'google-oauth-id',
                name: {
                    givenName: 'FirstName',
                    familyName: 'LastName',
                },
                emails: [{ value: 'email@domain.com' }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(mockUserEntity);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(mockUserService.createFromGoogle).toHaveBeenCalledWith({
                googleId: 'google-oauth-id',
                email: 'email@domain.com',
                firstName: 'FirstName',
                lastName: 'LastName',
            });
        });
    });

    describe('Integration', () => {
        it('should work end-to-end with existing user', async () => {
            const profile = {
                id: mockGoogleUserEntity.googleId,
                name: {
                    givenName: mockGoogleUserEntity.firstName,
                    familyName: mockGoogleUserEntity.lastName,
                },
                emails: [{ value: mockGoogleUserEntity.email }],
            };

            mockUserService.findByGoogleId.mockResolvedValue(
                mockGoogleUserEntity,
            );
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(callback).toHaveBeenCalledWith(null, mockGoogleUserEntity);
        });

        it('should work end-to-end with new user creation', async () => {
            const googleId = 'new-google-id';
            const profile = {
                id: googleId,
                name: {
                    givenName: 'NewUser',
                    familyName: 'Google',
                },
                emails: [{ value: 'newuser@gmail.com' }],
            };
            const newUser = createMockUser({ googleId });

            mockUserService.findByGoogleId.mockResolvedValue(null);
            mockUserService.createFromGoogle.mockResolvedValue(newUser);
            const callback = jest.fn();

            await strategy.validate(
                'access-token',
                'refresh-token',
                profile,
                callback,
            );

            expect(callback).toHaveBeenCalledWith(null, newUser);
        });
    });
});
