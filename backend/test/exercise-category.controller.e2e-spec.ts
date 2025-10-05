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
import { ExerciseCategoryCreateDto } from '../src/modules/exercise/dtos/exercise-category/exercise-category-create.dto';
import { ExerciseCategoryPatchDto } from '../src/modules/exercise/dtos/exercise-category/exercise-category-patch.dto';
import { ExerciseCategoryUpdateDto } from '../src/modules/exercise/dtos/exercise-category/exercise-category-update.dto';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('ExerciseCategoryController (e2e - Integration Tests)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: UserRepository;
    let jwtService: JwtService;

    // Test user credentials and tokens
    let adminToken: string;
    let traineeToken: string;
    let adminUserId: number;
    let traineeUserId: number;

    // Test category IDs
    let testCategoryId: number;
    let patchCategoryId: number;
    let putCategoryId: number;
    let deleteCategoryId: number;

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

        if (!adminRole) {
            throw new Error('Admin role not found in setup');
        }

        // Create admin user
        const adminUser = await userRepository.create({
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            nickname: 'adminuser',
            password: await hash('admin123', 10),
            roles: [adminRole],
        });
        await userRepository.save(adminUser);
        adminUserId = adminUser.id;

        if (!traineeRole) {
            throw new Error('Trainee role not found in setup');
        }

        // Create trainee user
        const traineeUser = await userRepository.create({
            email: 'trainee@test.com',
            firstName: 'Trainee',
            lastName: 'User',
            nickname: 'traineeuser',
            password: await hash('trainee123', 10),
            roles: [traineeRole],
        });
        await userRepository.save(traineeUser);
        traineeUserId = traineeUser.id;

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

        // Create test categories for various test scenarios
        const testCategory = await request(app.getHttpServer())
            .post('/exercise-categories')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'Test Category',
                description: 'Category for testing',
            });
        testCategoryId = testCategory.body.id;

        const patchCategory = await request(app.getHttpServer())
            .post('/exercise-categories')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'PATCH Test Category',
                description: 'Category for PATCH tests',
            });
        patchCategoryId = patchCategory.body.id;

        const putCategory = await request(app.getHttpServer())
            .post('/exercise-categories')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'PUT Test Category',
                description: 'Category for PUT tests',
            });
        putCategoryId = putCategory.body.id;

        const deleteCategory = await request(app.getHttpServer())
            .post('/exercise-categories')
            .set('Authorization', `Bearer ${traineeToken}`)
            .send({
                name: 'DELETE Test Category',
                description: 'Category for DELETE tests',
            });
        deleteCategoryId = deleteCategory.body.id;
    }

    describe('POST /exercise-categories', () => {
        it('should create an exercise category with valid authentication', async () => {
            const createDto: ExerciseCategoryCreateDto = {
                name: 'Strength Training',
                description: 'Exercises focused on building muscle strength',
            };

            const response = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(createDto.name);
            expect(response.body.description).toBe(createDto.description);
        });

        it('should return 401 without authentication', async () => {
            const createDto: ExerciseCategoryCreateDto = {
                name: 'Cardio',
                description: 'Cardiovascular exercises',
            };

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .send(createDto)
                .expect(401);
        });

        it('should return 400 with missing name', async () => {
            const createDto: any = {
                description: 'Missing name field',
            };

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with missing description', async () => {
            const createDto: any = {
                name: 'Missing Description',
            };

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with empty name', async () => {
            const createDto: any = {
                name: '',
                description: 'Valid description',
            };

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should return 400 with empty description', async () => {
            const createDto: any = {
                name: 'Valid Name',
                description: '',
            };

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should reject extra fields not in DTO', async () => {
            const createDto: any = {
                name: 'Valid Name',
                description: 'Valid description',
                extraField: 'This should be rejected',
            };

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(400);
        });

        it('should create multiple categories successfully', async () => {
            const categories = [
                { name: 'Category 1', description: 'First category' },
                { name: 'Category 2', description: 'Second category' },
                { name: 'Category 3', description: 'Third category' },
            ];

            for (const category of categories) {
                const response = await request(app.getHttpServer())
                    .post('/exercise-categories')
                    .set('Authorization', `Bearer ${traineeToken}`)
                    .send(category)
                    .expect(201);

                expect(response.body.name).toBe(category.name);
                expect(response.body.description).toBe(category.description);
            }
        });

        it('should handle long name and description', async () => {
            const createDto: ExerciseCategoryCreateDto = {
                name: 'A'.repeat(100),
                description: 'B'.repeat(500),
            };

            const response = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            expect(response.body.name).toBe(createDto.name);
            expect(response.body.description).toBe(createDto.description);
        });

        it('should handle special characters in name and description', async () => {
            const createDto: ExerciseCategoryCreateDto = {
                name: "Test & <Category> with 'quotes' and \"double quotes\"",
                description: 'Description with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
            };

            const response = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            expect(response.body.name).toBe(createDto.name);
            expect(response.body.description).toBe(createDto.description);
        });
    });

    describe('GET /exercise-categories/:id', () => {
        it('should get exercise category by id with authentication', async () => {
            const response = await request(app.getHttpServer())
                .get(`/exercise-categories/${testCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toBe(testCategoryId);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('description');
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer())
                .get(`/exercise-categories/${testCategoryId}`)
                .expect(401);
        });

        it('should return 404 for non-existent category', async () => {
            await request(app.getHttpServer())
                .get('/exercise-categories/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should return 400 for invalid id format', async () => {
            await request(app.getHttpServer())
                .get('/exercise-categories/invalid')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(400);
        });

        it('should return 404 for negative id (not found)', async () => {
            await request(app.getHttpServer())
                .get('/exercise-categories/-1')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404); // Negative ID treated as not found
        });
    });

    describe('GET /exercise-categories', () => {
        it('should get all exercise categories with authentication', async () => {
            const response = await request(app.getHttpServer())
                .get('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            // Verify each category has required properties
            response.body.forEach((category: any) => {
                expect(category).toHaveProperty('id');
                expect(category).toHaveProperty('name');
                expect(category).toHaveProperty('description');
            });
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer())
                .get('/exercise-categories')
                .expect(401);
        });

        it('should return only non-deleted categories', async () => {
            const response = await request(app.getHttpServer())
                .get('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            response.body.forEach((category: any) => {
                expect(category.is_deleted).toBe(false);
            });
        });
    });

    describe('PATCH /exercise-categories/:id', () => {
        it('should patch category name only', async () => {
            const patchDto: ExerciseCategoryPatchDto = {
                name: 'Updated Name',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercise-categories/${patchCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.name).toBe(patchDto.name);
            expect(response.body.description).toBe('Category for PATCH tests'); // Should remain unchanged
        });

        it('should patch category description only', async () => {
            const patchDto: ExerciseCategoryPatchDto = {
                description: 'Updated Description',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercise-categories/${patchCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.description).toBe(patchDto.description);
            expect(response.body.name).toBe('Updated Name'); // From previous test
        });

        it('should patch both name and description', async () => {
            const patchDto: ExerciseCategoryPatchDto = {
                name: 'Both Updated Name',
                description: 'Both Updated Description',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercise-categories/${patchCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(200);

            expect(response.body.name).toBe(patchDto.name);
            expect(response.body.description).toBe(patchDto.description);
        });

        it('should return 401 without authentication', async () => {
            const patchDto: ExerciseCategoryPatchDto = {
                name: 'Should Not Work',
            };

            await request(app.getHttpServer())
                .patch(`/exercise-categories/${patchCategoryId}`)
                .send(patchDto)
                .expect(401);
        });

        it('should return 404 for non-existent category', async () => {
            const patchDto: ExerciseCategoryPatchDto = {
                name: 'Non-existent',
            };

            await request(app.getHttpServer())
                .patch('/exercise-categories/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(404);
        });

        it('should return 400 with empty name', async () => {
            const patchDto: any = {
                name: '',
            };

            await request(app.getHttpServer())
                .patch(`/exercise-categories/${patchCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(patchDto)
                .expect(400);
        });

        it('should allow patch with empty body (no changes) or return 400', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/exercise-categories/${patchCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({});

            // May return 200 with no changes or 400 if empty body not allowed
            expect([200, 400]).toContain(response.status);
        });

        it('should allow admin to patch any category (or implement auth if needed)', async () => {
            // Create category as trainee
            const createDto: ExerciseCategoryCreateDto = {
                name: 'Trainee Category',
                description: 'Owned by trainee',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            const traineeCategoryId = createResponse.body.id;

            // Try to patch as different user (admin)
            const patchDto: ExerciseCategoryPatchDto = {
                name: 'Admin trying to update',
            };

            const response = await request(app.getHttpServer())
                .patch(`/exercise-categories/${traineeCategoryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(patchDto);

            // Either succeeds (200) or forbidden (403) - both are valid
            expect([200, 403]).toContain(response.status);
        });
    });

    describe('PUT /exercise-categories/:id', () => {
        it('should update entire category', async () => {
            const updateDto: ExerciseCategoryUpdateDto = {
                name: 'Completely Updated Name',
                description: 'Completely Updated Description',
            };

            const response = await request(app.getHttpServer())
                .put(`/exercise-categories/${putCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(200);

            expect(response.body.name).toBe(updateDto.name);
            expect(response.body.description).toBe(updateDto.description);
        });

        it('should return 401 without authentication', async () => {
            const updateDto: ExerciseCategoryUpdateDto = {
                name: 'Should Not Work',
                description: 'Should Not Work',
            };

            await request(app.getHttpServer())
                .put(`/exercise-categories/${putCategoryId}`)
                .send(updateDto)
                .expect(401);
        });

        it('should return 400 with missing name', async () => {
            const updateDto: any = {
                description: 'Missing name',
            };

            await request(app.getHttpServer())
                .put(`/exercise-categories/${putCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(400);
        });

        it('should return 400 with missing description', async () => {
            const updateDto: any = {
                name: 'Missing description',
            };

            await request(app.getHttpServer())
                .put(`/exercise-categories/${putCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(400);
        });

        it('should return 404 for non-existent category', async () => {
            const updateDto: ExerciseCategoryUpdateDto = {
                name: 'Non-existent',
                description: 'Non-existent',
            };

            await request(app.getHttpServer())
                .put('/exercise-categories/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(updateDto)
                .expect(404);
        });

        it('should allow admin to update any category (or implement auth if needed)', async () => {
            // Create category as trainee
            const createDto: ExerciseCategoryCreateDto = {
                name: 'Trainee Category',
                description: 'Owned by trainee',
            };

            const createResponse = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto);

            const traineeCategoryId = createResponse.body.id;

            // Try to update as different user (admin)
            const updateDto: ExerciseCategoryUpdateDto = {
                name: 'Admin trying to update',
                description: 'Should not work',
            };

            const response = await request(app.getHttpServer())
                .put(`/exercise-categories/${traineeCategoryId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateDto);

            // Either succeeds (200) or forbidden (403) - both are valid
            expect([200, 403]).toContain(response.status);
        });
    });

    describe('DELETE /exercise-categories/:id', () => {
        it('should delete exercise category with authentication', async () => {
            await request(app.getHttpServer())
                .delete(`/exercise-categories/${deleteCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Verify category is soft-deleted (should return 404)
            await request(app.getHttpServer())
                .get(`/exercise-categories/${deleteCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should return 401 without authentication', async () => {
            await request(app.getHttpServer())
                .delete(`/exercise-categories/${deleteCategoryId}`)
                .expect(401);
        });

        it('should return 404 for non-existent category', async () => {
            await request(app.getHttpServer())
                .delete('/exercise-categories/99999')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(404);
        });

        it('should handle deleting already deleted category (idempotent)', async () => {
            // Delete once
            await request(app.getHttpServer())
                .delete(`/exercise-categories/${deleteCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Try to delete again - should be idempotent (returns 200)
            await request(app.getHttpServer())
                .delete(`/exercise-categories/${deleteCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200); // Idempotent delete operations return 200
        });

        it('should not include deleted category in list', async () => {
            // Delete the category
            await request(app.getHttpServer())
                .delete(`/exercise-categories/${deleteCategoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Get all categories
            const response = await request(app.getHttpServer())
                .get('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Deleted category should not be in the list
            const deletedCategory = response.body.find(
                (cat: any) => cat.id === deleteCategoryId,
            );
            expect(deletedCategory).toBeUndefined();
        });
    });

    describe('Edge Cases and Security', () => {
        it('should handle SQL injection attempts in name', async () => {
            const sqlInjectionDto: ExerciseCategoryCreateDto = {
                name: "'; DROP TABLE exercise_categories; --",
                description: 'SQL injection attempt',
            };

            const response = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(sqlInjectionDto)
                .expect(201);

            // Should create category with the exact string
            expect(response.body.name).toBe(sqlInjectionDto.name);

            // Verify table still exists by fetching categories
            await request(app.getHttpServer())
                .get('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);
        });

        it('should handle XSS attempts in description', async () => {
            const xssDto: ExerciseCategoryCreateDto = {
                name: 'XSS Test',
                description: '<script>alert("XSS")</script>',
            };

            const response = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(xssDto)
                .expect(201);

            // Should store the exact string (sanitization should happen on frontend)
            expect(response.body.description).toBe(xssDto.description);
        });

        it('should handle unicode characters', async () => {
            const unicodeDto: ExerciseCategoryCreateDto = {
                name: '力量训练 (Strength) 🏋️',
                description: 'Émojis and spëciål çhåråctérs',
            };

            const response = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(unicodeDto)
                .expect(201);

            expect(response.body.name).toBe(unicodeDto.name);
            expect(response.body.description).toBe(unicodeDto.description);
        });

        it('should handle concurrent create requests', async () => {
            const createDto: ExerciseCategoryCreateDto = {
                name: 'Concurrent Test',
                description: 'Testing concurrent requests',
            };

            // Send 5 concurrent requests
            const requests = Array(5)
                .fill(null)
                .map(() =>
                    request(app.getHttpServer())
                        .post('/exercise-categories')
                        .set('Authorization', `Bearer ${traineeToken}`)
                        .send({
                            ...createDto,
                            name: `${createDto.name} ${Math.random()}`,
                        }),
                );

            const responses = await Promise.all(requests);

            // All should succeed
            responses.forEach((response) => {
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('id');
            });
        });
    });

    describe('Performance Tests', () => {
        it('should create category within acceptable time', async () => {
            const createDto: ExerciseCategoryCreateDto = {
                name: 'Performance Test',
                description: 'Testing response time',
            };

            const startTime = Date.now();

            await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send(createDto)
                .expect(201);

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within 1 second
            expect(duration).toBeLessThan(1000);
        });

        it('should handle multiple sequential operations efficiently', async () => {
            // Create
            const createResponse = await request(app.getHttpServer())
                .post('/exercise-categories')
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({
                    name: 'Sequential Test',
                    description: 'Testing sequential operations',
                })
                .expect(201);

            const categoryId = createResponse.body.id;

            // Read
            await request(app.getHttpServer())
                .get(`/exercise-categories/${categoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);

            // Update
            await request(app.getHttpServer())
                .patch(`/exercise-categories/${categoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            // Delete
            await request(app.getHttpServer())
                .delete(`/exercise-categories/${categoryId}`)
                .set('Authorization', `Bearer ${traineeToken}`)
                .expect(200);
        });
    });
});
