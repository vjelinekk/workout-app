/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await, @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument */

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import {
    mockUserEntity,
    mockLoginResponse,
    mockRegisterRequestDto,
    mockRoleTrainee,
} from '../../../common/test/mock-data';
import {
    createMockJwtService,
    createMockRepository,
} from '../../../common/test/test-helpers';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('../../../common/utils/hash');

// Import after mocking
import * as hashUtil from '../../../common/utils/hash';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: any;
    let roleRepository: any;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        userRepository = createMockRepository();
        roleRepository = createMockRepository();
        jwtService = createMockJwtService();

        // Create a minimal test module using mocks
        // We'll directly instantiate the service with mocked dependencies
        service = new AuthService(userRepository, roleRepository, jwtService);
    });

    describe('validateUser', () => {
        it('should return user when credentials are valid', async () => {
            const password = 'password123';
            const userWithPassword = {
                ...mockUserEntity,
                password: '$2b$10$hashedPassword',
            };

            userRepository.findByEmail.mockResolvedValue(
                userWithPassword as any,
            );
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(
                mockUserEntity.email as string,
                password,
            );

            expect(result).toEqual(userWithPassword);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                mockUserEntity.email,
            );
            expect(bcrypt.compare).toHaveBeenCalledWith(
                password,
                userWithPassword.password,
            );
        });

        it('should throw UnauthorizedException when user not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                service.validateUser('nonexistent@example.com', 'password123'),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                service.validateUser('nonexistent@example.com', 'password123'),
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw UnauthorizedException when password does not match', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUserEntity as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.validateUser(
                    mockUserEntity.email as string,
                    'wrongpassword',
                ),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                service.validateUser(
                    mockUserEntity.email as string,
                    'wrongpassword',
                ),
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw UnauthorizedException for empty password', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUserEntity as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.validateUser(mockUserEntity.email as string, ''),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should return login response with valid JWT token', () => {
            jwtService.sign.mockReturnValue(mockLoginResponse.accessToken);

            const result = service.login(mockUserEntity as any);

            expect(result).toEqual(mockLoginResponse);
            expect(jwtService.sign).toHaveBeenCalledWith({
                nickname: mockUserEntity.nickname,
                sub: mockUserEntity.id,
                roles: [2], // RoleEnum.TRAINEE
            });
        });

        it('should include all user information in response', () => {
            jwtService.sign.mockReturnValue('test-token');

            const result = service.login(mockUserEntity as any);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('userId', mockUserEntity.id);
            expect(result).toHaveProperty(
                'userFirstName',
                mockUserEntity.firstName,
            );
            expect(result).toHaveProperty(
                'userLastName',
                mockUserEntity.lastName,
            );
            expect(result).toHaveProperty(
                'userNickname',
                mockUserEntity.nickname,
            );
            expect(result).toHaveProperty('userEmail', mockUserEntity.email);
            expect(result).toHaveProperty('roles');
        });

        it('should extract role IDs from user roles', () => {
            jwtService.sign.mockReturnValue('test-token');

            const userWithMultipleRoles = {
                ...mockUserEntity,
                roles: [
                    { id: 1, name: 'admin' } as any,
                    { id: 2, name: 'trainer' } as any,
                    { id: 3, name: 'user' } as any,
                ],
            };

            const result = service.login(userWithMultipleRoles as any);

            expect(result.roles).toEqual([1, 2, 3]);
        });

        it('should handle user with no roles', () => {
            jwtService.sign.mockReturnValue('test-token');

            const userWithNoRoles = {
                ...mockUserEntity,
                roles: [],
            };

            const result = service.login(userWithNoRoles as any);

            expect(result.roles).toEqual([]);
            expect(jwtService.sign).toHaveBeenCalledWith({
                nickname: mockUserEntity.nickname,
                sub: mockUserEntity.id,
                roles: [],
            });
        });
    });

    describe('register', () => {
        it('should register new user with hashed password', async () => {
            const hashedPassword = '$2b$10$hashedPassword';
            (hashUtil.hashPassword as jest.Mock).mockReturnValue(
                hashedPassword,
            );
            roleRepository.getDefaultRole.mockResolvedValue(
                mockRoleTrainee as any,
            );
            userRepository.create.mockReturnValue({
                ...mockRegisterRequestDto,
                password: hashedPassword,
                roles: [mockRoleTrainee],
            } as any);
            userRepository.save.mockResolvedValue({
                ...mockRegisterRequestDto,
                id: 5,
                password: hashedPassword,
                roles: [mockRoleTrainee],
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            jwtService.sign.mockReturnValue('test-jwt-token');

            const result = await service.register(mockRegisterRequestDto);

            expect(hashUtil.hashPassword).toHaveBeenCalledWith(
                mockRegisterRequestDto.password,
            );
            expect(roleRepository.getDefaultRole).toHaveBeenCalled();
            expect(userRepository.create).toHaveBeenCalledWith({
                email: mockRegisterRequestDto.email,
                firstName: mockRegisterRequestDto.firstName,
                lastName: mockRegisterRequestDto.lastName,
                nickname: mockRegisterRequestDto.nickname,
                password: hashedPassword,
                roles: [mockRoleTrainee],
            });
            expect(userRepository.save).toHaveBeenCalled();
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('userId');
        });

        it('should throw UnauthorizedException when default role not found', async () => {
            (hashUtil.hashPassword as jest.Mock).mockReturnValue(
                'hashedPassword',
            );
            roleRepository.getDefaultRole.mockResolvedValue(null);

            await expect(
                service.register(mockRegisterRequestDto),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                service.register(mockRegisterRequestDto),
            ).rejects.toThrow('Default role not found');
        });

        it('should save user with all registration data', async () => {
            const hashedPassword = 'hashed-pass-123';
            (hashUtil.hashPassword as jest.Mock).mockReturnValue(
                hashedPassword,
            );
            roleRepository.getDefaultRole.mockResolvedValue(
                mockRoleTrainee as any,
            );

            const createdUser = {
                ...mockRegisterRequestDto,
                id: 10,
                password: hashedPassword,
                roles: [mockRoleTrainee],
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            userRepository.create.mockReturnValue(createdUser as any);
            userRepository.save.mockResolvedValue(createdUser as any);
            jwtService.sign.mockReturnValue('new-token');

            await service.register(mockRegisterRequestDto);

            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: mockRegisterRequestDto.email,
                    firstName: mockRegisterRequestDto.firstName,
                    lastName: mockRegisterRequestDto.lastName,
                    nickname: mockRegisterRequestDto.nickname,
                }),
            );
        });

        it('should return login response after successful registration', async () => {
            const hashedPassword = '$2b$10$hashed';
            const savedUser = {
                ...mockRegisterRequestDto,
                id: 7,
                password: hashedPassword,
                roles: [mockRoleTrainee],
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (hashUtil.hashPassword as jest.Mock).mockReturnValue(
                hashedPassword,
            );
            roleRepository.getDefaultRole.mockResolvedValue(
                mockRoleTrainee as any,
            );
            userRepository.create.mockReturnValue(savedUser as any);
            userRepository.save.mockResolvedValue(savedUser as any);
            jwtService.sign.mockReturnValue('registration-token');

            const result = await service.register(mockRegisterRequestDto);

            expect(result).toHaveProperty('accessToken', 'registration-token');
            expect(result).toHaveProperty('userId', savedUser.id);
            expect(result).toHaveProperty(
                'userFirstName',
                mockRegisterRequestDto.firstName,
            );
            expect(result).toHaveProperty(
                'userLastName',
                mockRegisterRequestDto.lastName,
            );
            expect(result).toHaveProperty(
                'userNickname',
                mockRegisterRequestDto.nickname,
            );
            expect(result).toHaveProperty(
                'userEmail',
                mockRegisterRequestDto.email,
            );
        });
    });

    describe('password hashing', () => {
        it('should hash password during registration', async () => {
            const plainPassword = mockRegisterRequestDto.password;
            const hashedPassword = '$2b$10$hashedpassword';

            (hashUtil.hashPassword as jest.Mock).mockReturnValue(
                hashedPassword,
            );
            roleRepository.getDefaultRole.mockResolvedValue(
                mockRoleTrainee as any,
            );
            userRepository.create.mockReturnValue({} as any);
            userRepository.save.mockResolvedValue({
                id: 1,
                roles: [mockRoleTrainee],
            } as any);
            jwtService.sign.mockReturnValue('token');

            await service.register(mockRegisterRequestDto);

            expect(hashUtil.hashPassword).toHaveBeenCalledWith(plainPassword);
        });

        it('should not store plaintext password', async () => {
            const hashedPassword = '$2b$10$secure';
            (hashUtil.hashPassword as jest.Mock).mockReturnValue(
                hashedPassword,
            );
            roleRepository.getDefaultRole.mockResolvedValue(
                mockRoleTrainee as any,
            );
            userRepository.create.mockReturnValue({} as any);
            userRepository.save.mockResolvedValue({
                id: 1,
                roles: [mockRoleTrainee],
            } as any);
            jwtService.sign.mockReturnValue('token');

            await service.register(mockRegisterRequestDto);

            const createCall = userRepository.create.mock.calls[0][0];
            expect(createCall.password).not.toEqual(
                mockRegisterRequestDto.password,
            );
            expect(createCall.password).toEqual(hashedPassword);
        });
    });

    describe('error handling', () => {
        it('should handle repository errors during validateUser', async () => {
            userRepository.findByEmail.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                service.validateUser('test@example.com', 'password'),
            ).rejects.toThrow('Database error');
        });

        it('should handle bcrypt comparison errors', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUserEntity as any);
            (bcrypt.compare as jest.Mock).mockRejectedValue(
                new Error('Bcrypt error'),
            );

            await expect(
                service.validateUser('test@example.com', 'password'),
            ).rejects.toThrow('Bcrypt error');
        });

        it('should handle JWT signing errors', () => {
            jwtService.sign.mockImplementation(() => {
                throw new Error('JWT signing error');
            });

            expect(() => service.login(mockUserEntity as any)).toThrow(
                'JWT signing error',
            );
        });
    });
});
