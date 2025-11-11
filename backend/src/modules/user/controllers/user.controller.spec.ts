/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { createMockJwtUser } from 'src/common/test/test-helpers';
import { mockUserEntity, createMockUser } from 'src/common/test/mock-data';
import { RoleEnum } from '../enums/role.enum';

/**
 * Tests for UserController
 *
 * UserController handles user management endpoints:
 * - POST /become-trainer - Request to become a trainer
 * - GET / - Get all users with filters (trainerRequests, roles, notRecruitedOrPending)
 * - GET /:id - Get user profile by ID
 * - POST /trainer-application/:id - Resolve trainer application (admin only)
 */
describe('UserController', () => {
    let controller: UserController;
    let userService: any;
    let mailService: any;

    beforeEach(async () => {
        // Create mock services
        userService = {
            requestBecomeTrainer: jest.fn(),
            findAllAdminsEmails: jest.fn(),
            getAll: jest.fn(),
            findByIdProfile: jest.fn(),
            resolveTrainerApplication: jest.fn(),
        };

        mailService = {
            becomeATrainer: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                { provide: UserService, useValue: userService },
                { provide: MailService, useValue: mailService },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    describe('POST /become-trainer', () => {
        it('should request to become a trainer successfully', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const becomeTrainerDto = { reason: 'I want to share my knowledge' };
            const updatedUser = createMockUser({
                id: 1,
                wantToBecomeTrainer: true,
                becomeTrainerReason: becomeTrainerDto.reason,
            });

            userService.requestBecomeTrainer.mockResolvedValue(updatedUser);
            userService.findAllAdminsEmails.mockResolvedValue([
                'admin1@example.com',
                'admin2@example.com',
            ]);

            await controller.requestBecomeTrainer(jwtUser, becomeTrainerDto);

            expect(userService.requestBecomeTrainer).toHaveBeenCalledWith(
                jwtUser.id,
                becomeTrainerDto.reason,
            );
            expect(userService.findAllAdminsEmails).toHaveBeenCalled();
            expect(mailService.becomeATrainer).toHaveBeenCalledWith(
                ['admin1@example.com', 'admin2@example.com'],
                updatedUser.nickname,
                becomeTrainerDto.reason,
            );
        });

        it('should handle empty reason string', async () => {
            const jwtUser = createMockJwtUser({ id: 2 });
            const becomeTrainerDto = { reason: '' };

            userService.requestBecomeTrainer.mockResolvedValue(
                createMockUser({ id: 2, becomeTrainerReason: '' }),
            );
            userService.findAllAdminsEmails.mockResolvedValue([]);

            await controller.requestBecomeTrainer(jwtUser, becomeTrainerDto);

            expect(userService.requestBecomeTrainer).toHaveBeenCalledWith(
                2,
                '',
            );
        });

        it('should notify all admins when trainer request is made', async () => {
            const jwtUser = createMockJwtUser({ id: 1, nickname: 'testuser' });
            const becomeTrainerDto = { reason: 'Experience in fitness' };
            const user = createMockUser({ nickname: 'testuser' });

            userService.requestBecomeTrainer.mockResolvedValue(user);
            userService.findAllAdminsEmails.mockResolvedValue([
                'admin@test.com',
            ]);

            await controller.requestBecomeTrainer(jwtUser, becomeTrainerDto);

            expect(mailService.becomeATrainer).toHaveBeenCalledWith(
                ['admin@test.com'],
                'testuser',
                becomeTrainerDto.reason,
            );
        });

        it('should handle mail service errors gracefully', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const becomeTrainerDto = { reason: 'Test' };

            userService.requestBecomeTrainer.mockResolvedValue(
                createMockUser({ id: 1 }),
            );
            userService.findAllAdminsEmails.mockResolvedValue([
                'admin@test.com',
            ]);
            mailService.becomeATrainer.mockRejectedValue(
                new Error('Mail service error'),
            );

            await expect(
                controller.requestBecomeTrainer(jwtUser, becomeTrainerDto),
            ).rejects.toThrow('Mail service error');
        });
    });

    describe('GET / - Get all users', () => {
        it('should return all users without filters', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const users = [
                mockUserEntity,
                createMockUser({ id: 2, email: 'user2@test.com' }),
            ];

            userService.getAll.mockResolvedValue(users);

            const result = await controller.getAll(jwtUser);

            expect(result).toEqual(users);
            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                undefined,
                undefined,
                undefined,
            );
        });

        it('should filter users by trainerRequests', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const filteredUsers = [
                createMockUser({ id: 2, wantToBecomeTrainer: true }),
            ];

            userService.getAll.mockResolvedValue(filteredUsers);

            const result = await controller.getAll(jwtUser, true);

            expect(result).toEqual(filteredUsers);
            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                true,
                undefined,
                undefined,
            );
        });

        it('should filter users by roles', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const roles = [RoleEnum.TRAINER];
            const filteredUsers = [createMockUser({ id: 2 })];

            userService.getAll.mockResolvedValue(filteredUsers);

            const result = await controller.getAll(jwtUser, undefined, roles);

            expect(result).toEqual(filteredUsers);
            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                undefined,
                roles,
                undefined,
            );
        });

        it('should filter users with multiple roles', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const roles = [RoleEnum.TRAINER, RoleEnum.ADMIN];

            userService.getAll.mockResolvedValue([]);

            await controller.getAll(jwtUser, undefined, roles);

            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                undefined,
                roles,
                undefined,
            );
        });

        it('should filter users by notRecruitedOrPending', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });

            userService.getAll.mockResolvedValue([]);

            await controller.getAll(jwtUser, undefined, undefined, true);

            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                undefined,
                undefined,
                true,
            );
        });

        it('should apply multiple filters together', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });
            const roles = [RoleEnum.TRAINER];

            userService.getAll.mockResolvedValue([]);

            await controller.getAll(jwtUser, true, roles, true);

            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                true,
                roles,
                true,
            );
        });

        it('should pass jwt user context to service', async () => {
            const jwtUser = createMockJwtUser({
                id: 5,
                roles: [RoleEnum.ADMIN],
            });

            userService.getAll.mockResolvedValue([]);

            await controller.getAll(jwtUser);

            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                undefined,
                undefined,
                undefined,
            );
        });

        it('should return empty array when no users match filters', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });

            userService.getAll.mockResolvedValue([]);

            const result = await controller.getAll(jwtUser, true, [
                RoleEnum.TRAINER,
            ]);

            expect(result).toEqual([]);
        });
    });

    describe('GET /:id - Get user by ID', () => {
        it('should return user by ID', async () => {
            const userId = 1;
            const user = mockUserEntity;

            userService.findByIdProfile.mockResolvedValue(user);

            const result = await controller.getOne(userId);

            expect(result).toEqual(user);
            expect(userService.findByIdProfile).toHaveBeenCalledWith(userId);
        });

        it('should handle non-existent user', async () => {
            const userId = 999;

            userService.findByIdProfile.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.getOne(userId)).rejects.toThrow(
                'User not found',
            );
            expect(userService.findByIdProfile).toHaveBeenCalledWith(userId);
        });

        it('should retrieve user profile with all fields', async () => {
            const userId = 2;
            const userProfile = createMockUser({
                id: userId,
                email: 'user@test.com',
                firstName: 'John',
                lastName: 'Doe',
            });

            userService.findByIdProfile.mockResolvedValue(userProfile);

            const result = await controller.getOne(userId);

            expect(result.id).toBe(userId);
            expect(result.email).toBe('user@test.com');
        });

        it('should work with different user IDs', async () => {
            const userIds = [1, 10, 100, 1000];

            for (const id of userIds) {
                const user = createMockUser({ id });
                userService.findByIdProfile.mockResolvedValue(user);

                const result = await controller.getOne(id);

                expect(result.id).toBe(id);
                expect(userService.findByIdProfile).toHaveBeenCalledWith(id);
            }
        });
    });

    describe('POST /trainer-application/:id - Resolve trainer application', () => {
        it('should approve trainer application', async () => {
            const userId = 2;

            userService.resolveTrainerApplication.mockResolvedValue(undefined);

            await controller.resolveApplication(userId, true);

            expect(userService.resolveTrainerApplication).toHaveBeenCalledWith(
                userId,
                true,
            );
        });

        it('should deny trainer application', async () => {
            const userId = 3;

            userService.resolveTrainerApplication.mockResolvedValue(undefined);

            await controller.resolveApplication(userId, false);

            expect(userService.resolveTrainerApplication).toHaveBeenCalledWith(
                userId,
                false,
            );
        });

        it('should handle invalid user ID', async () => {
            const userId = 999;

            userService.resolveTrainerApplication.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(
                controller.resolveApplication(userId, true),
            ).rejects.toThrow('User not found');
        });

        it('should handle user without pending application', async () => {
            const userId = 1;

            userService.resolveTrainerApplication.mockRejectedValue(
                new Error('No pending application'),
            );

            await expect(
                controller.resolveApplication(userId, true),
            ).rejects.toThrow('No pending application');
        });

        it('should process approval for multiple users', async () => {
            const userIds = [1, 2, 3];

            userService.resolveTrainerApplication.mockResolvedValue(undefined);

            for (const id of userIds) {
                await controller.resolveApplication(id, true);
            }

            expect(userService.resolveTrainerApplication).toHaveBeenCalledTimes(
                3,
            );
        });
    });

    describe('Error Handling', () => {
        it('should propagate service errors', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });

            userService.getAll.mockRejectedValue(
                new Error('Database connection failed'),
            );

            await expect(controller.getAll(jwtUser)).rejects.toThrow(
                'Database connection failed',
            );
        });

        it('should handle null results gracefully', async () => {
            userService.findByIdProfile.mockResolvedValue(null);

            const result = await controller.getOne(999);

            expect(result).toBeNull();
        });
    });

    describe('Input Validation', () => {
        it('should handle numeric ID parameter', async () => {
            userService.findByIdProfile.mockResolvedValue(mockUserEntity);

            await controller.getOne(1);

            expect(userService.findByIdProfile).toHaveBeenCalledWith(1);
        });

        it('should handle large numeric ID values', async () => {
            const largeId = 999999999;

            userService.findByIdProfile.mockResolvedValue(null);

            await controller.getOne(largeId);

            expect(userService.findByIdProfile).toHaveBeenCalledWith(largeId);
        });

        it('should handle boolean query parameters', async () => {
            const jwtUser = createMockJwtUser({ id: 1 });

            userService.getAll.mockResolvedValue([]);

            await controller.getAll(jwtUser, false, undefined, false);

            expect(userService.getAll).toHaveBeenCalledWith(
                jwtUser,
                false,
                undefined,
                false,
            );
        });
    });
});
