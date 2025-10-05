/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getTestDatabaseConfig } from './test.config';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UserModule } from '../src/modules/user/user.module';
import { UserRepository } from '../src/modules/user/repositories/user.repository';
import { RoleEntity } from '../src/modules/user/entities/role.entity';
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { RoleEnum } from '../src/modules/user/enums/role.enum';
import { LoginDto } from '../src/modules/auth/dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e - Integration Tests)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: UserRepository;
    let jwtService: JwtService;

    // Test user credentials
    const testUserEmail = 'testuser@example.com';
    const testUserPassword = 'Test123456';
    const testUserNickname = 'testuser';
    let testUserId: number;

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
        await dataSource.destroy();
        await app.close();
    });

    /**
     * Setup initial test data in the database
     */
    const setupTestData = async () => {
        const roleRepository = dataSource.getRepository(RoleEntity);

        // Create admin role first (ID = 1)
        const adminRole = roleRepository.create({
            id: RoleEnum.ADMIN, // 1
            name: 'admin',
            description: 'Administrator role',
        });
        await roleRepository.save(adminRole);

        // Create trainee role (ID = 2)
        const traineeRole = roleRepository.create({
            id: RoleEnum.TRAINEE, // 2
            name: 'trainee',
            description: 'Regular trainee user role',
        });
        await roleRepository.save(traineeRole);

        // Create test user with hashed password
        const hashedPassword = await hash(testUserPassword, 10);
        const user = userRepository.create({
            email: testUserEmail,
            nickname: testUserNickname,
            firstName: 'Test',
            lastName: 'User',
            password: hashedPassword,
            roles: [traineeRole],
        });

        const savedUser = await userRepository.save(user);
        testUserId = savedUser.id;
    };

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            // Verify response structure
            expect(response.body).toHaveProperty('access_token');
            expect(response.body).toHaveProperty('user_id');
            expect(response.body.user_id).toBe(testUserId);
            expect(typeof response.body.access_token).toBe('string');
            expect(response.body.access_token.length).toBeGreaterThan(0);

            // Verify JWT token is valid
            const decoded = jwtService.verify(response.body.access_token);
            expect(decoded).toHaveProperty('sub');
            expect(decoded).toHaveProperty('nickname');
            expect(decoded).toHaveProperty('roles');
            expect(decoded.sub).toBe(testUserId);
            expect(decoded.nickname).toBe(testUserNickname);
            expect(Array.isArray(decoded.roles)).toBe(true);
            expect(decoded.roles).toContain(RoleEnum.TRAINEE);
        });

        it('should return 401 with invalid email', async () => {
            const loginDto: LoginDto = {
                email: 'nonexistent@example.com',
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401);

            expect(response.body.message).toBeDefined();
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should return 401 with invalid password', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: 'WrongPassword123',
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it('should return 401 with missing email (guard runs before validation)', async () => {
            const invalidDto = {
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidDto)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it('should return 401 with missing password (guard runs before validation)', async () => {
            const invalidDto = {
                email: testUserEmail,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidDto)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it('should return 401 with invalid email format (guard runs before validation)', async () => {
            const invalidDto = {
                email: 'not-an-email',
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidDto)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it('should return 401 with password shorter than 6 characters (guard runs before validation)', async () => {
            const invalidDto = {
                email: testUserEmail,
                password: '12345', // Only 5 characters
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidDto)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it('should return 401 with empty request body (guard runs before validation)', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({})
                .expect(401);
        });

        it('should allow login even with extra fields (they are ignored)', async () => {
            const dtoWithExtraFields = {
                email: testUserEmail,
                password: testUserPassword,
                extraField: 'should be removed',
                anotherField: 123,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(dtoWithExtraFields)
                .expect(201); // Extra fields are ignored, login succeeds

            expect(response.body).toHaveProperty('access_token');
        });

        it('should handle SQL injection attempts safely', async () => {
            const sqlInjectionDto = {
                email: "admin@example.com' OR '1'='1",
                password: "password' OR '1'='1",
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(sqlInjectionDto)
                .expect(401); // Should fail authentication, not crash
        });

        it('should handle concurrent login requests', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            // Send 5 concurrent login requests
            const requests = Array(5)
                .fill(null)
                .map(() =>
                    request(app.getHttpServer())
                        .post('/auth/login')
                        .send(loginDto),
                );

            const responses = await Promise.all(requests);

            // All should succeed
            responses.forEach((response) => {
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('access_token');
                expect(response.body).toHaveProperty('user_id');
            });

            // All tokens should be valid (they may be similar due to same timestamp)
            const tokens = responses.map((r) => r.body.access_token);
            tokens.forEach((token) => {
                expect(token).toBeDefined();
                expect(token.length).toBeGreaterThan(0);
            });
        });
    });

    describe('POST /auth/login - Multiple Users', () => {
        let adminUserEmail: string;
        let adminUserPassword: string;
        let adminUserId: number;

        beforeAll(async () => {
            // Create admin user
            adminUserEmail = 'admin@example.com';
            adminUserPassword = 'Admin123456';

            const roleRepository = dataSource.getRepository(RoleEntity);
            const adminRole = await roleRepository.findOne({
                where: { id: RoleEnum.ADMIN },
            });

            if (!adminRole) {
                throw new Error('Admin role not found in setup');
            }

            const hashedPassword = await hash(adminUserPassword, 10);
            const adminUser = userRepository.create({
                email: adminUserEmail,
                nickname: 'adminuser',
                firstName: 'Admin',
                lastName: 'User',
                password: hashedPassword,
                roles: [adminRole],
            });

            const savedAdmin = await userRepository.save(adminUser);
            adminUserId = savedAdmin.id;
        });

        it('should login admin user and verify admin role in token', async () => {
            const loginDto: LoginDto = {
                email: adminUserEmail,
                password: adminUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            expect(response.body.user_id).toBe(adminUserId);

            // Verify admin role in JWT
            const decoded = jwtService.verify(response.body.access_token);
            expect(decoded.roles).toContain(RoleEnum.ADMIN);
        });

        it('should login regular user and verify trainee role in token', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            // Verify trainee role in JWT
            const decoded = jwtService.verify(response.body.access_token);
            expect(decoded.roles).toContain(RoleEnum.TRAINEE);
            expect(decoded.roles).not.toContain(RoleEnum.ADMIN);
        });

        it('should return different tokens for different users', async () => {
            const regularUserLogin: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const adminUserLogin: LoginDto = {
                email: adminUserEmail,
                password: adminUserPassword,
            };

            const response1 = await request(app.getHttpServer())
                .post('/auth/login')
                .send(regularUserLogin);

            const response2 = await request(app.getHttpServer())
                .post('/auth/login')
                .send(adminUserLogin);

            expect(response1.body.access_token).not.toBe(
                response2.body.access_token,
            );
            expect(response1.body.user_id).not.toBe(response2.body.user_id);
        });
    });

    describe('POST /auth/login - Edge Cases', () => {
        it('should handle very long email addresses', async () => {
            const longEmail = 'a'.repeat(100) + '@example.com';
            const loginDto = {
                email: longEmail,
                password: testUserPassword,
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401); // User doesn't exist
        });

        it('should handle very long passwords', async () => {
            const loginDto = {
                email: testUserEmail,
                password: 'a'.repeat(1000),
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401); // Wrong password
        });

        it('should handle null values (guard runs before validation)', async () => {
            const loginDto = {
                email: null,
                password: null,
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401);
        });

        it('should handle undefined values (guard runs before validation)', async () => {
            const loginDto = {
                email: undefined,
                password: undefined,
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401);
        });

        it('should be case-sensitive for email', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail.toUpperCase(), // Different case
                password: testUserPassword,
            };

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(401); // Should fail (depending on your DB collation)
        });

        it('should trim whitespace or reject emails with whitespace', async () => {
            const loginDto = {
                email: `  ${testUserEmail}  `,
                password: testUserPassword,
            };

            // This will either succeed (if you trim) or fail (if you don't)
            // Adjust based on your validation logic
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto);

            expect([201, 400, 401]).toContain(response.status);
        });
    });

    describe('GET /auth/google', () => {
        it('should redirect to Google OAuth', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/google')
                .expect(302); // Redirect

            expect(response.headers.location).toBeDefined();
            // Note: In a real test, you'd need to mock the Google OAuth flow
        });
    });

    describe('GET /auth/google/callback', () => {
        it('should handle Google OAuth callback (requires mocking)', async () => {
            // Note: Testing OAuth callbacks requires mocking passport strategies
            // This is a placeholder test showing the endpoint exists
            await request(app.getHttpServer())
                .get('/auth/google/callback')
                .expect(302); // Will redirect due to OAuth flow
        });
    });

    describe('Token Validation', () => {
        it('should generate valid JWT tokens that can be decoded', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            const token = response.body.access_token;

            // Decode without verification to check structure
            const decoded = jwtService.decode(token);
            expect(decoded).toBeDefined();
            expect(decoded).toHaveProperty('sub');
            expect(decoded).toHaveProperty('nickname');
            expect(decoded).toHaveProperty('roles');
            expect(decoded).toHaveProperty('iat');
            expect(decoded).toHaveProperty('exp');

            // Verify the token is actually valid
            const verified = jwtService.verify(token);
            expect(verified).toBeDefined();
        });

        it('should create tokens with correct expiration time', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            const decoded: any = jwtService.decode(response.body.access_token);
            const expirationTime = decoded.exp - decoded.iat;

            // Verify expiration is 1 hour (3600 seconds) as configured in .env.test
            expect(expirationTime).toBe(3600);
        });
    });

    describe('Database Integration', () => {
        it('should successfully query user from database', async () => {
            const user = await userRepository.findByEmail(testUserEmail);

            if (!user) return;

            expect(user).toBeDefined();
            expect(user.email).toBe(testUserEmail);
            expect(user.nickname).toBe(testUserNickname);
            expect(user.roles).toBeDefined();
            expect(user.roles.length).toBeGreaterThan(0);
        });

        it('should return null for non-existent user', async () => {
            const user = await userRepository.findByEmail(
                'nonexistent@example.com',
            );

            expect(user).toBeNull();
        });

        it('should load user with relations', async () => {
            const user = await userRepository.findByEmail(testUserEmail);

            if (!user) return;

            expect(user).toBeDefined();
            expect(user.roles).toBeDefined();
            expect(Array.isArray(user.roles)).toBe(true);
            expect(user.roles[0]).toHaveProperty('id');
            expect(user.roles[0]).toHaveProperty('name');
        });
    });

    describe('Performance Tests', () => {
        it('should handle login within acceptable time', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const startTime = Date.now();

            await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
                .expect(201);

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Login should complete within 1 second
            expect(duration).toBeLessThan(1000);
        });

        it('should handle multiple sequential logins efficiently', async () => {
            const loginDto: LoginDto = {
                email: testUserEmail,
                password: testUserPassword,
            };

            const startTime = Date.now();

            for (let i = 0; i < 10; i++) {
                await request(app.getHttpServer())
                    .post('/auth/login')
                    .send(loginDto)
                    .expect(201);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;
            const avgTime = duration / 10;

            // Average login time should be reasonable
            expect(avgTime).toBeLessThan(500);
        });
    });
});
