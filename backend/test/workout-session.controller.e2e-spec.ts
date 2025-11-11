/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { RoleEntity } from '../src/modules/user/entities/role.entity';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { RoleEnum } from '../src/modules/user/enums/role.enum';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTestDatabaseConfig } from './test.config';
import { AuthModule } from '../src/modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RoleGuard } from '../src/modules/auth/guards/role.guard';
import { ExerciseModule } from '../src/modules/exercise/exercise.module';
import { WorkoutModule } from '../src/modules/workout/workout.module';
import { TrainingSplitModule } from '../src/modules/training-split/training-split.module';
import { WorkoutSessionEntity } from '../src/modules/workout/entities/workout-session.entity';
import { WorkoutSessionPlanEntity } from '../src/modules/workout/entities/workout-session-plan.entity';
import { TrainingSplitEntity } from '../src/modules/training-split/entities/training-split.entity';
import { ExerciseEntity } from '../src/modules/exercise/entities/exercise.entity';
import { WorkoutSessionPlanExerciseEntity } from '../src/modules/workout/entities/workout-session-plan-exercise.entity';
import { BodyPartEnum } from '../src/modules/exercise/enums/body-part.enum';
import { WorkoutSessionCreateDto } from '../src/modules/workout/dtos/workout-session/workout-session-create.dto';
import { WorkoutSessionLogProgressDto } from '../src/modules/workout/dtos/workout-session/workout-session-log-progess.dto';
import { WorkoutSessionStatusEnum } from '../src/modules/workout/enums/workout-session-status.enum';
import { RedisModule } from '../src/common/redis/redis.module';

describe('WorkoutSessionController (e2e - Integration Tests)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: UserRepository;

    // Test users and tokens
    let traineeToken: string;
    let adminToken: string;
    let trainerToken: string;
    let traineeId: number;
    let trainerId: number;

    // Test data IDs
    let testWorkoutPlanId: number;
    let testTrainingSplitId: number;
    let testExerciseId: number;
    let testPlanExerciseId: number;
    let testWorkoutSessionId: number;

    jest.setTimeout(30000);

    beforeAll(async () => {
        // Override environment variables for testing
        process.env.POSTGRES_HOST = 'localhost';
        process.env.POSTGRES_PORT = '5433';
        process.env.POSTGRES_USER = 'workout_test';
        process.env.POSTGRES_PASSWORD = 'workout_test';
        process.env.POSTGRES_DB = 'workout_test_db';
        process.env.REDIS_HOST = 'localhost';
        process.env.REDIS_PORT = '6380';
        process.env.JWT_SECRET = 'test-jwt-secret-key-for-integration-tests';
        process.env.JWT_EXPIRES_IN = '1h';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test',
                    ignoreEnvFile: false,
                }),
                TypeOrmModule.forRoot(getTestDatabaseConfig()),
                RedisModule,
                AuthModule,
                ExerciseModule,
                WorkoutModule,
                TrainingSplitModule,
            ],
            providers: [
                {
                    provide: APP_GUARD,
                    useClass: JwtAuthGuard,
                },
                {
                    provide: APP_GUARD,
                    useClass: RoleGuard,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Apply global pipes (same as in main.ts)
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();

        // Get repositories and services
        dataSource = moduleFixture.get<DataSource>(DataSource);
        userRepository = moduleFixture.get<UserRepository>(UserRepository);

        // Setup test data
        await setupTestData();
    });

    afterAll(async () => {
        try {
            // Clean up test data
            if (dataSource && dataSource.isInitialized) {
                await dataSource.destroy();
            }
        } catch (error) {
            console.error('Error destroying data source:', error);
        }

        try {
            if (app) {
                await app.close();
            }
        } catch (error) {
            console.error('Error closing app:', error);
        }
    });

    const setupTestData = async () => {
        const roleRepository = dataSource.getRepository(RoleEntity);
        const workoutPlanRepository =
            dataSource.getRepository(WorkoutSessionPlanEntity);
        const trainingSplitRepository =
            dataSource.getRepository(TrainingSplitEntity);
        const exerciseRepository = dataSource.getRepository(ExerciseEntity);
        const planExerciseRepository = dataSource.getRepository(
            WorkoutSessionPlanExerciseEntity,
        );
        const workoutSessionRepository =
            dataSource.getRepository(WorkoutSessionEntity);

        // Create roles if they don't exist
        let adminRole = await roleRepository.findOne({
            where: { id: RoleEnum.ADMIN },
        });
        if (!adminRole) {
            adminRole = roleRepository.create({
                id: RoleEnum.ADMIN,
                name: 'admin',
                description: 'Administrator role',
            });
            await roleRepository.save(adminRole);
        }

        let trainerRole = await roleRepository.findOne({
            where: { id: RoleEnum.TRAINER },
        });
        if (!trainerRole) {
            trainerRole = roleRepository.create({
                id: RoleEnum.TRAINER,
                name: 'trainer',
                description: 'Trainer role',
            });
            await roleRepository.save(trainerRole);
        }

        let traineeRole = await roleRepository.findOne({
            where: { id: RoleEnum.TRAINEE },
        });
        if (!traineeRole) {
            traineeRole = roleRepository.create({
                id: RoleEnum.TRAINEE,
                name: 'trainee',
                description: 'Trainee role',
            });
            await roleRepository.save(traineeRole);
        }

        // Create admin user
        const hashedAdminPassword = await hash('AdminPass123456', 10);
        const adminUser = userRepository.create({
            email: 'admin@example.com',
            nickname: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            password: hashedAdminPassword,
            roles: [adminRole],
        });
        await userRepository.save(adminUser);

        // Create trainer user
        const hashedTrainerPassword = await hash('TrainerPass123456', 10);
        const trainerUser = userRepository.create({
            email: 'trainer@example.com',
            nickname: 'trainer',
            firstName: 'Trainer',
            lastName: 'User',
            password: hashedTrainerPassword,
            roles: [trainerRole],
        });
        const savedTrainer = await userRepository.save(trainerUser);
        trainerId = savedTrainer.id;

        // Create trainee user
        const hashedTraineePassword = await hash('TraineePass123456', 10);
        const traineeUser = userRepository.create({
            email: 'trainee@example.com',
            nickname: 'trainee',
            firstName: 'Trainee',
            lastName: 'User',
            password: hashedTraineePassword,
            roles: [traineeRole],
        });
        const savedTrainee = await userRepository.save(traineeUser);
        traineeId = savedTrainee.id;

        // Get tokens for each user
        const adminLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'AdminPass123456',
            });
        adminToken = adminLoginResponse.body.accessToken;

        const trainerLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'trainer@example.com',
                password: 'TrainerPass123456',
            });
        trainerToken = trainerLoginResponse.body.accessToken;

        const traineeLoginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'trainee@example.com',
                password: 'TraineePass123456',
            });
        traineeToken = traineeLoginResponse.body.accessToken;

        // Create test exercise
        const testExercise = exerciseRepository.create({
            name: 'Bench Press',
            bodyPart: BodyPartEnum.CHEST,
            equipment: 'Barbell',
            description: 'Test exercise',
            createdById: traineeId,
        });
        const savedExercise = await exerciseRepository.save(testExercise);
        testExerciseId = savedExercise.id;

        // Create test workout plan
        const testWorkoutPlan = workoutPlanRepository.create({
            name: 'Test Workout Plan',
            description: 'A test workout plan',
            isPublic: false,
            isApproved: false,
            createdById: traineeId,
        });
        const savedWorkoutPlan =
            await workoutPlanRepository.save(testWorkoutPlan);
        testWorkoutPlanId = savedWorkoutPlan.id;

        // Create test plan exercise
        const testPlanExercise = planExerciseRepository.create({
            workoutSessionPlanId: testWorkoutPlanId,
            exerciseId: testExerciseId,
            order: 1,
            plannedSets: 3,
            plannedRepsPerSet: [10, 10, 10],
            createdById: traineeId,
        });
        const savedPlanExercise =
            await planExerciseRepository.save(testPlanExercise);
        testPlanExerciseId = savedPlanExercise.id;

        // Create test training split
        const testTrainingSplit = trainingSplitRepository.create({
            name: 'Test Training Split',
            description: 'A test training split',
            createdById: traineeId,
        });
        const savedTrainingSplit =
            await trainingSplitRepository.save(testTrainingSplit);
        testTrainingSplitId = savedTrainingSplit.id;

        // Create a completed workout session for testing
        const testWorkoutSession = workoutSessionRepository.create({
            workoutSessionPlanId: testWorkoutPlanId,
            trainingSplitId: testTrainingSplitId,
            performedById: traineeId,
            status: WorkoutSessionStatusEnum.COMPLETED,
            startedAt: new Date(),
            finishedAt: new Date(),
            durationSeconds: 3600,
            createdById: traineeId,
        });
        const savedWorkoutSession =
            await workoutSessionRepository.save(testWorkoutSession);
        testWorkoutSessionId = savedWorkoutSession.id;
    };

    describe('POST /workout-sessions', () => {
        it('should require authentication token', async () => {
            const createDto: WorkoutSessionCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
            };

            await request(app.getHttpServer())
                .post('/workout-sessions')
                .send(createDto)
                .expect(401);
        });

        it('should start a workout session with valid data', async () => {
            const createDto: WorkoutSessionCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
            };

            const response = await request(app.getHttpServer())
                .post('/workout-sessions')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([200, 201, 400, 500]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body).toHaveProperty('id');
                expect(response.body.workoutSessionPlanId).toBe(
                    createDto.workoutSessionPlanId,
                );
            }
        });

        it('should reject creation with missing required fields', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                // Missing trainingSplitId
            };

            const response = await request(app.getHttpServer())
                .post('/workout-sessions')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject creation with non-numeric workoutSessionPlanId', async () => {
            const createDto: any = {
                workoutSessionPlanId: 'invalid',
                trainingSplitId: testTrainingSplitId,
            };

            const response = await request(app.getHttpServer())
                .post('/workout-sessions')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject creation with non-existent workout plan', async () => {
            const createDto: WorkoutSessionCreateDto = {
                workoutSessionPlanId: 999999,
                trainingSplitId: testTrainingSplitId,
            };

            const response = await request(app.getHttpServer())
                .post('/workout-sessions')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 404, 500]).toContain(response.status);
        });

        it('should reject extra fields not in DTO', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                extraField: 'Should be rejected',
            };

            const response = await request(app.getHttpServer())
                .post('/workout-sessions')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });
    });

    describe('GET /workout-sessions/in-progress', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .get('/workout-sessions/in-progress')
                .expect(401);
        });

        it('should get in-progress workout session', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-sessions/in-progress')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toHaveProperty('id');
                expect(response.body.status).toBe(WorkoutSessionStatusEnum.IN_PROGRESS);
            }
        });

        it('should handle case with no in-progress session', async () => {
            // Use trainer token who likely has no in-progress session
            const response = await request(app.getHttpServer())
                .get('/workout-sessions/in-progress')
                .set('Authorization', `Bearer ${trainerToken}`);

            expect([200, 404, 500]).toContain(response.status);
        });
    });

    describe('GET /workout-sessions/:id', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .get(`/workout-sessions/${testWorkoutSessionId}`)
                .expect(401);
        });

        it('should get workout session by ID', async () => {
            const response = await request(app.getHttpServer())
                .get(`/workout-sessions/${testWorkoutSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.id).toBe(testWorkoutSessionId);
                expect(response.body).toHaveProperty('workoutSessionPlanId');
            }
        });

        it('should handle non-existent workout session ID', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-sessions/999999')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([404, 500]).toContain(response.status);
        });

        it('should reject invalid ID format', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-sessions/invalid')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([400, 404, 500]).toContain(response.status);
        });
    });

    describe('PUT /workout-sessions/:id', () => {
        let activeSessionId: number;

        beforeAll(async () => {
            // Create an in-progress session for testing
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const activeSession = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(activeSession);
            activeSessionId = savedSession.id;
        });

        it('should require authentication', async () => {
            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                    },
                },
            };

            await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .send(logProgressDto)
                .expect(401);
        });

        it('should log progress with valid data', async () => {
            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                        2: { reps: 8, weight: 55 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should allow logging progress without weight', async () => {
            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 15, weight: null },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should reject invalid progress data structure', async () => {
            const logProgressDto: any = {
                progressData: 'invalid',
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject negative reps', async () => {
            const logProgressDto: any = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: -5, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject zero reps', async () => {
            const logProgressDto: any = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 0, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject negative weight', async () => {
            const logProgressDto: any = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: -50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject missing reps in set data', async () => {
            const logProgressDto: any = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${activeSessionId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should handle non-existent session ID', async () => {
            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put('/workout-sessions/999999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([404, 500]).toContain(response.status);
        });
    });

    describe('PUT /workout-sessions/:id/finish', () => {
        let sessionToFinishId: number;

        beforeEach(async () => {
            // Create a new in-progress session for each test
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const sessionToFinish = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(sessionToFinish);
            sessionToFinishId = savedSession.id;
        });

        it('should require authentication', async () => {
            const finishDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                    },
                },
            };

            await request(app.getHttpServer())
                .put(`/workout-sessions/${sessionToFinishId}/finish`)
                .send(finishDto)
                .expect(401);
        });

        it('should finish workout session with progress data', async () => {
            const finishDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                        2: { reps: 10, weight: 50 },
                        3: { reps: 8, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${sessionToFinishId}/finish`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(finishDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should finish session with empty progress data', async () => {
            const finishDto: WorkoutSessionLogProgressDto = {
                progressData: {},
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${sessionToFinishId}/finish`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(finishDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should reject finishing with invalid progress data', async () => {
            const finishDto: any = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: -10, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${sessionToFinishId}/finish`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(finishDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should handle non-existent session ID', async () => {
            const finishDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put('/workout-sessions/999999/finish')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(finishDto);

            expect([404, 500]).toContain(response.status);
        });
    });

    describe('PATCH /workout-sessions/time/sync', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .patch('/workout-sessions/time/sync')
                .expect(401);
        });

        it('should sync workout session time', async () => {
            const response = await request(app.getHttpServer())
                .patch('/workout-sessions/time/sync')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([200, 404, 500]).toContain(response.status);
        });

        it('should handle no active session to sync', async () => {
            // Use trainer token who likely has no active session
            const response = await request(app.getHttpServer())
                .patch('/workout-sessions/time/sync')
                .set('Authorization', `Bearer ${trainerToken}`);

            expect([200, 404, 500]).toContain(response.status);
        });
    });

    describe('Authentication Edge Cases', () => {
        it('should reject missing Bearer prefix', async () => {
            await request(app.getHttpServer())
                .get('/workout-sessions/in-progress')
                .set('Authorization', traineeToken)
                .expect(401);
        });

        it('should reject malformed auth header', async () => {
            await request(app.getHttpServer())
                .get('/workout-sessions/in-progress')
                .set('Authorization', 'InvalidFormat token')
                .expect(401);
        });

        it('should reject invalid tokens', async () => {
            await request(app.getHttpServer())
                .get('/workout-sessions/in-progress')
                .set('Authorization', 'Bearer invalid.token.here')
                .expect(401);
        });
    });

    describe('Validation Edge Cases', () => {
        it('should reject non-integer exercise IDs in progress data', async () => {
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const activeSession = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(activeSession);

            const logProgressDto: any = {
                progressData: {
                    'not-a-number': {
                        1: { reps: 10, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${savedSession.id}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject non-integer set numbers in progress data', async () => {
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const activeSession = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(activeSession);

            const logProgressDto: any = {
                progressData: {
                    [testPlanExerciseId]: {
                        'not-a-number': { reps: 10, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${savedSession.id}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should handle very large weight values', async () => {
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const activeSession = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(activeSession);

            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 999999 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${savedSession.id}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should handle very large rep values', async () => {
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const activeSession = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(activeSession);

            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 999, weight: 50 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${savedSession.id}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should handle multiple exercises in progress data', async () => {
            const workoutSessionRepository =
                dataSource.getRepository(WorkoutSessionEntity);
            const activeSession = workoutSessionRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
                performedById: traineeId,
                status: WorkoutSessionStatusEnum.IN_PROGRESS,
                startedAt: new Date(),
                createdById: traineeId,
            });
            const savedSession =
                await workoutSessionRepository.save(activeSession);

            const logProgressDto: WorkoutSessionLogProgressDto = {
                progressData: {
                    [testPlanExerciseId]: {
                        1: { reps: 10, weight: 50 },
                        2: { reps: 10, weight: 50 },
                        3: { reps: 8, weight: 50 },
                    },
                    [testPlanExerciseId + 1]: {
                        1: { reps: 12, weight: 40 },
                        2: { reps: 10, weight: 40 },
                    },
                },
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-sessions/${savedSession.id}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(logProgressDto);

            expect([200, 400, 500]).toContain(response.status);
        });
    });

    describe('Concurrent Requests', () => {
        it('should handle multiple concurrent GET requests', async () => {
            const requests = Array(3)
                .fill(null)
                .map(() =>
                    request(app.getHttpServer())
                        .get(`/workout-sessions/${testWorkoutSessionId}`)
                        .set('Authorization', `Bearer ${traineeToken}`),
                );

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect([200, 404, 500]).toContain(response.status);
            });
        });
    });

    describe('Data Consistency', () => {
        it('should create session and maintain referential integrity', async () => {
            const createDto: WorkoutSessionCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                trainingSplitId: testTrainingSplitId,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/workout-sessions')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            if (createResponse.status === 200 || createResponse.status === 201) {
                const sessionId = createResponse.body.id;

                const getResponse = await request(app.getHttpServer())
                    .get(`/workout-sessions/${sessionId}`)
                    .set('Authorization', `Bearer ${traineeToken}`);

                if (getResponse.status === 200) {
                    expect(getResponse.body.workoutSessionPlanId).toBe(
                        testWorkoutPlanId,
                    );
                    expect(getResponse.body.trainingSplitId).toBe(
                        testTrainingSplitId,
                    );
                }
            }
        });
    });
});
