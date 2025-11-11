/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import {
    mockUserEntity,
    mockTrainerUserEntity,
    mockAdminUserEntity,
    mockRoleTrainee,
    mockRoleTrainer,
} from '../../../common/test/mock-data';
import { createMockRepository } from '../../../common/test/test-helpers';
import { RoleEnum } from '../enums/role.enum';

jest.mock('../../../common/utils/hash');

describe('UserService', () => {
    let service: UserService;
    let userRepository: any;
    let rolesRepository: any;

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = createMockRepository();
        rolesRepository = createMockRepository();

        service = new UserService(userRepository, rolesRepository);
    });

    describe('findByEmail', () => {
        it('should return user when email exists', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUserEntity);

            const result = await service.findByEmail(
                mockUserEntity.email as string,
            );

            expect(result).toEqual(mockUserEntity);
            expect(userRepository.findByEmail).toHaveBeenCalledWith(
                mockUserEntity.email,
            );
        });

        it('should throw NotFoundException when email not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                service.findByEmail('nonexistent@example.com'),
            ).rejects.toThrow(NotFoundException);
            await expect(
                service.findByEmail('nonexistent@example.com'),
            ).rejects.toThrow(
                'User with email nonexistent@example.com not found',
            );
        });
    });

    describe('findByGoogleId', () => {
        it('should return user when Google ID exists', async () => {
            const googleUser = { ...mockUserEntity, googleId: 'google-123' };
            userRepository.findByGoogleId.mockResolvedValue(googleUser);

            const result = await service.findByGoogleId('google-123');

            expect(result).toEqual(googleUser);
            expect(userRepository.findByGoogleId).toHaveBeenCalledWith(
                'google-123',
            );
        });

        it('should return null when Google ID not found', async () => {
            userRepository.findByGoogleId.mockResolvedValue(null);

            const result = await service.findByGoogleId(
                'nonexistent-google-id',
            );

            expect(result).toBeNull();
        });
    });

    describe('createFromGoogle', () => {
        it('should create user from Google credentials', async () => {
            const googleData = {
                googleId: 'google-oauth-123',
                email: 'google-user@example.com',
                firstName: 'Google',
                lastName: 'User',
            };

            rolesRepository.getDefaultRole.mockResolvedValue(mockRoleTrainee);
            userRepository.create.mockReturnValue({
                ...googleData,
                nickname: 'google-user',
                roles: [mockRoleTrainee],
            });
            userRepository.save.mockResolvedValue({
                id: 5,
                ...googleData,
                nickname: 'google-user',
                password: 'hashed-password',
                roles: [mockRoleTrainee],
            });

            const result = await service.createFromGoogle(googleData);

            expect(result).toBeDefined();
            expect(result.id).toBe(5);
            expect(rolesRepository.getDefaultRole).toHaveBeenCalled();
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    googleId: googleData.googleId,
                    email: googleData.email,
                    firstName: googleData.firstName,
                    lastName: googleData.lastName,
                }),
            );
        });

        it('should throw NotFoundException when default role not found', async () => {
            rolesRepository.getDefaultRole.mockResolvedValue(null);

            const googleData = {
                googleId: 'google-123',
                email: 'user@example.com',
                firstName: 'Test',
                lastName: 'User',
            };

            await expect(service.createFromGoogle(googleData)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.createFromGoogle(googleData)).rejects.toThrow(
                'Default role not found',
            );
        });

        it('should generate nickname from email', async () => {
            const googleData = {
                googleId: 'google-123',
                email: 'testuser@example.com',
                firstName: 'Test',
                lastName: 'User',
            };

            rolesRepository.getDefaultRole.mockResolvedValue(mockRoleTrainee);
            userRepository.create.mockReturnValue({});
            userRepository.save.mockResolvedValue({
                id: 1,
                ...googleData,
                nickname: 'testuser',
            });

            await service.createFromGoogle(googleData);

            const createCall = userRepository.create.mock.calls[0][0];
            expect(createCall.nickname).toBe('testuser');
        });

        it('should generate nickname from timestamp when email undefined', async () => {
            const googleData = {
                googleId: 'google-123',
                email: undefined,
                firstName: 'Test',
                lastName: 'User',
            };

            rolesRepository.getDefaultRole.mockResolvedValue(mockRoleTrainee);
            userRepository.create.mockReturnValue({});
            userRepository.save.mockResolvedValue({ id: 1 });

            await service.createFromGoogle(googleData);

            const createCall = userRepository.create.mock.calls[0][0];
            expect(createCall.nickname).toMatch(/^user\d+$/);
        });

        it('should assign default role to new Google user', async () => {
            const googleData = {
                googleId: 'google-123',
                email: 'google@example.com',
                firstName: 'Google',
                lastName: 'User',
            };

            rolesRepository.getDefaultRole.mockResolvedValue(mockRoleTrainee);
            userRepository.create.mockReturnValue({});
            userRepository.save.mockResolvedValue({ id: 1 });

            await service.createFromGoogle(googleData);

            const createCall = userRepository.create.mock.calls[0][0];
            expect(createCall.roles).toEqual([mockRoleTrainee]);
        });
    });

    describe('findByIdWithRoles', () => {
        it('should return user with roles when user exists', async () => {
            const userWithRoles = {
                ...mockUserEntity,
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(userWithRoles);

            const result = await service.findByIdWithRoles(1);

            expect(result).toEqual(userWithRoles);
            expect(userRepository.findByIdActive).toHaveBeenCalledWith(1, {
                roles: true,
            });
        });

        it('should throw NotFoundException when user not found', async () => {
            userRepository.findByIdActive.mockResolvedValue(null);

            await expect(service.findByIdWithRoles(999)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.findByIdWithRoles(999)).rejects.toThrow(
                'User not found',
            );
        });
    });

    describe('findByIdForBecomeTrainer', () => {
        it('should return user when user exists and is not trainer', async () => {
            const userWithRoles = {
                ...mockUserEntity,
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(userWithRoles);

            const result = await service.findByIdForBecomeTrainer(1);

            expect(result).toEqual(userWithRoles);
        });

        it('should throw BadRequestException when user already has trainer role', async () => {
            const trainerUser = {
                ...mockUserEntity,
                roles: [mockRoleTrainee, mockRoleTrainer],
            };
            userRepository.findByIdActive.mockResolvedValue(trainerUser);

            await expect(service.findByIdForBecomeTrainer(2)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.findByIdForBecomeTrainer(2)).rejects.toThrow(
                'User is already a trainer',
            );
        });

        it('should throw NotFoundException when user does not exist', async () => {
            userRepository.findByIdActive.mockResolvedValue(null);

            await expect(service.findByIdForBecomeTrainer(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findAllAdmins', () => {
        it('should return all admin users', async () => {
            const admins = [mockAdminUserEntity];
            userRepository.findActive.mockResolvedValue(admins);

            const result = await service.findAllAdmins();

            expect(result).toEqual(admins);
            expect(userRepository.findActive).toHaveBeenCalledWith({
                where: {
                    roles: {
                        id: RoleEnum.ADMIN,
                    },
                },
            });
        });

        it('should return empty array when no admins exist', async () => {
            userRepository.findActive.mockResolvedValue([]);

            const result = await service.findAllAdmins();

            expect(result).toEqual([]);
        });
    });

    describe('findAllAdminsEmails', () => {
        it('should return array of admin emails', async () => {
            const admins = [
                { ...mockAdminUserEntity, email: 'admin1@example.com' },
                { ...mockAdminUserEntity, email: 'admin2@example.com' },
            ];
            userRepository.findActive.mockResolvedValue(admins);

            const result = await service.findAllAdminsEmails();

            expect(result).toEqual([
                'admin1@example.com',
                'admin2@example.com',
            ]);
        });

        it('should return empty array when no admins exist', async () => {
            userRepository.findActive.mockResolvedValue([]);

            const result = await service.findAllAdminsEmails();

            expect(result).toEqual([]);
        });
    });

    describe('requestBecomeTrainer', () => {
        it('should update user trainer request flags', async () => {
            const user = { ...mockUserEntity, wantToBecomeTrainer: false };
            userRepository.findByIdActive.mockResolvedValue(user);
            userRepository.save.mockResolvedValue({
                ...user,
                wantToBecomeTrainer: true,
                becomeTrainerReason: 'I want to coach',
            });

            const result = await service.requestBecomeTrainer(
                1,
                'I want to coach',
            );

            expect(result.wantToBecomeTrainer).toBe(true);
            expect(result.becomeTrainerReason).toBe('I want to coach');
            expect(userRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if user already requested trainer status', async () => {
            const user = {
                ...mockUserEntity,
                wantToBecomeTrainer: true,
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(user);

            await expect(
                service.requestBecomeTrainer(1, 'reason'),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.requestBecomeTrainer(1, 'reason'),
            ).rejects.toThrow('User has already requested to become a trainer');
        });

        it('should throw BadRequestException if user already has trainer role', async () => {
            userRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.requestBecomeTrainer(999, 'reason'),
            ).rejects.toThrow();
        });
    });

    describe('getAll', () => {
        const mockJwtUser = {
            id: 1,
            nickname: 'trainer',
            email: 'trainer@example.com',
            roles: [RoleEnum.TRAINER],
        };

        it('should return users without recruitment filter for simple case', async () => {
            const users = [mockUserEntity, mockTrainerUserEntity];
            userRepository.findActive.mockResolvedValue(users);

            const result = await service.getAll(mockJwtUser);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(userRepository.findActive).toHaveBeenCalled();
        });

        it('should filter by trainer requests when specified', async () => {
            const trainerRequestUsers = [
                { ...mockUserEntity, wantToBecomeTrainer: true },
            ];
            userRepository.findActive.mockResolvedValue(trainerRequestUsers);

            await service.getAll(mockJwtUser, true);

            const callArgs = userRepository.findActive.mock.calls[0][0];
            expect(callArgs.where.wantToBecomeTrainer).toBe(true);
        });

        it('should filter by roles when specified', async () => {
            const trainerUsers = [mockTrainerUserEntity];
            userRepository.findActive.mockResolvedValue(trainerUsers);

            await service.getAll(mockJwtUser, false, [RoleEnum.TRAINER]);

            const callArgs = userRepository.findActive.mock.calls[0][0];
            expect(callArgs.where.roles).toBeDefined();
        });

        it('should use query builder when excluding recruited trainees', async () => {
            const mockQueryBuilder = {
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([mockUserEntity]),
            };

            userRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.getAll(mockJwtUser, false, [RoleEnum.TRAINEE], true);

            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith(
                'user',
            );
            expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
        });

        it('should format response as UserResponseDto', async () => {
            const userWithRoles = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };
            userRepository.findActive.mockResolvedValue([userWithRoles]);

            const result = await service.getAll(mockJwtUser);

            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('email');
            expect(result[0]).toHaveProperty('firstName');
            expect(result[0]).toHaveProperty('lastName');
            expect(result[0]).toHaveProperty('nickname');
            expect(result[0]).toHaveProperty('roles');
        });
    });

    describe('resolveTrainerApplication', () => {
        it('should approve trainer application and assign role', async () => {
            const user = {
                ...mockUserEntity,
                wantToBecomeTrainer: true,
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(user);
            rolesRepository.findByIdActive.mockResolvedValue(mockRoleTrainer);
            userRepository.save.mockResolvedValue({
                ...user,
                wantToBecomeTrainer: false,
                becomeTrainerReason: null,
                roles: [mockRoleTrainee, mockRoleTrainer],
            });

            await service.resolveTrainerApplication(1, true);

            expect(rolesRepository.findByIdActive).toHaveBeenCalledWith(
                RoleEnum.TRAINER,
            );
            expect(userRepository.save).toHaveBeenCalled();

            const saveCall = userRepository.save.mock.calls[0][0];
            expect(saveCall.wantToBecomeTrainer).toBe(false);
            expect(saveCall.becomeTrainerReason).toBeNull();
        });

        it('should deny trainer application without assigning role', async () => {
            const user = {
                ...mockUserEntity,
                wantToBecomeTrainer: true,
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(user);
            userRepository.save.mockResolvedValue({
                ...user,
                wantToBecomeTrainer: false,
                becomeTrainerReason: null,
                roles: [mockRoleTrainee],
            });

            await service.resolveTrainerApplication(1, false);

            expect(rolesRepository.findByIdActive).not.toHaveBeenCalled();
            expect(userRepository.save).toHaveBeenCalled();

            const saveCall = userRepository.save.mock.calls[0][0];
            expect(saveCall.roles).toEqual([mockRoleTrainee]);
        });

        it('should throw NotFoundException when trainer role not found during approval', async () => {
            const user = {
                ...mockUserEntity,
                wantToBecomeTrainer: true,
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(user);
            rolesRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.resolveTrainerApplication(1, true),
            ).rejects.toThrow(NotFoundException);
            await expect(
                service.resolveTrainerApplication(1, true),
            ).rejects.toThrow('Trainer role not found');
        });

        it('should clear trainer request flags after resolution', async () => {
            const user = {
                ...mockUserEntity,
                wantToBecomeTrainer: true,
                becomeTrainerReason: 'Some reason',
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(user);
            userRepository.save.mockResolvedValue({
                ...user,
                wantToBecomeTrainer: false,
                becomeTrainerReason: null,
            });

            await service.resolveTrainerApplication(1, false);

            const saveCall = userRepository.save.mock.calls[0][0];
            expect(saveCall.wantToBecomeTrainer).toBe(false);
            expect(saveCall.becomeTrainerReason).toBeNull();
        });
    });

    describe('findByIdProfile', () => {
        it('should return user profile as UserResponseDto', async () => {
            const userWithRoles = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE, name: 'trainee' }],
            };
            userRepository.findByIdActive.mockResolvedValue(userWithRoles);

            const result = await service.findByIdProfile(1);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('firstName');
            expect(result).toHaveProperty('lastName');
            expect(result).toHaveProperty('nickname');
            expect(result).toHaveProperty('roles');
            expect(result.roles).toEqual([RoleEnum.TRAINEE]);
        });

        it('should exclude sensitive fields from response', async () => {
            const userWithRoles = {
                ...mockUserEntity,
                password: 'secret-hash',
                googleId: 'google-123',
                roles: [mockRoleTrainee],
            };
            userRepository.findByIdActive.mockResolvedValue(userWithRoles);

            const result = await service.findByIdProfile(1);

            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('googleId');
        });

        it('should throw NotFoundException when user not found', async () => {
            userRepository.findByIdActive.mockResolvedValue(null);

            await expect(service.findByIdProfile(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
