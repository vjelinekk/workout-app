/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TrainerTraineeService } from './trainer-trainee.service';
import {
    mockUserEntity,
    mockTrainerUserEntity,
} from '../../../common/test/mock-data';
import { createMockRepository } from '../../../common/test/test-helpers';
import { RoleEnum } from '../enums/role.enum';
import { TrainerTraineeStatusEnum } from '../enums/trainer-trainee-status.enum';
import { TrainingSplitAssignmentStatusEnum } from '../../training-split/enums/training-split-assignment-status.enum';

describe('TrainerTraineeService', () => {
    let service: TrainerTraineeService;
    let trainerTraineeRepository: any;
    let userRepository: any;

    beforeEach(() => {
        jest.clearAllMocks();

        trainerTraineeRepository = createMockRepository();
        userRepository = createMockRepository();

        service = new TrainerTraineeService(
            trainerTraineeRepository,
            userRepository,
        );
    });

    describe('sendTrainerRequest', () => {
        const trainerUser = {
            id: 2,
            nickname: 'trainer',
            roles: [RoleEnum.TRAINER],
        };

        it('should send trainer request successfully', async () => {
            const traineeUser = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE }],
            };

            userRepository.findByIdActive.mockResolvedValue(traineeUser);
            trainerTraineeRepository.findExistingRequest.mockResolvedValue(
                null,
            );
            trainerTraineeRepository.create.mockReturnValue({
                trainee: { id: 1 },
                trainer: { id: 2 },
            });
            trainerTraineeRepository.save.mockResolvedValue({});

            await service.sendTrainerRequest(1, trainerUser as any);

            expect(userRepository.findByIdActive).toHaveBeenCalledWith(1, {
                roles: true,
            });
            expect(
                trainerTraineeRepository.findExistingRequest,
            ).toHaveBeenCalledWith(1, 2);
            expect(trainerTraineeRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException when sending request to self', async () => {
            const selfRequest = { id: 1, roles: [RoleEnum.TRAINER] };

            await expect(
                service.sendTrainerRequest(1, selfRequest as any),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.sendTrainerRequest(1, selfRequest as any),
            ).rejects.toThrow('You cannot send a trainer request to yourself');
        });

        it('should throw UnauthorizedException when user is not trainer or admin', async () => {
            const traineeUser = { id: 1, roles: [RoleEnum.TRAINEE] };

            await expect(
                service.sendTrainerRequest(2, traineeUser as any),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                service.sendTrainerRequest(2, traineeUser as any),
            ).rejects.toThrow('Only trainers can send trainer requests');
        });

        it('should throw BadRequestException when trainee not found', async () => {
            userRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.sendTrainerRequest(999, trainerUser as any),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.sendTrainerRequest(999, trainerUser as any),
            ).rejects.toThrow('Trainee not found');
        });

        it('should throw BadRequestException when target is not a trainee', async () => {
            const adminUser = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.ADMIN }],
            };

            userRepository.findByIdActive.mockResolvedValue(adminUser);

            await expect(
                service.sendTrainerRequest(1, trainerUser as any),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.sendTrainerRequest(1, trainerUser as any),
            ).rejects.toThrow('The specified user is not a trainee');
        });

        it('should throw BadRequestException when request already exists', async () => {
            const traineeUser = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE }],
            };

            userRepository.findByIdActive.mockResolvedValue(traineeUser);
            trainerTraineeRepository.findExistingRequest.mockResolvedValue({
                id: 1,
            });

            await expect(
                service.sendTrainerRequest(1, trainerUser as any),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.sendTrainerRequest(1, trainerUser as any),
            ).rejects.toThrow('Trainer request already exists');
        });

        it('should allow admin to send trainer request', async () => {
            const adminUser = {
                id: 3,
                nickname: 'admin',
                roles: [RoleEnum.ADMIN],
            };
            const traineeUser = {
                ...mockUserEntity,
                roles: [{ id: RoleEnum.TRAINEE }],
            };

            userRepository.findByIdActive.mockResolvedValue(traineeUser);
            trainerTraineeRepository.findExistingRequest.mockResolvedValue(
                null,
            );
            trainerTraineeRepository.create.mockReturnValue({});
            trainerTraineeRepository.save.mockResolvedValue({});

            await service.sendTrainerRequest(1, adminUser as any);

            expect(trainerTraineeRepository.save).toHaveBeenCalled();
        });
    });

    describe('getTrainerRequests', () => {
        it('should return all non-removed trainer requests for user', async () => {
            const requests = [
                {
                    id: 1,
                    status: TrainerTraineeStatusEnum.PENDING,
                    trainer: mockTrainerUserEntity,
                },
                {
                    id: 2,
                    status: TrainerTraineeStatusEnum.ACTIVE,
                    trainer: mockTrainerUserEntity,
                },
            ];

            trainerTraineeRepository.findActive.mockResolvedValue(requests);

            const result = await service.getTrainerRequests(1);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(trainerTraineeRepository.findActive).toHaveBeenCalledWith({
                where: {
                    trainee: { id: 1 },
                    status: expect.anything(),
                },
                relations: {
                    trainer: true,
                },
            });
        });

        it('should exclude removed requests', async () => {
            const requests = [
                {
                    id: 1,
                    status: TrainerTraineeStatusEnum.PENDING,
                    trainer: mockTrainerUserEntity,
                },
            ];

            trainerTraineeRepository.findActive.mockResolvedValue(requests);

            await service.getTrainerRequests(1);

            const whereCondition =
                trainerTraineeRepository.findActive.mock.calls[0][0].where;
            expect(whereCondition.status).toBeDefined();
        });

        it('should return empty array when no requests exist', async () => {
            trainerTraineeRepository.findActive.mockResolvedValue([]);

            const result = await service.getTrainerRequests(1);

            expect(result).toEqual([]);
        });
    });

    describe('respondToTrainerRequest', () => {
        it('should accept trainer request and set to ACTIVE', async () => {
            const request = {
                id: 1,
                trainee: { id: 1 },
                status: TrainerTraineeStatusEnum.PENDING,
            };

            trainerTraineeRepository.findByIdActive.mockResolvedValue(request);
            trainerTraineeRepository.save.mockResolvedValue({
                ...request,
                status: TrainerTraineeStatusEnum.ACTIVE,
            });

            await service.respondToTrainerRequest(true, 1, 1);

            expect(trainerTraineeRepository.save).toHaveBeenCalled();
            const savedRequest = trainerTraineeRepository.save.mock.calls[0][0];
            expect(savedRequest.status).toBe(TrainerTraineeStatusEnum.ACTIVE);
        });

        it('should decline trainer request and set to REMOVED', async () => {
            const request = {
                id: 1,
                trainee: { id: 1 },
                status: TrainerTraineeStatusEnum.PENDING,
            };

            trainerTraineeRepository.findByIdActive.mockResolvedValue(request);
            trainerTraineeRepository.save.mockResolvedValue({
                ...request,
                status: TrainerTraineeStatusEnum.REMOVED,
            });

            await service.respondToTrainerRequest(false, 1, 1);

            const savedRequest = trainerTraineeRepository.save.mock.calls[0][0];
            expect(savedRequest.status).toBe(TrainerTraineeStatusEnum.REMOVED);
        });

        it('should throw BadRequestException when request not found', async () => {
            trainerTraineeRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.respondToTrainerRequest(true, 999, 1),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.respondToTrainerRequest(true, 999, 1),
            ).rejects.toThrow('Trainer request not found');
        });

        it('should throw UnauthorizedException when user is not the trainee', async () => {
            const request = {
                id: 1,
                trainee: { id: 1 },
                status: TrainerTraineeStatusEnum.PENDING,
            };

            trainerTraineeRepository.findByIdActive.mockResolvedValue(request);

            await expect(
                service.respondToTrainerRequest(true, 1, 2),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                service.respondToTrainerRequest(true, 1, 2),
            ).rejects.toThrow(
                'You are not authorized to respond to this trainer request',
            );
        });

        it('should throw BadRequestException when request already removed', async () => {
            const request = {
                id: 1,
                trainee: { id: 1 },
                status: TrainerTraineeStatusEnum.REMOVED,
            };

            trainerTraineeRepository.findByIdActive.mockResolvedValue(request);

            await expect(
                service.respondToTrainerRequest(true, 1, 1),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.respondToTrainerRequest(true, 1, 1),
            ).rejects.toThrow('Trainer request has already been removed');
        });
    });

    describe('getTraineesForTrainer', () => {
        it('should return active trainees with training split info', async () => {
            const trainees = [
                {
                    id: 1,
                    trainee: {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                        trainingSplitAssignments: [
                            {
                                trainingSplitId: 1,
                                status: TrainingSplitAssignmentStatusEnum.ACTIVE,
                            },
                            {
                                trainingSplitId: 2,
                                status: TrainingSplitAssignmentStatusEnum.PENDING,
                            },
                        ],
                    },
                },
            ];

            trainerTraineeRepository.findActive.mockResolvedValue(trainees);

            const result = await service.getTraineesForTrainer(1);

            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            expect(result[0]).toHaveProperty('id', 1);
            expect(result[0]).toHaveProperty('firstName', 'John');
            expect(result[0]).toHaveProperty('activeTrainingSplitId', 1);
            expect(result[0]).toHaveProperty('pendingTrainingSplitIdList', [2]);
        });

        it('should return empty array when trainer has no active trainees', async () => {
            trainerTraineeRepository.findActive.mockResolvedValue([]);

            const result = await service.getTraineesForTrainer(1);

            expect(result).toEqual([]);
        });

        it('should find active training split among multiple assignments', async () => {
            const trainees = [
                {
                    id: 1,
                    trainee: {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                        trainingSplitAssignments: [
                            {
                                trainingSplitId: 1,
                                status: TrainingSplitAssignmentStatusEnum.PENDING,
                            },
                            {
                                trainingSplitId: 2,
                                status: TrainingSplitAssignmentStatusEnum.ACTIVE,
                            },
                            {
                                trainingSplitId: 3,
                                status: TrainingSplitAssignmentStatusEnum.PENDING,
                            },
                        ],
                    },
                },
            ];

            trainerTraineeRepository.findActive.mockResolvedValue(trainees);

            const result = await service.getTraineesForTrainer(1);

            expect(result[0].activeTrainingSplitId).toBe(2);
            expect(result[0].pendingTrainingSplitIdList).toEqual([1, 3]);
        });

        it('should handle trainee with no active split assignment', async () => {
            const trainees = [
                {
                    id: 1,
                    trainee: {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                        trainingSplitAssignments: [
                            {
                                trainingSplitId: 1,
                                status: TrainingSplitAssignmentStatusEnum.PENDING,
                            },
                        ],
                    },
                },
            ];

            trainerTraineeRepository.findActive.mockResolvedValue(trainees);

            const result = await service.getTraineesForTrainer(1);

            expect(result[0].activeTrainingSplitId).toBeUndefined();
            expect(result[0].pendingTrainingSplitIdList).toEqual([1]);
        });

        it('should only include active trainer-trainee relationships', async () => {
            trainerTraineeRepository.findActive.mockResolvedValue([]);

            await service.getTraineesForTrainer(1);

            const findActiveCall =
                trainerTraineeRepository.findActive.mock.calls[0][0];
            expect(findActiveCall.where.status).toBe(
                TrainerTraineeStatusEnum.ACTIVE,
            );
        });

        it('should filter by trainer ID', async () => {
            trainerTraineeRepository.findActive.mockResolvedValue([]);

            await service.getTraineesForTrainer(5);

            const findActiveCall =
                trainerTraineeRepository.findActive.mock.calls[0][0];
            expect(findActiveCall.where.trainerId).toBe(5);
        });

        it('should return trainee data in correct format', async () => {
            const trainees = [
                {
                    id: 1,
                    trainee: {
                        id: 10,
                        firstName: 'Jane',
                        lastName: 'Smith',
                        email: 'jane@example.com',
                        trainingSplitAssignments: [],
                    },
                },
            ];

            trainerTraineeRepository.findActive.mockResolvedValue(trainees);

            const result = await service.getTraineesForTrainer(1);

            expect(result[0]).toEqual({
                id: 10,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                activeTrainingSplitId: undefined,
                pendingTrainingSplitIdList: [],
            });
        });
    });
});
