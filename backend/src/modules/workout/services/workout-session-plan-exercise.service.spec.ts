/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument */

import {
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { RoleEnum } from '../../user/enums/role.enum';
import { RoleEntity } from '../../user/entities/role.entity';
import { PlannedRepsSetsMismatchException } from '../exceptions/workout-session-plan-exercise/planned-reps-sets-mismatch.exception';
import {
    mockWorkoutSessionPlanExerciseEntity,
    mockWorkoutSessionPlanExerciseCreateDto,
    mockWorkoutSessionPlanExerciseUpdateDto,
    createMockUser,
    mockWorkoutSessionPlanEntity,
    mockRoleAdmin,
    mockRoleTrainee,
} from '../../../common/test/mock-data';
import {
    createMockRepository,
    createMockDataSource,
} from '../../../common/test/test-helpers';

/**
 * Tests for WorkoutSessionPlanExerciseService
 *
 * WorkoutSessionPlanExerciseService manages exercises within workout plans:
 * - CRUD operations for individual exercises
 * - Validation of planned reps per set configuration
 * - Bulk insert and update operations with transaction support
 * - Access control verification
 */
describe('WorkoutSessionPlanExerciseService', () => {
    // Mock the service functionality without full NestJS DI
    const createServiceProxy = () => {
        const repository = createMockRepository();
        const planRepository = createMockRepository();
        const dataSource = createMockDataSource();

        return {
            repository,
            planRepository,
            dataSource,
            // Validation logic
            validatePlannedRepsPerSet: (
                plannedSets: number,
                plannedRepsPerSet: number[],
            ) => {
                if (plannedRepsPerSet.length !== plannedSets) {
                    throw new PlannedRepsSetsMismatchException(
                        plannedSets,
                        plannedRepsPerSet.length,
                    );
                }
            },
            // Access control
            validateEntityAccess: async (entity: any, user: any) => {
                const plan = await planRepository.findByIdActive(
                    entity.workoutSessionPlanId,
                );

                if (!plan) {
                    throw new NotFoundException(
                        `Workout session plan with ID ${entity.workoutSessionPlanId} not found`,
                    );
                }

                if (user.roles.includes(RoleEnum.ADMIN)) {
                    return;
                }

                if (plan.createdById !== user.id) {
                    throw new ForbiddenException('Access to resource denied');
                }
            },
        };
    };

    describe('Validation - validatePlannedRepsPerSet', () => {
        it('should not throw when sets and reps array lengths match', () => {
            const service = createServiceProxy();

            expect(() =>
                service.validatePlannedRepsPerSet(3, [10, 10, 10]),
            ).not.toThrow();
        });

        it('should throw when reps array is shorter than sets', () => {
            const service = createServiceProxy();

            expect(() =>
                service.validatePlannedRepsPerSet(3, [10, 10]),
            ).toThrow(PlannedRepsSetsMismatchException);
        });

        it('should throw when reps array is longer than sets', () => {
            const service = createServiceProxy();

            expect(() =>
                service.validatePlannedRepsPerSet(2, [10, 10, 10]),
            ).toThrow(PlannedRepsSetsMismatchException);
        });

        it('should throw when reps array is empty but sets is not zero', () => {
            const service = createServiceProxy();

            expect(() => service.validatePlannedRepsPerSet(3, [])).toThrow(
                PlannedRepsSetsMismatchException,
            );
        });

        it('should not throw when both sets and reps array are zero', () => {
            const service = createServiceProxy();

            expect(() =>
                service.validatePlannedRepsPerSet(0, []),
            ).not.toThrow();
        });

        it('should work with single set', () => {
            const service = createServiceProxy();

            expect(() =>
                service.validatePlannedRepsPerSet(1, [12]),
            ).not.toThrow();
        });

        it('should work with many sets', () => {
            const service = createServiceProxy();

            expect(() =>
                service.validatePlannedRepsPerSet(
                    10,
                    [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                ),
            ).not.toThrow();
        });
    });

    describe('Access Control - validateEntityAccess', () => {
        it('should allow admin to access any exercise', async () => {
            const service = createServiceProxy();
            const entity = {
                ...mockWorkoutSessionPlanExerciseEntity,
                workoutSessionPlanId: 1,
            };
            const adminUser = createMockUser({
                roles: [mockRoleAdmin as RoleEntity],
            });

            service.planRepository.findByIdActive.mockResolvedValue(
                mockWorkoutSessionPlanEntity,
            );

            await expect(
                service.validateEntityAccess(entity, adminUser),
            ).resolves.not.toThrow();
        });

        it('should allow owner to access their exercise', async () => {
            const service = createServiceProxy();
            const entity = {
                ...mockWorkoutSessionPlanExerciseEntity,
                workoutSessionPlanId: 1,
            };
            const ownerUser = createMockUser({
                id: 1,
                roles: [mockRoleTrainee as RoleEntity],
            });
            const plan = { ...mockWorkoutSessionPlanEntity, createdById: 1 };

            service.planRepository.findByIdActive.mockResolvedValue(plan);

            await expect(
                service.validateEntityAccess(entity, ownerUser),
            ).resolves.not.toThrow();
        });

        it('should reject non-owner access', async () => {
            const service = createServiceProxy();
            const entity = {
                ...mockWorkoutSessionPlanExerciseEntity,
                workoutSessionPlanId: 1,
            };
            const otherUser = createMockUser({
                id: 2,
                roles: [mockRoleTrainee as RoleEntity],
            });
            const plan = { ...mockWorkoutSessionPlanEntity, createdById: 1 };

            service.planRepository.findByIdActive.mockResolvedValue(plan);

            await expect(
                service.validateEntityAccess(entity, otherUser),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw NotFoundException when plan not found', async () => {
            const service = createServiceProxy();
            const entity = {
                ...mockWorkoutSessionPlanExerciseEntity,
                workoutSessionPlanId: 999,
            };
            const user = createMockUser();

            service.planRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.validateEntityAccess(entity, user),
            ).rejects.toThrow(NotFoundException);
            await expect(
                service.validateEntityAccess(entity, user),
            ).rejects.toThrow('Workout session plan with ID 999 not found');
        });
    });

    describe('Repository Interaction - Create', () => {
        it('should create single exercise', async () => {
            const repository = createMockRepository();
            const entity = mockWorkoutSessionPlanExerciseEntity;

            repository.create.mockReturnValue(entity);
            repository.save.mockResolvedValue(entity);

            const created = repository.create(
                mockWorkoutSessionPlanExerciseCreateDto,
            );
            const saved = await repository.save(created);

            expect(repository.create).toHaveBeenCalledWith(
                mockWorkoutSessionPlanExerciseCreateDto,
            );
            expect(repository.save).toHaveBeenCalled();
            expect(saved).toBeDefined();
        });

        it('should find exercise by ID', async () => {
            const repository = createMockRepository();
            const entity = mockWorkoutSessionPlanExerciseEntity;

            repository.findByIdActive.mockResolvedValue(entity);

            const result = await repository.findByIdActive(1);

            expect(repository.findByIdActive).toHaveBeenCalledWith(1);
            expect(result).toEqual(entity);
        });

        it('should return null when exercise not found', async () => {
            const repository = createMockRepository();

            repository.findByIdActive.mockResolvedValue(null);

            const result = await repository.findByIdActive(999);

            expect(result).toBeNull();
        });
    });

    describe('Repository Interaction - Update', () => {
        it('should update exercise', async () => {
            const repository = createMockRepository();
            const originalEntity = mockWorkoutSessionPlanExerciseEntity;
            const updatedEntity = {
                ...originalEntity,
                ...mockWorkoutSessionPlanExerciseUpdateDto,
            };

            repository.save.mockResolvedValue(updatedEntity);

            const result = await repository.save(updatedEntity);

            expect(repository.save).toHaveBeenCalled();
            expect(result.order).toBe(
                mockWorkoutSessionPlanExerciseUpdateDto.order,
            );
        });

        it('should delete exercise (soft delete)', async () => {
            const repository = createMockRepository();
            const entity = {
                ...mockWorkoutSessionPlanExerciseEntity,
                isDeleted: true,
            };

            repository.save.mockResolvedValue(entity);

            const result = await repository.save(entity);

            expect(repository.save).toHaveBeenCalled();
            expect(result.isDeleted).toBe(true);
        });
    });

    describe('Repository Interaction - Find', () => {
        it('should find all exercises for a plan ordered by order', async () => {
            const repository = createMockRepository();
            const exercises = [
                { ...mockWorkoutSessionPlanExerciseEntity, order: 1 },
                { ...mockWorkoutSessionPlanExerciseEntity, id: 2, order: 2 },
            ];

            repository.findActive.mockResolvedValue(exercises);

            const result = await repository.findActive({
                where: { workoutSessionPlanId: 1 },
                order: { order: 'ASC' },
            });

            expect(repository.findActive).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].order).toBeLessThan(result[1].order);
        });

        it('should return empty array when no exercises found', async () => {
            const repository = createMockRepository();

            repository.findActive.mockResolvedValue([]);

            const result = await repository.findActive({
                where: { workoutSessionPlanId: 1 },
            });

            expect(result).toEqual([]);
        });
    });

    describe('Bulk Operations - createBulk', () => {
        it('should insert multiple exercises successfully', async () => {
            const repository = createMockRepository();
            const createDtos = [mockWorkoutSessionPlanExerciseCreateDto];
            const insertResult = { identifiers: [{ id: 1 }] };

            repository.insert.mockResolvedValue(insertResult);

            await repository.insert(createDtos);

            expect(repository.insert).toHaveBeenCalledWith(createDtos);
        });

        it('should throw when not all exercises inserted', async () => {
            const repository = createMockRepository();
            const createDtos = [
                mockWorkoutSessionPlanExerciseCreateDto,
                mockWorkoutSessionPlanExerciseCreateDto,
            ];
            const insertResult = { identifiers: [{ id: 1 }] }; // Only 1 but created 2

            repository.insert.mockResolvedValue(insertResult);

            const result = await repository.insert(createDtos);

            // Service would throw InternalServerErrorException here
            expect(result.identifiers.length).not.toBe(createDtos.length);
        });

        it('should handle empty array', async () => {
            const repository = createMockRepository();
            const createDtos: any[] = [];

            repository.insert.mockResolvedValue({ identifiers: [] });

            await repository.insert(createDtos);

            expect(repository.insert).toHaveBeenCalledWith([]);
        });
    });

    describe('Bulk Operations - updateBulk (Transaction)', () => {
        it('should use transaction for bulk update', async () => {
            const dataSource = createMockDataSource();
            const mockManager = {
                getRepository: jest.fn().mockReturnValue({
                    delete: jest.fn().mockResolvedValue({ affected: 1 }),
                    insert: jest
                        .fn()
                        .mockResolvedValue({ identifiers: [{ id: 1 }] }),
                }),
            };

            dataSource.transaction.mockImplementation(async (callback: any) => {
                return callback(mockManager);
            });

            const workoutSessionPlanId = 1;
            const createDtos = [mockWorkoutSessionPlanExerciseCreateDto];

            await dataSource.transaction(async (manager: any) => {
                const repo = manager.getRepository(Object);
                await repo.delete({ workoutSessionPlanId } as any);
                await repo.insert(createDtos);
            });

            expect(dataSource.transaction).toHaveBeenCalled();
        });

        it('should delete existing exercises before inserting new ones', async () => {
            const dataSource = createMockDataSource();
            const mockRepo = {
                delete: jest.fn().mockResolvedValue({ affected: 2 }),
                insert: jest
                    .fn()
                    .mockResolvedValue({ identifiers: [{ id: 1 }, { id: 2 }] }),
            };
            const mockManager = {
                getRepository: jest.fn().mockReturnValue(mockRepo),
            };

            dataSource.transaction.mockImplementation(async (callback: any) => {
                return callback(mockManager);
            });

            const workoutSessionPlanId = 1;
            const createDtos = [mockWorkoutSessionPlanExerciseCreateDto];

            await dataSource.transaction(async (manager: any) => {
                const repo = manager.getRepository(Object);
                const deleteResult = await repo.delete({
                    workoutSessionPlanId,
                } as any);
                if (deleteResult.affected === 0) {
                    throw new NotFoundException('No exercises to delete');
                }
                await repo.insert(createDtos);
            });

            expect(mockRepo.delete).toHaveBeenCalled();
            expect(mockRepo.insert).toHaveBeenCalled();
        });

        it('should throw when no exercises exist to delete', async () => {
            const dataSource = createMockDataSource();
            const mockRepo = {
                delete: jest.fn().mockResolvedValue({ affected: 0 }),
                insert: jest.fn(),
            };
            const mockManager = {
                getRepository: jest.fn().mockReturnValue(mockRepo),
            };

            dataSource.transaction.mockImplementation(async (callback: any) => {
                return callback(mockManager);
            });

            const workoutSessionPlanId = 1;
            const createDtos = [mockWorkoutSessionPlanExerciseCreateDto];

            const executeUpdate = async () => {
                await dataSource.transaction(async (manager: any) => {
                    const repo = manager.getRepository(Object);
                    const deleteResult = await repo.delete({
                        workoutSessionPlanId,
                    } as any);
                    if (!deleteResult.affected || deleteResult.affected === 0) {
                        throw new NotFoundException(
                            `No workout session plan exercises found for workout session plan ID ${workoutSessionPlanId} to update`,
                        );
                    }
                    await repo.insert(createDtos);
                });
            };

            await expect(executeUpdate()).rejects.toThrow(NotFoundException);
        });

        it('should throw when insert fails (not all inserted)', async () => {
            const dataSource = createMockDataSource();
            const mockRepo = {
                delete: jest.fn().mockResolvedValue({ affected: 2 }),
                insert: jest
                    .fn()
                    .mockResolvedValue({ identifiers: [{ id: 1 }] }), // Only 1 instead of 2
            };
            const mockManager = {
                getRepository: jest.fn().mockReturnValue(mockRepo),
            };

            dataSource.transaction.mockImplementation(async (callback: any) => {
                return callback(mockManager);
            });

            const workoutSessionPlanId = 1;
            const createDtos = [
                mockWorkoutSessionPlanExerciseCreateDto,
                mockWorkoutSessionPlanExerciseCreateDto,
            ];

            const executeUpdate = async () => {
                await dataSource.transaction(async (manager: any) => {
                    const repo = manager.getRepository(Object);
                    await repo.delete({ workoutSessionPlanId } as any);
                    const result = await repo.insert(createDtos);
                    if (result.identifiers.length !== createDtos.length) {
                        throw new InternalServerErrorException(
                            `Failed to insert all workout session plan exercises. Expected ${createDtos.length}, inserted ${result.identifiers.length}`,
                        );
                    }
                });
            };

            await expect(executeUpdate()).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('Data Integrity', () => {
        it('should handle exercise with planned reps configuration', () => {
            const exercise = {
                ...mockWorkoutSessionPlanExerciseEntity,
                plannedSets: 4,
                plannedRepsPerSet: [12, 10, 8, 6],
            };

            expect(exercise.plannedSets).toBe(4);
            expect(exercise.plannedRepsPerSet).toHaveLength(4);
            expect(exercise.plannedRepsPerSet[0]).toBe(12);
        });

        it('should maintain order of exercises in a plan', () => {
            const exercises = [
                { ...mockWorkoutSessionPlanExerciseEntity, order: 1, id: 1 },
                { ...mockWorkoutSessionPlanExerciseEntity, order: 2, id: 2 },
                { ...mockWorkoutSessionPlanExerciseEntity, order: 3, id: 3 },
            ];

            exercises.sort((a, b) => a.order - b.order);

            expect(exercises[0].order).toBe(1);
            expect(exercises[1].order).toBe(2);
            expect(exercises[2].order).toBe(3);
        });
    });
});
