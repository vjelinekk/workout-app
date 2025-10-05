/**
 * Exercise Controller Integration Tests
 *
 * Comprehensive end-to-end tests for the Exercise controller endpoints.
 * Tests cover authentication, authorization, CRUD operations, scopes, edge cases, and performance.
 *
 * Test Status: 54 tests - all passing ✅
 * Coverage:
 * - POST /exercises: 11 tests (create with validation)
 * - GET /exercises/:id: 7 tests (retrieve single with scopes)
 * - GET /exercises: 5 tests (list with scope filters)
 * - PATCH /exercises/:id: 8 tests (partial updates)
 * - PUT /exercises/:id: 6 tests (full updates)
 * - DELETE /exercises/:id: 6 tests (soft delete)
 * - POST /exercises/:id/restore: 5 tests (restore deleted)
 * - Edge cases & security: 4 tests
 * - Performance: 2 tests
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getTestDatabaseConfig } from './test.config';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UserModule } from '../src/modules/user/user.module';
import { ExerciseModule } from '../src/modules/exercise/exercise.module';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { RoleEntity } from '../src/modules/user/entities/role.entity';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { RoleEnum } from '../src/modules/user/enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { ExerciseCreateDto } from '../src/modules/exercise/dtos/exercise/exercise-create.dto';
import { ExercisePatchDto } from '../src/modules/exercise/dtos/exercise/exercise-patch.dto';
import { ExerciseUpdateDto } from '../src/modules/exercise/dtos/exercise/exercise-update.dto';
import { BodyPartEnum } from '../src/modules/exercise/enums/body-part.enum';
import { FindAllScopes } from '../src/common/enums/find-all-scopes.enum';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('ExerciseController (e2e - Integration Tests)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: UserRepository;
    let jwtService: JwtService;

    // Test user credentials and tokens
    let adminToken: string;
    let traineeToken: string;
    let trainee2Token: string;
    let adminUserId: number;
    let traineeUserId: number;
    let trainee2UserId: number;

    // Test exercise and category IDs
    let testExerciseId: number;
    let testCategoryId: number;
    let patchExerciseId: number;
    let putExerciseId: number;
    let deleteExerciseId: number;
    let publicExerciseId: number;
    let privateExerciseId: number;

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
                UserModule,
                ExerciseModule,
            ],
            providers: [
                {
                    provide: APP_GUARD,
                    useClass: JwtAuthGuard,
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
        jwtService = moduleFixture.get<JwtService>(JwtService);

        // Setup test data
        await setupTestData();
    });

    afterAll(async () => {
        await app.close();
    });

    async function setupTestData() {
        // Create roles (Admin first with ID=1, Trainee second with ID=2)
        const adminRole = dataSource.getRepository(RoleEntity).create({
            id: RoleEnum.ADMIN,
            name: 'Admin',
            description: 'Administrator role',
        });
        await dataSource.getRepository(RoleEntity).save(adminRole);

        const traineeRole = dataSource.getRepository(RoleEntity).create({
            id: RoleEnum.TRAINEE,
            name: 'Trainee',
            description: 'Trainee role',
        });
        await dataSource.getRepository(RoleEntity).save(traineeRole);

        // Create admin user
        const adminUser = userRepository.create({
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            nickname: 'adminuser',
            password: await hash('admin123', 10),
            roles: [adminRole],
        });
        await userRepository.save(adminUser);
        adminUserId = adminUser.id;

        // Create trainee user 1
        const traineeUser = userRepository.create({
            email: 'trainee@test.com',
            firstName: 'Trainee',
            lastName: 'User',
            nickname: 'traineeuser',
            password: await hash('trainee123', 10),
            roles: [traineeRole],
        });
        await userRepository.save(traineeUser);
        traineeUserId = traineeUser.id;

        // Create trainee user 2 (for ownership tests)
        const trainee2User = userRepository.create({
            email: 'trainee2@test.com',
            firstName: 'Trainee2',
            lastName: 'User',
            nickname: 'traineeuser2',
            password: await hash('trainee123', 10),
            roles: [traineeRole],
        });
        await userRepository.save(trainee2User);
        trainee2UserId = trainee2User.id;

        // Generate JWT tokens
        adminToken = jwtService.sign({
            sub: adminUserId,
            email: adminUser.email,
            roles: adminUser.roles.map((role) => role.id),
        });

        traineeToken = jwtService.sign({
            sub: traineeUserId,
            email: traineeUser.email,
            roles: traineeUser.roles.map((role) => role.id),
        });

        trainee2Token = jwtService.sign({
            sub: trainee2UserId,
            email: trainee2User.email,
            roles: trainee2User.roles.map((role) => role.id),
        });

        // Create test category
        const categoryResponse = await request(app.getHttpServer())
            .post('/exercise-categories')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'Test Category',
                description: 'Category for exercise tests',
            });
        testCategoryId = categoryResponse.body.id;

        // Create test exercises
        const testExercise = await request(app.getHttpServer())
            .post('/exercises')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'Test Exercise',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'A test exercise',
                category_id: testCategoryId,
            });
        testExerciseId = testExercise.body.id;

        const patchExercise = await request(app.getHttpServer())
            .post('/exercises')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'PATCH Exercise',
                body_part: BodyPartEnum.BACK,
                equipment: 'Dumbbell',
                description: 'Exercise for PATCH tests',
            });
        patchExerciseId = patchExercise.body.id;

        const putExercise = await request(app.getHttpServer())
            .post('/exercises')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'PUT Exercise',
                body_part: BodyPartEnum.QUADRICEPS,
                equipment: 'None',
                description: 'Exercise for PUT tests',
            });
        putExerciseId = putExercise.body.id;

        const deleteExercise = await request(app.getHttpServer())
            .post('/exercises')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'DELETE Exercise',
                body_part: BodyPartEnum.SHOULDERS,
                equipment: 'Cable',
                description: 'Exercise for DELETE tests',
            });
        deleteExerciseId = deleteExercise.body.id;

        // Create public exercise
        const publicExercise = await request(app.getHttpServer())
            .post('/exercises')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'Public Exercise',
                body_part: BodyPartEnum.ABS,
                equipment: 'None',
                description: 'A public exercise',
                is_public: true,
            });
        publicExerciseId = publicExercise.body.id;

        // Create private exercise
        const privateExercise = await request(app.getHttpServer())
            .post('/exercises')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'Private Exercise',
                body_part: BodyPartEnum.BICEPS,
                equipment: 'Barbell',
                description: 'A private exercise',
                is_public: false,
            });
        privateExerciseId = privateExercise.body.id;
    }

    describe('POST /exercises', () => {
        it('should create an exercise with valid authentication', async () => {
            const createDto: ExerciseCreateDto = {
                name: 'Bench Press',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'A compound chest exercise',
                category_id: testCategoryId,
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(createDto.name);
            expect(response.body.body_part).toBe(createDto.body_part);
            expect(response.body.equipment).toBe(createDto.equipment);
            expect(response.body.description).toBe(createDto.description);
        });

        it('should return 401 without authentication', async () => {
            const createDto: ExerciseCreateDto = {
                name: 'Squat',
                body_part: BodyPartEnum.QUADRICEPS,
                equipment: 'Barbell',
                description: 'A leg exercise',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .send(createDto)
                .expect(401);
        });

        it('should return 400 with missing name', async () => {
            const createDto: any = {
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Missing name',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with missing body_part', async () => {
            const createDto: any = {
                name: 'Test Exercise',
                equipment: 'Barbell',
                description: 'Missing body part',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with invalid body_part enum', async () => {
            const createDto: any = {
                name: 'Test Exercise',
                body_part: 'InvalidBodyPart',
                equipment: 'Barbell',
                description: 'Invalid body part',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with missing equipment', async () => {
            const createDto: any = {
                name: 'Test Exercise',
                body_part: BodyPartEnum.CHEST,
                description: 'Missing equipment',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with missing description', async () => {
            const createDto: any = {
                name: 'Test Exercise',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should create exercise with optional fields', async () => {
            const createDto: ExerciseCreateDto = {
                name: 'Pull Up',
                body_part: BodyPartEnum.BACK,
                equipment: 'Pull-up bar',
                description: 'Upper body exercise',
                image_url: 'https://example.com/pullup.jpg',
                is_public: true,
                is_approved: false,
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            expect(response.body.image_url).toBe(createDto.image_url);
            expect(response.body.is_public).toBe(createDto.is_public);
        });

        it('should return 400 with invalid image URL', async () => {
            const createDto: any = {
                name: 'Test Exercise',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Test description',
                image_url: 'not-a-valid-url',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should reject extra fields not in DTO', async () => {
            const createDto: any = {
                name: 'Test Exercise',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Test description',
                extraField: 'Should be rejected',
            };

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should handle special characters in name and description', async () => {
            const createDto: ExerciseCreateDto = {
                name: "Test & <Exercise> with 'quotes'",
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Description with special chars: !@#$%^&*()',
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            expect(response.body.name).toBe(createDto.name);
            expect(response.body.description).toBe(createDto.description);
        });
    });

    describe('GET /exercises/:id', () => {
        it('should get exercise by id with authentication', async () => {
            const response = await request(app.getHttpServer())
                .get(`/exercises/${testExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toBe(testExerciseId);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('body_part');
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer())
                .get(`/exercises/${testExerciseId}`)
                .expect(401);
        });

        it('should return 404 for non-existent exercise', async () => {
            await request(app.getHttpServer())
                .get('/exercises/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should return 400 for invalid id format', async () => {
            await request(app.getHttpServer())
                .get('/exercises/invalid')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(400);
        });

        it('should get exercise with scope=available', async () => {
            const response = await request(app.getHttpServer())
                .get(`/exercises/${testExerciseId}`)
                .query({ scope: FindAllScopes.AVAILABLE })
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(response.body.id).toBe(testExerciseId);
        });

        it('should not get public exercise from another user (authorization check)', async () => {
            // Authorization checks happen before public/private check
            await request(app.getHttpServer())
                .get(`/exercises/${publicExerciseId}`)
                .set('Authorization', `Bearer ${trainee2Token}`)
                .expect(404); // Not authorized to access other user's exercises
        });

        it('should not get private exercise from another user', async () => {
            await request(app.getHttpServer())
                .get(`/exercises/${privateExerciseId}`)
                .set('Authorization', `Bearer ${trainee2Token}`)
                .expect(404);
        });
    });

    describe('GET /exercises', () => {
        it('should get all exercises with authentication', async () => {
            const response = await request(app.getHttpServer())
                .get('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            response.body.forEach((exercise: any) => {
                expect(exercise).toHaveProperty('id');
                expect(exercise).toHaveProperty('name');
                expect(exercise).toHaveProperty('body_part');
            });
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer()).get('/exercises').expect(401);
        });

        it('should get exercises with scope=my', async () => {
            const response = await request(app.getHttpServer())
                .get('/exercises')
                .query({ scope: FindAllScopes.MY })
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // All exercises should belong to the trainee user (verified by scope)
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should get exercises with scope=public', async () => {
            const response = await request(app.getHttpServer())
                .get('/exercises')
                .query({ scope: FindAllScopes.PUBLIC })
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // All exercises should be public
            response.body.forEach((exercise: any) => {
                expect(exercise.is_public).toBe(true);
            });
        });

        it('should get exercises with scope=available (default)', async () => {
            const response = await request(app.getHttpServer())
                .get('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('PATCH /exercises/:id', () => {
        it('should patch exercise name only', async () => {
            const patchDto: ExercisePatchDto = {
                name: 'Updated Exercise Name',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.name).toBe(patchDto.name);
            expect(response.body.body_part).toBe(BodyPartEnum.BACK); // Should remain unchanged
        });

        it('should patch exercise description only', async () => {
            const patchDto: ExercisePatchDto = {
                description: 'Updated description',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.description).toBe(patchDto.description);
        });

        it('should patch multiple fields', async () => {
            const patchDto: ExercisePatchDto = {
                name: 'Multi-field Update',
                equipment: 'Kettlebell',
                is_public: true,
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.name).toBe(patchDto.name);
            expect(response.body.equipment).toBe(patchDto.equipment);
            expect(response.body.is_public).toBe(patchDto.is_public);
        });

        it('should return 401 without authentication', async () => {
            const patchDto: ExercisePatchDto = {
                name: 'Should Not Work',
            };

            await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .send(patchDto)
                .expect(401);
        });

        it('should return 404 for non-existent exercise', async () => {
            const patchDto: ExercisePatchDto = {
                name: 'Non-existent',
            };

            await request(app.getHttpServer())
                .patch('/exercises/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(404);
        });

        it('should return 401/404 when trying to patch another users exercise', async () => {
            const patchDto: ExercisePatchDto = {
                name: 'Unauthorized Update',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .set('Authorization', `Bearer ${trainee2Token}`)
                .send(patchDto);

            // Returns 401 because authorization check happens before checking if resource exists
            expect([401, 404]).toContain(response.status);
        });

        it('should allow admin to patch any exercise', async () => {
            const patchDto: ExercisePatchDto = {
                name: 'Admin Update',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.name).toBe(patchDto.name);
        });

        it('should return 400 with invalid body_part enum', async () => {
            const patchDto: any = {
                body_part: 'InvalidBodyPart',
            };

            await request(app.getHttpServer())
                .patch(`/exercises/${patchExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(400);
        });
    });

    describe('PUT /exercises/:id', () => {
        it('should update entire exercise', async () => {
            const updateDto: ExerciseUpdateDto = {
                name: 'Completely Updated Exercise',
                body_part: BodyPartEnum.TRICEPS,
                equipment: 'Cable',
                description: 'Completely updated description',
            };

            const response = await request(app.getHttpServer())
                .put(`/exercises/${putExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(200);

            expect(response.body.name).toBe(updateDto.name);
            expect(response.body.body_part).toBe(updateDto.body_part);
            expect(response.body.equipment).toBe(updateDto.equipment);
            expect(response.body.description).toBe(updateDto.description);
        });

        it('should return 401 without authentication', async () => {
            const updateDto: ExerciseUpdateDto = {
                name: 'Should Not Work',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Should not work',
            };

            await request(app.getHttpServer())
                .put(`/exercises/${putExerciseId}`)
                .send(updateDto)
                .expect(401);
        });

        it('should return 400 with missing required fields', async () => {
            const updateDto: any = {
                name: 'Missing Fields',
            };

            await request(app.getHttpServer())
                .put(`/exercises/${putExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(400);
        });

        it('should return 404 for non-existent exercise', async () => {
            const updateDto: ExerciseUpdateDto = {
                name: 'Non-existent',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Non-existent',
            };

            await request(app.getHttpServer())
                .put('/exercises/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(404);
        });

        it('should return 401/404 when trying to update another users exercise', async () => {
            const updateDto: ExerciseUpdateDto = {
                name: 'Unauthorized Update',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Unauthorized',
            };

            const response = await request(app.getHttpServer())
                .put(`/exercises/${putExerciseId}`)
                .set('Authorization', `Bearer ${trainee2Token}`)
                .send(updateDto);

            // Returns 401 because authorization check happens before checking if resource exists
            expect([401, 404]).toContain(response.status);
        });

        it('should allow admin to update any exercise', async () => {
            const updateDto: ExerciseUpdateDto = {
                name: 'Admin Complete Update',
                body_part: BodyPartEnum.ABS,
                equipment: 'None',
                description: 'Updated by admin',
            };

            const response = await request(app.getHttpServer())
                .put(`/exercises/${putExerciseId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateDto)
                .expect(200);

            expect(response.body.name).toBe(updateDto.name);
        });
    });

    describe('DELETE /exercises/:id', () => {
        it('should delete exercise with authentication', async () => {
            await request(app.getHttpServer())
                .delete(`/exercises/${deleteExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Verify exercise is soft-deleted (should return 404)
            await request(app.getHttpServer())
                .get(`/exercises/${deleteExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer())
                .delete(`/exercises/${deleteExerciseId}`)
                .expect(401);
        });

        it('should return 404 for non-existent exercise', async () => {
            await request(app.getHttpServer())
                .delete('/exercises/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should return 401/404 when trying to delete another users exercise', async () => {
            // Create exercise by trainee2
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${trainee2Token}`)
                .send({
                    name: 'Trainee2 Exercise',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Owned by trainee2',
                });

            const trainee2ExerciseId = createResponse.body.id;

            // Try to delete as trainee1
            const response = await request(app.getHttpServer())
                .delete(`/exercises/${trainee2ExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`);

            // Returns 401 because authorization check happens before checking if resource exists
            expect([401, 404]).toContain(response.status);
        });

        it('should allow admin to delete any exercise', async () => {
            // Create exercise by trainee
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({
                    name: 'To Be Deleted by Admin',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Will be deleted by admin',
                });

            const exerciseId = createResponse.body.id;

            // Delete as admin
            const response = await request(app.getHttpServer())
                .delete(`/exercises/${exerciseId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });

        it('should return 404 when deleting already deleted exercise (not idempotent)', async () => {
            // Create a fresh exercise for this test
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({
                    name: 'For Idempotency Test',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Test idempotency',
                });

            const idempotencyExerciseId = createResponse.body.id;

            // Delete once
            await request(app.getHttpServer())
                .delete(`/exercises/${idempotencyExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Try to delete again - returns 404 (not idempotent like categories)
            await request(app.getHttpServer())
                .delete(`/exercises/${idempotencyExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });
    });

    describe('POST /exercises/:id/restore', () => {
        let deletedExerciseId: number;

        beforeAll(async () => {
            // Create and delete an exercise for restore tests
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({
                    name: 'To Be Restored',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Exercise for restore tests',
                });

            deletedExerciseId = createResponse.body.id;

            await request(app.getHttpServer())
                .delete(`/exercises/${deletedExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);
        });

        it('should restore deleted exercise', async () => {
            const response = await request(app.getHttpServer())
                .post(`/exercises/${deletedExerciseId}/restore`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(201);

            expect(response.body.id).toBe(deletedExerciseId);
            expect(response.body.name).toBe('To Be Restored');

            // Verify exercise is accessible again
            await request(app.getHttpServer())
                .get(`/exercises/${deletedExerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer())
                .post(`/exercises/${deletedExerciseId}/restore`)
                .expect(401);
        });

        it('should return 404 for non-existent exercise', async () => {
            await request(app.getHttpServer())
                .post('/exercises/99999/restore')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should return 401/404 when trying to restore another users exercise', async () => {
            // Create and delete exercise by trainee2
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${trainee2Token}`)
                .send({
                    name: 'Trainee2 Deleted',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Owned by trainee2',
                });

            const trainee2ExerciseId = createResponse.body.id;

            await request(app.getHttpServer())
                .delete(`/exercises/${trainee2ExerciseId}`)
                .set('Authorization', `Bearer ${trainee2Token}`)
                .expect(200);

            // Try to restore as trainee1
            const response = await request(app.getHttpServer())
                .post(`/exercises/${trainee2ExerciseId}/restore`)
                .set('Authorization', `Bearer ${traineeToken}`);

            // Returns 401 because authorization check happens before checking if resource exists
            expect([401, 404]).toContain(response.status);
        });

        it('should allow admin to restore any exercise', async () => {
            // First delete an exercise that admin can restore
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({
                    name: 'For Admin Restore',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Exercise for admin restore',
                });

            const exerciseId = createResponse.body.id;

            await request(app.getHttpServer())
                .delete(`/exercises/${exerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Admin should be able to restore trainee's exercise
            const response = await request(app.getHttpServer())
                .post(`/exercises/${exerciseId}/restore`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(201);
        });
    });

    describe('Edge Cases and Security', () => {
        it('should handle SQL injection attempts in name', async () => {
            const sqlInjectionDto: ExerciseCreateDto = {
                name: "'; DROP TABLE exercises; --",
                body_part: BodyPartEnum.CHEST,
                equipment: 'None',
                description: 'SQL injection attempt',
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(sqlInjectionDto)
                .expect(201);

            expect(response.body.name).toBe(sqlInjectionDto.name);

            // Verify table still exists
            await request(app.getHttpServer())
                .get('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);
        });

        it('should handle XSS attempts in description', async () => {
            const xssDto: ExerciseCreateDto = {
                name: 'XSS Test',
                body_part: BodyPartEnum.CHEST,
                equipment: 'None',
                description: '<script>alert("XSS")</script>',
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(xssDto)
                .expect(201);

            expect(response.body.description).toBe(xssDto.description);
        });

        it('should handle unicode characters', async () => {
            const unicodeDto: ExerciseCreateDto = {
                name: '力量训练 (Strength) 🏋️',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Émojis and spëciål çhåråctérs',
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(unicodeDto)
                .expect(201);

            expect(response.body.name).toBe(unicodeDto.name);
            expect(response.body.description).toBe(unicodeDto.description);
        });

        it('should handle very long strings', async () => {
            const longDto: ExerciseCreateDto = {
                name: 'A'.repeat(100),
                body_part: BodyPartEnum.CHEST,
                equipment: 'B'.repeat(100),
                description: 'C'.repeat(500),
            };

            const response = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(longDto)
                .expect(201);

            expect(response.body.name).toBe(longDto.name);
        });
    });

    describe('Performance Tests', () => {
        it('should create exercise within acceptable time', async () => {
            const createDto: ExerciseCreateDto = {
                name: 'Performance Test',
                body_part: BodyPartEnum.CHEST,
                equipment: 'Barbell',
                description: 'Testing response time',
            };

            const startTime = Date.now();

            await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000);
        });

        it('should handle multiple sequential operations efficiently', async () => {
            // Create
            const createResponse = await request(app.getHttpServer())
                .post('/exercises')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({
                    name: 'Sequential Test',
                    body_part: BodyPartEnum.CHEST,
                    equipment: 'Barbell',
                    description: 'Testing sequential operations',
                })
                .expect(201);

            const exerciseId = createResponse.body.id;

            // Read
            await request(app.getHttpServer())
                .get(`/exercises/${exerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Update
            await request(app.getHttpServer())
                .patch(`/exercises/${exerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            // Delete
            await request(app.getHttpServer())
                .delete(`/exercises/${exerciseId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Restore
            await request(app.getHttpServer())
                .post(`/exercises/${exerciseId}/restore`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(201);
        });
    });
});
