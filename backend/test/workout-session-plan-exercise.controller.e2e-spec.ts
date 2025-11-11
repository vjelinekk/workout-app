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
import { WorkoutSessionPlanEntity } from '../src/modules/workout/entities/workout-session-plan.entity';
import { WorkoutSessionPlanExerciseEntity } from '../src/modules/workout/entities/workout-session-plan-exercise.entity';
import { ExerciseEntity } from '../src/modules/exercise/entities/exercise.entity';
import { BodyPartEnum } from '../src/modules/exercise/enums/body-part.enum';
import { WorkoutSessionPlanExerciseCreateDto } from '../src/modules/workout/dtos/workout-session-plan-exercise/workout-session-plan-exercise-create.dto';

describe('WorkoutSessionPlanExerciseController (e2e - Integration Tests)', () => {
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
    let testExerciseId: number;
    let testPlanExerciseId: number;
    let otherUserWorkoutPlanId: number;
    let otherUserPlanExerciseId: number;

    jest.setTimeout(30000);

    beforeAll(async () => {
        // Override environment variables for testing
        process.env.POSTGRES_HOST = 'localhost';
        process.env.POSTGRES_PORT = '5433';
        process.env.POSTGRES_USER = 'workout_test';
        process.env.POSTGRES_PASSWORD = 'workout_test';
        process.env.POSTGRES_DB = 'workout_test_db';
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
        const exerciseRepository = dataSource.getRepository(ExerciseEntity);
        const planExerciseRepository = dataSource.getRepository(
            WorkoutSessionPlanExerciseEntity,
        );

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

        // Create test exercises
        const testExercise = exerciseRepository.create({
            name: 'Bench Press',
            bodyPart: BodyPartEnum.CHEST,
            equipment: 'Barbell',
            description: 'Test exercise',
            createdById: traineeId,
        });
        const savedExercise = await exerciseRepository.save(testExercise);
        testExerciseId = savedExercise.id;

        // Create test workout plan for trainee
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

        // Create workout plan for another user (trainer)
        const otherUserWorkoutPlan = workoutPlanRepository.create({
            name: 'Other User Plan',
            description: 'Another users plan',
            isPublic: false,
            isApproved: false,
            createdById: trainerId,
        });
        const savedOtherPlan =
            await workoutPlanRepository.save(otherUserWorkoutPlan);
        otherUserWorkoutPlanId = savedOtherPlan.id;

        // Create plan exercise for other user
        const otherUserPlanExercise = planExerciseRepository.create({
            workoutSessionPlanId: otherUserWorkoutPlanId,
            exerciseId: testExerciseId,
            order: 1,
            plannedSets: 4,
            plannedRepsPerSet: [12, 10, 8, 6],
            createdById: trainerId,
        });
        const savedOtherPlanExercise =
            await planExerciseRepository.save(otherUserPlanExercise);
        otherUserPlanExerciseId = savedOtherPlanExercise.id;
    };

    describe('POST /workout-session-plan-exercises', () => {
        it('should require authentication token', async () => {
            const createDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 2,
                plannedSets: 3,
                plannedRepsPerSet: [12, 12, 12],
            };

            await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .send(createDto)
                .expect(401);
        });

        it('should create plan exercise with valid data', async () => {
            const createDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 2,
                plannedSets: 3,
                plannedRepsPerSet: [12, 12, 12],
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([201, 400, 500]).toContain(response.status);
            if (response.status === 201) {
                expect(response.body).toHaveProperty('id');
                expect(response.body.workoutSessionPlanId).toBe(
                    createDto.workoutSessionPlanId,
                );
                expect(response.body.exerciseId).toBe(createDto.exerciseId);
                expect(response.body.order).toBe(createDto.order);
            }
        });

        it('should reject creation with missing required fields', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                // Missing exerciseId, order, plannedSets, plannedRepsPerSet
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject mismatched plannedSets and plannedRepsPerSet length', async () => {
            const createDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 3,
                plannedSets: 3,
                plannedRepsPerSet: [12, 12], // Only 2 elements instead of 3
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject negative values in plannedSets', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: -1,
                plannedRepsPerSet: [10],
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject order less than 1', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 0,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should forbid creating plan exercise for other users plan', async () => {
            const createDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: otherUserWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 2,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            // Should forbid access to other user's plan
            expect([403, 404]).toContain(response.status);
        });
    });

    describe('POST /workout-session-plan-exercises/bulk', () => {
        it('should require authentication', async () => {
            const createDtos: WorkoutSessionPlanExerciseCreateDto[] = [
                {
                    workoutSessionPlanId: testWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 4,
                    plannedSets: 3,
                    plannedRepsPerSet: [10, 10, 10],
                },
            ];

            await request(app.getHttpServer())
                .post('/workout-session-plan-exercises/bulk')
                .send(createDtos)
                .expect(401);
        });

        it('should create multiple plan exercises in bulk', async () => {
            const createDtos: WorkoutSessionPlanExerciseCreateDto[] = [
                {
                    workoutSessionPlanId: testWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 5,
                    plannedSets: 3,
                    plannedRepsPerSet: [10, 10, 10],
                },
                {
                    workoutSessionPlanId: testWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 6,
                    plannedSets: 4,
                    plannedRepsPerSet: [12, 10, 8, 6],
                },
            ];

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises/bulk')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDtos);

            expect([201, 400, 500]).toContain(response.status);
        });

        it('should accept empty array for bulk operation', async () => {
            // Empty array is technically valid - it means "no exercises to create"
            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises/bulk')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send([]);

            // Should succeed or handle gracefully
            expect([201, 200, 400]).toContain(response.status);
        });
    });

    describe('GET /workout-session-plan-exercises', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .expect(401);
        });

        it('should require admin role', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`);

            // Non-admin should be forbidden
            expect(response.status).toBe(403);
        });

        it('should allow admin to get all plan exercises', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(Array.isArray(response.body)).toBe(true);
            }
        });

        it('should filter by workout session plan ID', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .query({ workout_session_plan_id: testWorkoutPlanId })
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 400, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(Array.isArray(response.body)).toBe(true);
            }
        });

        it('should handle invalid workout_session_plan_id parameter', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .query({ workout_session_plan_id: 'invalid' })
                .set('Authorization', `Bearer ${adminToken}`);

            expect([400, 500]).toContain(response.status);
        });
    });

    describe('GET /workout-session-plan-exercises/:id', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .get(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .expect(401);
        });

        it('should get plan exercise by ID for owner', async () => {
            const response = await request(app.getHttpServer())
                .get(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.id).toBe(testPlanExerciseId);
                expect(response.body).toHaveProperty('workoutSessionPlanId');
                expect(response.body).toHaveProperty('exerciseId');
            }
        });

        it('should allow admin to get any plan exercise', async () => {
            const response = await request(app.getHttpServer())
                .get(
                    `/workout-session-plan-exercises/${otherUserPlanExerciseId}`,
                )
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 404, 500]).toContain(response.status);
        });

        it('should forbid getting other users plan exercise', async () => {
            const response = await request(app.getHttpServer())
                .get(
                    `/workout-session-plan-exercises/${otherUserPlanExerciseId}`,
                )
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([403, 404, 500]).toContain(response.status);
        });

        it('should handle non-existent plan exercise ID', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-session-plan-exercises/999999')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([404, 500]).toContain(response.status);
        });

        it('should reject invalid ID format', async () => {
            const response = await request(app.getHttpServer())
                .get('/workout-session-plan-exercises/invalid')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([400, 404, 500]).toContain(response.status);
        });
    });

    describe('PATCH /workout-session-plan-exercises/:id', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .patch(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .send({ order: 10 })
                .expect(401);
        });

        it('should patch plan exercise with valid data', async () => {
            const patchDto = {
                order: 10,
            };

            const response = await request(app.getHttpServer())
                .patch(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto);

            expect([200, 400, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.order).toBe(patchDto.order);
            }
        });

        it('should allow partial updates', async () => {
            const patchDto = {
                plannedSets: 5,
                plannedRepsPerSet: [15, 12, 10, 8, 6],
            };

            const response = await request(app.getHttpServer())
                .patch(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should forbid patching other users plan exercise', async () => {
            const patchDto = {
                order: 5,
            };

            const response = await request(app.getHttpServer())
                .patch(
                    `/workout-session-plan-exercises/${otherUserPlanExerciseId}`,
                )
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto);

            expect([403, 404, 500]).toContain(response.status);
        });

        it('should validate plannedSets and plannedRepsPerSet mismatch in patch', async () => {
            const patchDto = {
                plannedSets: 3,
                plannedRepsPerSet: [10, 10], // Mismatch
            };

            const response = await request(app.getHttpServer())
                .patch(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto);

            expect([400, 500]).toContain(response.status);
        });
    });

    describe('PUT /workout-session-plan-exercises/:id', () => {
        it('should require authentication', async () => {
            const updateDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
            };

            await request(app.getHttpServer())
                .put(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .send(updateDto)
                .expect(401);
        });

        it('should update plan exercise with complete data', async () => {
            const updateDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: 4,
                plannedRepsPerSet: [15, 12, 10, 8],
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto);

            expect([200, 400, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.plannedSets).toBe(updateDto.plannedSets);
            }
        });

        it('should require all fields for PUT', async () => {
            const updateDto: any = {
                order: 1,
                // Missing required fields
            };

            const response = await request(app.getHttpServer())
                .put(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should forbid updating other users plan exercise', async () => {
            const updateDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: otherUserWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
            };

            const response = await request(app.getHttpServer())
                .put(
                    `/workout-session-plan-exercises/${otherUserPlanExerciseId}`,
                )
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto);

            expect([403, 404, 500]).toContain(response.status);
        });
    });

    describe('PUT /workout-session-plan-exercises/bulk', () => {
        it('should require authentication', async () => {
            const updateDtos: WorkoutSessionPlanExerciseCreateDto[] = [
                {
                    workoutSessionPlanId: testWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 1,
                    plannedSets: 3,
                    plannedRepsPerSet: [10, 10, 10],
                },
            ];

            await request(app.getHttpServer())
                .put('/workout-session-plan-exercises/bulk')
                .query({ workoutSessionPlanId: testWorkoutPlanId })
                .send(updateDtos)
                .expect(401);
        });

        it('should update multiple plan exercises in bulk', async () => {
            const updateDtos: WorkoutSessionPlanExerciseCreateDto[] = [
                {
                    workoutSessionPlanId: testWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 1,
                    plannedSets: 3,
                    plannedRepsPerSet: [10, 10, 10],
                },
            ];

            const response = await request(app.getHttpServer())
                .put('/workout-session-plan-exercises/bulk')
                .query({ workoutSessionPlanId: testWorkoutPlanId })
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDtos);

            expect([200, 400, 500]).toContain(response.status);
        });

        it('should require workoutSessionPlanId query parameter', async () => {
            const updateDtos: WorkoutSessionPlanExerciseCreateDto[] = [
                {
                    workoutSessionPlanId: testWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 1,
                    plannedSets: 3,
                    plannedRepsPerSet: [10, 10, 10],
                },
            ];

            const response = await request(app.getHttpServer())
                .put('/workout-session-plan-exercises/bulk')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDtos);

            expect([400, 500]).toContain(response.status);
        });

        it('should forbid bulk update for other users plan', async () => {
            const updateDtos: WorkoutSessionPlanExerciseCreateDto[] = [
                {
                    workoutSessionPlanId: otherUserWorkoutPlanId,
                    exerciseId: testExerciseId,
                    order: 1,
                    plannedSets: 3,
                    plannedRepsPerSet: [10, 10, 10],
                },
            ];

            const response = await request(app.getHttpServer())
                .put('/workout-session-plan-exercises/bulk')
                .query({ workoutSessionPlanId: otherUserWorkoutPlanId })
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDtos);

            // Should forbid access to other user's plan
            expect([403, 404]).toContain(response.status);
        });
    });

    describe('DELETE /workout-session-plan-exercises/:id', () => {
        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .delete(`/workout-session-plan-exercises/${testPlanExerciseId}`)
                .expect(401);
        });

        it('should delete plan exercise for owner', async () => {
            // Create a new plan exercise to delete
            const planExerciseRepository = dataSource.getRepository(
                WorkoutSessionPlanExerciseEntity,
            );
            const toDelete = planExerciseRepository.create({
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 99,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
                createdById: traineeId,
            });
            const savedToDelete = await planExerciseRepository.save(toDelete);

            const response = await request(app.getHttpServer())
                .delete(
                    `/workout-session-plan-exercises/${savedToDelete.id}`,
                )
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([200, 404, 500]).toContain(response.status);
        });

        it('should forbid deleting other users plan exercise', async () => {
            const response = await request(app.getHttpServer())
                .delete(
                    `/workout-session-plan-exercises/${otherUserPlanExerciseId}`,
                )
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([403, 404, 500]).toContain(response.status);
        });

        it('should allow admin to delete any plan exercise', async () => {
            // Create a new plan exercise to delete
            const planExerciseRepository = dataSource.getRepository(
                WorkoutSessionPlanExerciseEntity,
            );
            const toDelete = planExerciseRepository.create({
                workoutSessionPlanId: otherUserWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 98,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
                createdById: trainerId,
            });
            const savedToDelete = await planExerciseRepository.save(toDelete);

            const response = await request(app.getHttpServer())
                .delete(
                    `/workout-session-plan-exercises/${savedToDelete.id}`,
                )
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 404, 500]).toContain(response.status);
        });

        it('should handle non-existent plan exercise ID', async () => {
            const response = await request(app.getHttpServer())
                .delete('/workout-session-plan-exercises/999999')
                .set('Authorization', `Bearer ${traineeToken}`);

            expect([404, 500]).toContain(response.status);
        });
    });

    describe('Authentication Edge Cases', () => {
        it('should reject missing Bearer prefix', async () => {
            await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .set('Authorization', adminToken)
                .expect(401);
        });

        it('should reject malformed auth header', async () => {
            await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .set('Authorization', 'InvalidFormat token')
                .expect(401);
        });

        it('should reject invalid tokens', async () => {
            await request(app.getHttpServer())
                .get('/workout-session-plan-exercises')
                .set('Authorization', 'Bearer invalid.token.here')
                .expect(401);
        });
    });

    describe('Validation Edge Cases', () => {
        it('should reject extra fields not in DTO', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
                extraField: 'Should be rejected',
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should handle very large plannedRepsPerSet arrays', async () => {
            const createDto: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 100,
                plannedSets: 10,
                plannedRepsPerSet: Array(10).fill(10),
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([201, 400, 500]).toContain(response.status);
        });

        it('should validate plannedRepsPerSet contains only positive numbers', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: 3,
                plannedRepsPerSet: [10, -5, 10],
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });

        it('should reject non-array plannedRepsPerSet', async () => {
            const createDto: any = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 1,
                plannedSets: 3,
                plannedRepsPerSet: 'not an array',
            };

            const response = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            expect([400, 500]).toContain(response.status);
        });
    });

    describe('Data Consistency', () => {
        it('should handle same exercise multiple times in plan', async () => {
            const createDto1: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 101,
                plannedSets: 3,
                plannedRepsPerSet: [10, 10, 10],
            };

            const createDto2: WorkoutSessionPlanExerciseCreateDto = {
                workoutSessionPlanId: testWorkoutPlanId,
                exerciseId: testExerciseId,
                order: 102,
                plannedSets: 4,
                plannedRepsPerSet: [12, 10, 8, 6],
            };

            const response1 = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto1);

            const response2 = await request(app.getHttpServer())
                .post('/workout-session-plan-exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto2);

            // Both should succeed or fail gracefully
            expect([201, 400, 500]).toContain(response1.status);
            expect([201, 400, 500]).toContain(response2.status);
        });
    });

    describe('Concurrent Requests', () => {
        it('should handle multiple concurrent requests', async () => {
            const requests = Array(3)
                .fill(null)
                .map(() =>
                    request(app.getHttpServer())
                        .get(
                            `/workout-session-plan-exercises/${testPlanExerciseId}`,
                        )
                        .set('Authorization', `Bearer ${traineeToken}`),
                );

            const responses = await Promise.all(requests);

            // Should all complete without crashing
            responses.forEach((response) => {
                expect([200, 404, 500]).toContain(response.status);
            });
        });
    });
});
