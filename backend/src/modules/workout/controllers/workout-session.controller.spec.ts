/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutSessionController } from './workout-session.controller';
import { WorkoutSessionService } from '../services/workout-session.service';
import { createMockJwtUser } from 'src/common/test/test-helpers';
import { createMockUser } from 'src/common/test/mock-data';

/**
 * Tests for WorkoutSessionController
 *
 * WorkoutSessionController handles workout session logging endpoints:
 * - POST / - Start a new workout session
 * - GET /in-progress - Get current in-progress session
 * - GET /:id - Get workout session by ID
 * - PUT /:id/finish - Finish a workout session
 * - PUT /:id - Log progress (add exercises/sets)
 * - PATCH /time/sync - Sync workout session time
 */
describe('WorkoutSessionController', () => {
    let controller: WorkoutSessionController;
    let workoutSessionService: any;

    beforeEach(async () => {
        workoutSessionService = {
            startWorkoutSession: jest.fn(),
            getWorkoutSessionInProgress: jest.fn(),
            getWorkoutSessionById: jest.fn(),
            finishWorkoutSession: jest.fn(),
            logWorkoutSessionProgress: jest.fn(),
            syncWorkoutSessionTime: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WorkoutSessionController],
            providers: [
                {
                    provide: WorkoutSessionService,
                    useValue: workoutSessionService,
                },
            ],
        }).compile();

        controller = module.get<WorkoutSessionController>(
            WorkoutSessionController,
        );
    });

    describe('POST / - Start workout session', () => {
        it('should start a new workout session', async () => {
            const user = createMockJwtUser({ id: 1 });
            const createDto = {
                workoutSessionPlanId: 5,
                trainingSplitId: 1,
            };
            const response = {
                id: 1,
                workoutSessionPlanId: 5,
                performedById: user.id,
            };

            workoutSessionService.startWorkoutSession.mockResolvedValue(
                response,
            );

            const result = await controller.start(createDto, user);

            expect(result).toEqual(response);
            expect(
                workoutSessionService.startWorkoutSession,
            ).toHaveBeenCalledWith(createDto, user.id);
        });

        it('should pass user ID to service', async () => {
            const user = createMockJwtUser({ id: 5 });
            const createDto = {
                workoutSessionPlanId: 1,
                trainingSplitId: 1,
            };

            workoutSessionService.startWorkoutSession.mockResolvedValue({});

            await controller.start(createDto, user);

            expect(
                workoutSessionService.startWorkoutSession,
            ).toHaveBeenCalledWith(createDto, 5);
        });

        it('should return created workout session with ID', async () => {
            const user = createMockJwtUser({ id: 1 });
            const createDto = {
                workoutSessionPlanId: 2,
                trainingSplitId: 1,
            };
            const response = {
                id: 42,
                workoutSessionPlanId: 2,
                performedById: user.id,
            };

            workoutSessionService.startWorkoutSession.mockResolvedValue(
                response,
            );

            const result = await controller.start(createDto, user);

            expect(result.id).toBe(42);
        });

        it('should handle invalid workout plan ID', async () => {
            const user = createMockJwtUser({ id: 1 });
            const createDto = {
                workoutSessionPlanId: 999,
                trainingSplitId: 1,
            };

            workoutSessionService.startWorkoutSession.mockRejectedValue(
                new Error('Workout session plan not found'),
            );

            await expect(controller.start(createDto, user)).rejects.toThrow(
                'Workout session plan not found',
            );
        });

        it('should handle multiple concurrent starts', async () => {
            const users = [
                createMockJwtUser({ id: 1 }),
                createMockJwtUser({ id: 2 }),
            ];
            const createDto = {
                workoutSessionPlanId: 1,
                trainingSplitId: 1,
            };

            workoutSessionService.startWorkoutSession.mockResolvedValue({
                id: 1,
            });

            for (const user of users) {
                await controller.start(createDto, user);
            }

            expect(
                workoutSessionService.startWorkoutSession,
            ).toHaveBeenCalledTimes(2);
        });
    });

    describe('GET /in-progress - Get in-progress session', () => {
        it('should return current in-progress workout session', async () => {
            const user = createMockJwtUser({ id: 1 });
            const session = {
                id: 1,
                performedById: user.id,
                status: 'in-progress',
            };

            workoutSessionService.getWorkoutSessionInProgress.mockResolvedValue(
                session,
            );

            const result = await controller.getWorkoutSessionInProgress(user);

            expect(result).toEqual(session);
            expect(
                workoutSessionService.getWorkoutSessionInProgress,
            ).toHaveBeenCalledWith(user.id);
        });

        it('should pass user ID to service', async () => {
            const user = createMockJwtUser({ id: 3 });

            workoutSessionService.getWorkoutSessionInProgress.mockResolvedValue(
                {},
            );

            await controller.getWorkoutSessionInProgress(user);

            expect(
                workoutSessionService.getWorkoutSessionInProgress,
            ).toHaveBeenCalledWith(3);
        });

        it('should handle no active session', async () => {
            const user = createMockJwtUser({ id: 1 });

            workoutSessionService.getWorkoutSessionInProgress.mockRejectedValue(
                new Error('No active workout session'),
            );

            await expect(
                controller.getWorkoutSessionInProgress(user),
            ).rejects.toThrow('No active workout session');
        });

        it('should return session with complete data', async () => {
            const user = createMockJwtUser({ id: 1 });
            const session = {
                id: 5,
                performedById: user.id,
                workoutSessionPlanId: 1,
                startedAt: new Date(),
                exercises: [],
            };

            workoutSessionService.getWorkoutSessionInProgress.mockResolvedValue(
                session,
            );

            const result = await controller.getWorkoutSessionInProgress(user);

            expect(result.id).toBe(5);
            expect(result.performedById).toBe(user.id);
        });
    });

    describe('GET /:id - Get workout session by ID', () => {
        it('should return workout session by ID', async () => {
            const sessionId = 1;
            const session = {
                id: sessionId,
                performedById: 1,
                status: 'finished',
            };

            workoutSessionService.getWorkoutSessionById.mockResolvedValue(
                session,
            );

            const result = await controller.get(sessionId);

            expect(result).toEqual(session);
            expect(
                workoutSessionService.getWorkoutSessionById,
            ).toHaveBeenCalledWith(sessionId);
        });

        it('should handle non-existent session', async () => {
            const sessionId = 999;

            workoutSessionService.getWorkoutSessionById.mockRejectedValue(
                new Error('Workout session not found'),
            );

            await expect(controller.get(sessionId)).rejects.toThrow(
                'Workout session not found',
            );
        });

        it('should return session with all fields', async () => {
            const sessionId = 5;
            const session = {
                id: sessionId,
                performedById: 1,
                workoutSessionPlanId: 2,
                startedAt: new Date(),
                finishedAt: new Date(),
                exercises: [],
            };

            workoutSessionService.getWorkoutSessionById.mockResolvedValue(
                session,
            );

            const result = await controller.get(sessionId);

            expect(result.id).toBe(sessionId);
            expect(result.performedById).toBe(1);
            expect(result.exercises).toBeDefined();
        });

        it('should work with different session IDs', async () => {
            const sessionIds = [1, 10, 100, 1000];

            for (const id of sessionIds) {
                workoutSessionService.getWorkoutSessionById.mockResolvedValue({
                    id,
                });

                const result = await controller.get(id);

                expect(result.id).toBe(id);
                expect(
                    workoutSessionService.getWorkoutSessionById,
                ).toHaveBeenCalledWith(id);
            }
        });
    });

    describe('PUT /:id/finish - Finish workout session', () => {
        it('should finish workout session with progress data', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const finishDto = {
                progressData: {
                    1: {
                        1: { reps: 10, weight: 50 },
                        2: { reps: 10, weight: 50 },
                    },
                },
            };

            workoutSessionService.finishWorkoutSession.mockResolvedValue(
                undefined,
            );

            await controller.finish(sessionId, finishDto, user);

            expect(
                workoutSessionService.finishWorkoutSession,
            ).toHaveBeenCalledWith(finishDto, sessionId, user.id);
        });

        it('should pass user ID to service', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 5 });
            const finishDto = { progressData: {} };

            workoutSessionService.finishWorkoutSession.mockResolvedValue(
                undefined,
            );

            await controller.finish(sessionId, finishDto, user);

            expect(
                workoutSessionService.finishWorkoutSession,
            ).toHaveBeenCalledWith(finishDto, sessionId, 5);
        });

        it('should handle empty exercises', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const finishDto = {
                progressData: {},
            };

            workoutSessionService.finishWorkoutSession.mockResolvedValue(
                undefined,
            );

            await controller.finish(sessionId, finishDto, user);

            expect(
                workoutSessionService.finishWorkoutSession,
            ).toHaveBeenCalledWith(finishDto, sessionId, user.id);
        });

        it('should handle non-existent session', async () => {
            const sessionId = 999;
            const user = createMockJwtUser({ id: 1 });
            const finishDto = { progressData: {} };

            workoutSessionService.finishWorkoutSession.mockRejectedValue(
                new Error('Session not found'),
            );

            await expect(
                controller.finish(sessionId, finishDto, user),
            ).rejects.toThrow('Session not found');
        });

        it('should handle unauthorized finish attempt', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 999 }); // Different user
            const finishDto = { progressData: {} };

            workoutSessionService.finishWorkoutSession.mockRejectedValue(
                new Error('Unauthorized'),
            );

            await expect(
                controller.finish(sessionId, finishDto, user),
            ).rejects.toThrow('Unauthorized');
        });

        it('should handle multiple exercise sets', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const finishDto = {
                progressData: {
                    1: {
                        1: { reps: 10, weight: 50 },
                        2: { reps: 8, weight: 55 },
                        3: { reps: 6, weight: 60 },
                    },
                    2: {
                        1: { reps: 15, weight: 30 },
                    },
                },
            };

            workoutSessionService.finishWorkoutSession.mockResolvedValue(
                undefined,
            );

            await controller.finish(sessionId, finishDto, user);

            expect(
                workoutSessionService.finishWorkoutSession,
            ).toHaveBeenCalledWith(finishDto, sessionId, user.id);
        });
    });

    describe('PUT /:id - Log progress', () => {
        it('should log workout session progress', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const logProgressDto = {
                progressData: {
                    1: {
                        1: { reps: 10, weight: 50 },
                    },
                },
            };

            workoutSessionService.logWorkoutSessionProgress.mockResolvedValue(
                undefined,
            );

            await controller.logProgress(logProgressDto, sessionId, user);

            expect(
                workoutSessionService.logWorkoutSessionProgress,
            ).toHaveBeenCalledWith(logProgressDto, sessionId, user.id);
        });

        it('should pass user ID to service', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 7 });
            const logProgressDto = { progressData: {} };

            workoutSessionService.logWorkoutSessionProgress.mockResolvedValue(
                undefined,
            );

            await controller.logProgress(logProgressDto, sessionId, user);

            expect(
                workoutSessionService.logWorkoutSessionProgress,
            ).toHaveBeenCalledWith(logProgressDto, sessionId, 7);
        });

        it('should handle adding single exercise', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const logProgressDto = {
                progressData: {
                    5: {
                        1: { reps: 12, weight: 40 },
                    },
                },
            };

            workoutSessionService.logWorkoutSessionProgress.mockResolvedValue(
                undefined,
            );

            await controller.logProgress(logProgressDto, sessionId, user);

            expect(
                workoutSessionService.logWorkoutSessionProgress,
            ).toHaveBeenCalledWith(logProgressDto, sessionId, user.id);
        });

        it('should handle multiple exercises', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const logProgressDto = {
                progressData: {
                    1: { 1: { reps: 10, weight: 50 } },
                    2: { 1: { reps: 15, weight: 30 } },
                    3: { 1: { reps: 8, weight: 70 } },
                },
            };

            workoutSessionService.logWorkoutSessionProgress.mockResolvedValue(
                undefined,
            );

            await controller.logProgress(logProgressDto, sessionId, user);

            expect(
                workoutSessionService.logWorkoutSessionProgress,
            ).toHaveBeenCalledWith(logProgressDto, sessionId, user.id);
        });

        it('should handle non-existent session', async () => {
            const sessionId = 999;
            const user = createMockJwtUser({ id: 1 });
            const logProgressDto = { progressData: {} };

            workoutSessionService.logWorkoutSessionProgress.mockRejectedValue(
                new Error('Session not found'),
            );

            await expect(
                controller.logProgress(logProgressDto, sessionId, user),
            ).rejects.toThrow('Session not found');
        });

        it('should handle unauthorized progress logging', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 999 });
            const logProgressDto = { progressData: {} };

            workoutSessionService.logWorkoutSessionProgress.mockRejectedValue(
                new Error('Unauthorized'),
            );

            await expect(
                controller.logProgress(logProgressDto, sessionId, user),
            ).rejects.toThrow('Unauthorized');
        });
    });

    describe('PATCH /time/sync - Sync workout session time', () => {
        it('should sync workout session time', async () => {
            const user = createMockJwtUser({ id: 1 });

            workoutSessionService.syncWorkoutSessionTime.mockResolvedValue(
                undefined,
            );

            await controller.syncTime(user);

            expect(
                workoutSessionService.syncWorkoutSessionTime,
            ).toHaveBeenCalledWith(user.id);
        });

        it('should pass user ID to service', async () => {
            const user = createMockJwtUser({ id: 3 });

            workoutSessionService.syncWorkoutSessionTime.mockResolvedValue(
                undefined,
            );

            await controller.syncTime(user);

            expect(
                workoutSessionService.syncWorkoutSessionTime,
            ).toHaveBeenCalledWith(3);
        });

        it('should handle no active session', async () => {
            const user = createMockJwtUser({ id: 1 });

            workoutSessionService.syncWorkoutSessionTime.mockRejectedValue(
                new Error('No active workout session found'),
            );

            await expect(controller.syncTime(user)).rejects.toThrow(
                'No active workout session found',
            );
        });

        it('should work with different users', async () => {
            const users = [
                createMockJwtUser({ id: 1 }),
                createMockJwtUser({ id: 2 }),
                createMockJwtUser({ id: 3 }),
            ];

            workoutSessionService.syncWorkoutSessionTime.mockResolvedValue(
                undefined,
            );

            for (const user of users) {
                await controller.syncTime(user);
            }

            expect(
                workoutSessionService.syncWorkoutSessionTime,
            ).toHaveBeenCalledTimes(3);
        });

        it('should handle concurrent sync requests', async () => {
            const users = [
                createMockJwtUser({ id: 1 }),
                createMockJwtUser({ id: 2 }),
            ];

            workoutSessionService.syncWorkoutSessionTime.mockResolvedValue(
                undefined,
            );

            await Promise.all(users.map((user) => controller.syncTime(user)));

            expect(
                workoutSessionService.syncWorkoutSessionTime,
            ).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        it('should propagate service errors', async () => {
            const user = createMockJwtUser({ id: 1 });
            const createDto = {
                workoutSessionPlanId: 1,
                trainingSplitId: 1,
            };

            workoutSessionService.startWorkoutSession.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(controller.start(createDto, user)).rejects.toThrow(
                'Database error',
            );
        });

        it('should handle validation errors from service', async () => {
            const sessionId = 1;
            const user = createMockJwtUser({ id: 1 });
            const finishDto = { progressData: {} };

            workoutSessionService.finishWorkoutSession.mockRejectedValue(
                new Error('Invalid input data'),
            );

            await expect(
                controller.finish(sessionId, finishDto, user),
            ).rejects.toThrow('Invalid input data');
        });
    });

    describe('Parameter Types', () => {
        it('should handle numeric ID parameters correctly', async () => {
            const sessionId = 42;

            workoutSessionService.getWorkoutSessionById.mockResolvedValue({
                id: sessionId,
            });

            await controller.get(sessionId);

            expect(
                workoutSessionService.getWorkoutSessionById,
            ).toHaveBeenCalledWith(42);
        });

        it('should handle large numeric IDs', async () => {
            const largeId = 999999999;

            workoutSessionService.getWorkoutSessionById.mockResolvedValue({
                id: largeId,
            });

            await controller.get(largeId);

            expect(
                workoutSessionService.getWorkoutSessionById,
            ).toHaveBeenCalledWith(largeId);
        });
    });
});
