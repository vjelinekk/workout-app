/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-argument */

import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkoutSessionService } from './workout-session.service';
import {
    createMockRepository,
    createMockDataSource,
} from '../../../common/test/test-helpers';
import { WorkoutSessionStatusEnum } from '../enums/workout-session-status.enum';

describe('WorkoutSessionService', () => {
    let service: WorkoutSessionService;
    let workoutSessionRepository: any;
    let workoutSessionExerciseRepository: any;
    let workoutSessionPlanRepository: any;
    let dataSource: any;

    const mockWorkoutSessionCreateDto = {
        workoutSessionPlanId: 1,
        trainingSplitId: 1,
    };

    const mockWorkoutSession = {
        id: 1,
        workoutSessionPlanId: 1,
        createdById: 1,
        status: WorkoutSessionStatusEnum.IN_PROGRESS,
        startedAt: new Date('2024-01-01T10:00:00'),
        finishedAt: null,
        durationSeconds: 0,
        exercises: [],
        workoutSessionPlan: { id: 1, exercises: [] },
    };

    const mockWorkoutSessionPlan = {
        id: 1,
        exercises: [
            {
                id: 1,
                exerciseId: 1,
                order: 1,
                plannedRepsPerSet: [10, 10, 10],
            },
            {
                id: 2,
                exerciseId: 2,
                order: 2,
                plannedRepsPerSet: [8, 8, 8],
            },
        ],
    };

    const mockWorkoutSessionExercise = {
        id: 1,
        workoutSessionId: 1,
        exerciseId: 1,
        order: 1,
        actualRepsPerSet: [null, null, null],
        actualWeightPerSet: [null, null, null],
        createdById: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        workoutSessionRepository = createMockRepository();
        workoutSessionExerciseRepository = createMockRepository();
        workoutSessionPlanRepository = createMockRepository();
        dataSource = createMockDataSource();

        service = new WorkoutSessionService(
            workoutSessionRepository,
            workoutSessionExerciseRepository,
            workoutSessionPlanRepository,
            dataSource,
        );
    });

    describe('startWorkoutSession', () => {
        it('should start new workout session successfully', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);
            workoutSessionRepository.save.mockResolvedValue(mockWorkoutSession);
            workoutSessionRepository.findActive.mockResolvedValue([]); // For previous session lookup
            workoutSessionPlanRepository.findByIdActive.mockResolvedValue(
                mockWorkoutSessionPlan,
            );
            workoutSessionExerciseRepository.save.mockResolvedValue([
                mockWorkoutSessionExercise,
            ]);

            const result = await service.startWorkoutSession(
                mockWorkoutSessionCreateDto,
                1,
            );

            expect(result).toBeDefined();
            expect(workoutSessionRepository.findOneActive).toHaveBeenCalledWith(
                {
                    where: {
                        createdById: 1,
                        status: WorkoutSessionStatusEnum.IN_PROGRESS,
                    },
                },
            );
            expect(workoutSessionRepository.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException when session already in progress', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(
                mockWorkoutSession,
            );

            await expect(
                service.startWorkoutSession(mockWorkoutSessionCreateDto, 1),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.startWorkoutSession(mockWorkoutSessionCreateDto, 1),
            ).rejects.toThrow(
                'Cannot start a new workout session while another is in progress',
            );
        });

        it('should throw NotFoundException when workout plan not found', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);
            workoutSessionRepository.save.mockResolvedValue(mockWorkoutSession);
            workoutSessionRepository.findActive.mockResolvedValue([]);
            workoutSessionPlanRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.startWorkoutSession(mockWorkoutSessionCreateDto, 1),
            ).rejects.toThrow(NotFoundException);
            await expect(
                service.startWorkoutSession(mockWorkoutSessionCreateDto, 1),
            ).rejects.toThrow('Workout session plan not found');
        });

        it('should create session with correct user ID', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);
            workoutSessionRepository.save.mockResolvedValue({
                ...mockWorkoutSession,
                createdById: 5,
            });
            workoutSessionRepository.findActive.mockResolvedValue([]);
            workoutSessionPlanRepository.findByIdActive.mockResolvedValue(
                mockWorkoutSessionPlan,
            );
            workoutSessionExerciseRepository.save.mockResolvedValue([
                mockWorkoutSessionExercise,
            ]);

            await service.startWorkoutSession(mockWorkoutSessionCreateDto, 5);

            const saveCall = workoutSessionRepository.save.mock.calls[0][0];
            expect(saveCall.createdById).toBe(5);
        });

        it('should set session startedAt timestamp', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);
            workoutSessionRepository.save.mockResolvedValue(mockWorkoutSession);
            workoutSessionRepository.findActive.mockResolvedValue([]);
            workoutSessionPlanRepository.findByIdActive.mockResolvedValue(
                mockWorkoutSessionPlan,
            );
            workoutSessionExerciseRepository.save.mockResolvedValue([
                mockWorkoutSessionExercise,
            ]);

            await service.startWorkoutSession(mockWorkoutSessionCreateDto, 1);

            const saveCall = workoutSessionRepository.save.mock.calls[0][0];
            expect(saveCall.startedAt).toBeDefined();
        });

        it('should initialize exercises with null values', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);
            workoutSessionRepository.save.mockResolvedValue({
                ...mockWorkoutSession,
                id: 100,
            });
            workoutSessionRepository.findActive.mockResolvedValue([]);
            workoutSessionPlanRepository.findByIdActive.mockResolvedValue(
                mockWorkoutSessionPlan,
            );
            workoutSessionExerciseRepository.save.mockResolvedValue([
                { ...mockWorkoutSessionExercise, workoutSessionId: 100 },
            ]);

            await service.startWorkoutSession(mockWorkoutSessionCreateDto, 1);

            const exerciseCall =
                workoutSessionExerciseRepository.save.mock.calls[0];
            expect(exerciseCall[0][0].actualRepsPerSet).toEqual([
                null,
                null,
                null,
            ]);
            expect(exerciseCall[0][0].actualWeightPerSet).toEqual([
                null,
                null,
                null,
            ]);
        });
    });

    describe('getWorkoutSessionById', () => {
        it('should return workout session with exercises', async () => {
            const sessionWithExercises = {
                ...mockWorkoutSession,
                exercises: [mockWorkoutSessionExercise],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(
                sessionWithExercises,
            );
            workoutSessionRepository.findActive.mockResolvedValue([]); // For previous session lookup

            const result = await service.getWorkoutSessionById(1);

            expect(result).toBeDefined();
            expect(
                workoutSessionRepository.findByIdActive,
            ).toHaveBeenCalledWith(1, {
                exercises: { exercise: true },
                workoutSessionPlan: true,
            });
        });

        it('should throw NotFoundException when session not found', async () => {
            workoutSessionRepository.findByIdActive.mockResolvedValue(null);

            await expect(service.getWorkoutSessionById(999)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.getWorkoutSessionById(999)).rejects.toThrow(
                'Workout session not found',
            );
        });

        it('should load previous session data', async () => {
            const sessionWithExercises = {
                ...mockWorkoutSession,
                exercises: [{ ...mockWorkoutSessionExercise, exerciseId: 1 }],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(
                sessionWithExercises,
            );
            workoutSessionRepository.findActive.mockResolvedValue([]); // For previous session lookup

            const result = await service.getWorkoutSessionById(1);

            expect(result.exercises[0]).toHaveProperty('previousRepsPerSet');
            expect(result.exercises[0]).toHaveProperty('previousWeightPerSet');
        });
    });

    describe('logWorkoutSessionProgress', () => {
        const mockLogProgressDto = {
            progressData: {
                1: {
                    set1: { reps: 10, weight: 50 },
                    set2: { reps: 10, weight: 50 },
                    set3: { reps: 9, weight: 50 },
                },
            },
        };

        it('should log exercise progress successfully', async () => {
            const session = {
                ...mockWorkoutSession,
                exercises: [mockWorkoutSessionExercise],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(session);

            const mockUpdateRepo = {
                update: jest.fn().mockResolvedValue({ affected: 1 }),
            };
            const mockSaveRepo = {
                save: jest.fn().mockResolvedValue([]),
            };

            const mockManager = {
                getRepository: jest.fn((entity: any) => {
                    if (
                        entity === 'WorkoutSessionEntity' ||
                        entity?.name === 'WorkoutSessionEntity'
                    ) {
                        return mockUpdateRepo;
                    }
                    return mockSaveRepo;
                }),
            };
            dataSource.transaction.mockImplementation(async (callback: any) =>
                callback(mockManager),
            );

            await service.logWorkoutSessionProgress(
                mockLogProgressDto,
                1,
                1,
                false,
            );

            expect(
                workoutSessionRepository.findByIdActive,
            ).toHaveBeenCalledWith(1, {
                exercises: true,
            });
        });

        it('should throw NotFoundException when session not found', async () => {
            workoutSessionRepository.findByIdActive.mockResolvedValue(null);

            await expect(
                service.logWorkoutSessionProgress(mockLogProgressDto, 999, 1),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when user is not session owner', async () => {
            const session = {
                ...mockWorkoutSession,
                createdById: 999,
                exercises: [],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(session);

            await expect(
                service.logWorkoutSessionProgress(mockLogProgressDto, 1, 1),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when session already completed', async () => {
            const completedSession = {
                ...mockWorkoutSession,
                status: WorkoutSessionStatusEnum.COMPLETED,
                exercises: [],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(
                completedSession,
            );

            await expect(
                service.logWorkoutSessionProgress(mockLogProgressDto, 1, 1),
            ).rejects.toThrow(
                'Cannot log progress for a completed workout session',
            );
        });

        it('should mark session as completed when finish flag is true', async () => {
            const session = {
                ...mockWorkoutSession,
                exercises: [mockWorkoutSessionExercise],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(session);

            const mockUpdateRepo = {
                update: jest.fn().mockResolvedValue({ affected: 1 }),
            };
            const mockSaveRepo = {
                save: jest.fn().mockResolvedValue([]),
            };

            const mockManager = {
                getRepository: jest.fn((entity: any) => {
                    if (
                        entity === 'WorkoutSessionEntity' ||
                        entity?.name === 'WorkoutSessionEntity'
                    ) {
                        return mockUpdateRepo;
                    }
                    return mockSaveRepo;
                }),
            };
            dataSource.transaction.mockImplementation(async (callback: any) =>
                callback(mockManager),
            );

            await service.logWorkoutSessionProgress(
                mockLogProgressDto,
                1,
                1,
                true,
            );

            expect(mockUpdateRepo.update).toHaveBeenCalled();
            const updateCall = mockUpdateRepo.update.mock.calls[0];
            expect(updateCall[1]).toHaveProperty(
                'status',
                WorkoutSessionStatusEnum.COMPLETED,
            );
        });
    });

    describe('finishWorkoutSession', () => {
        it('should finish workout session with progress data', async () => {
            const session = {
                ...mockWorkoutSession,
                exercises: [mockWorkoutSessionExercise],
            };
            workoutSessionRepository.findByIdActive.mockResolvedValue(session);

            const mockProgressDto = {
                progressData: {
                    1: {
                        set1: { reps: 10, weight: 50 },
                    },
                },
            };

            const mockUpdateRepo = {
                update: jest.fn().mockResolvedValue({ affected: 1 }),
            };
            const mockSaveRepo = {
                save: jest.fn().mockResolvedValue([]),
            };

            const mockManager = {
                getRepository: jest.fn((entity: any) => {
                    if (
                        entity === 'WorkoutSessionEntity' ||
                        entity?.name === 'WorkoutSessionEntity'
                    ) {
                        return mockUpdateRepo;
                    }
                    return mockSaveRepo;
                }),
            };
            dataSource.transaction.mockImplementation(async (callback: any) =>
                callback(mockManager),
            );

            await service.finishWorkoutSession(mockProgressDto, 1, 1);

            expect(workoutSessionRepository.findByIdActive).toHaveBeenCalled();
        });

        it('should throw NotFoundException when session not found', async () => {
            workoutSessionRepository.findByIdActive.mockResolvedValue(null);

            const mockProgressDto = {
                progressData: {},
            };

            await expect(
                service.finishWorkoutSession(mockProgressDto, 999, 1),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getWorkoutSessionInProgress', () => {
        it('should return in-progress session for user', async () => {
            const sessionWithExercises = {
                ...mockWorkoutSession,
                exercises: [mockWorkoutSessionExercise],
            };
            workoutSessionRepository.findOneActive.mockResolvedValue(
                sessionWithExercises,
            );
            workoutSessionRepository.findActive.mockResolvedValue([]); // For previous session lookup

            const result = await service.getWorkoutSessionInProgress(1);

            expect(result).toBeDefined();
            expect(workoutSessionRepository.findOneActive).toHaveBeenCalledWith(
                {
                    where: {
                        createdById: 1,
                        status: WorkoutSessionStatusEnum.IN_PROGRESS,
                    },
                    relations: {
                        exercises: { exercise: true },
                        workoutSessionPlan: true,
                    },
                },
            );
        });

        it('should throw NotFoundException when no active session found', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);

            await expect(
                service.getWorkoutSessionInProgress(1),
            ).rejects.toThrow(NotFoundException);
            await expect(
                service.getWorkoutSessionInProgress(1),
            ).rejects.toThrow('Workout session not found');
        });

        it('should load previous session data for exercises', async () => {
            const sessionWithExercises = {
                ...mockWorkoutSession,
                exercises: [{ ...mockWorkoutSessionExercise, exerciseId: 1 }],
            };
            workoutSessionRepository.findOneActive.mockResolvedValue(
                sessionWithExercises,
            );
            workoutSessionRepository.findActive.mockResolvedValue([]); // For previous session lookup

            const result = await service.getWorkoutSessionInProgress(1);

            expect(result.exercises[0]).toHaveProperty('previousRepsPerSet');
            expect(result.exercises[0]).toHaveProperty('previousWeightPerSet');
        });
    });

    describe('syncWorkoutSessionTime', () => {
        it('should update session duration and timestamp', async () => {
            const now = new Date();
            const startedAt = new Date(now.getTime() - 60000); // 60 seconds ago

            const session = {
                ...mockWorkoutSession,
                startedAt: startedAt,
                durationSeconds: 0,
            };

            workoutSessionRepository.findOneActive.mockResolvedValue(session);
            workoutSessionRepository.save.mockResolvedValue({
                ...session,
                durationSeconds: 60,
                updatedAt: now,
            });

            await service.syncWorkoutSessionTime(1);

            expect(workoutSessionRepository.findOneActive).toHaveBeenCalledWith(
                {
                    where: {
                        createdById: 1,
                        status: WorkoutSessionStatusEnum.IN_PROGRESS,
                    },
                },
            );
            expect(workoutSessionRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when no active session found', async () => {
            workoutSessionRepository.findOneActive.mockResolvedValue(null);

            await expect(service.syncWorkoutSessionTime(1)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.syncWorkoutSessionTime(1)).rejects.toThrow(
                'No active workout session found to sync time',
            );
        });

        it('should calculate duration based on startedAt', async () => {
            const startTime = new Date('2024-01-01T10:00:00');
            const nowTime = new Date('2024-01-01T10:05:00'); // 5 minutes later

            const session = {
                ...mockWorkoutSession,
                startedAt: startTime,
                durationSeconds: 0,
            };

            workoutSessionRepository.findOneActive.mockResolvedValue(session);

            // Mock save to check what was saved
            let savedSession: any;
            workoutSessionRepository.save.mockImplementation((s: any) => {
                savedSession = s;
                return Promise.resolve(s);
            });

            // Mock Date.now() for consistent testing
            jest.useFakeTimers();
            jest.setSystemTime(nowTime);

            await service.syncWorkoutSessionTime(1);

            jest.useRealTimers();

            expect(savedSession.durationSeconds).toBeGreaterThanOrEqual(299);
        });

        it('should set startedAt if not already set', async () => {
            const session = {
                ...mockWorkoutSession,
                startedAt: undefined,
            };

            workoutSessionRepository.findOneActive.mockResolvedValue(session);

            let savedSession: any;
            workoutSessionRepository.save.mockImplementation((s: any) => {
                savedSession = s;
                return Promise.resolve(s);
            });

            await service.syncWorkoutSessionTime(1);

            expect(savedSession.startedAt).toBeDefined();
        });
    });

    describe('private method behavior', () => {
        it('should handle previous session data with numeric and null values', async () => {
            const sessionWithMixedData = {
                ...mockWorkoutSession,
                exercises: [
                    {
                        ...mockWorkoutSessionExercise,
                        exerciseId: 1,
                        actualRepsPerSet: [10, null, 9],
                        actualWeightPerSet: [50, 50, null],
                    },
                ],
            };

            workoutSessionRepository.findByIdActive.mockResolvedValue(
                sessionWithMixedData,
            );
            workoutSessionRepository.findActive.mockResolvedValue([
                sessionWithMixedData,
            ]);

            const result = await service.getWorkoutSessionById(1);

            expect(result).toBeDefined();
        });

        it('should handle exercises without previous session', async () => {
            const session = {
                ...mockWorkoutSession,
                exercises: [mockWorkoutSessionExercise],
            };

            workoutSessionRepository.findByIdActive.mockResolvedValue(session);
            workoutSessionRepository.findActive.mockResolvedValue([]); // No previous session

            const result = await service.getWorkoutSessionById(1);

            expect(result.exercises[0].previousRepsPerSet).toBeNull();
            expect(result.exercises[0].previousWeightPerSet).toBeNull();
        });
    });
});
