# Integration Tests for Auth Controller

## Overview

This directory contains comprehensive integration tests for the authentication system. These tests use a real PostgreSQL database and actual services (not mocks) to ensure the entire authentication flow works correctly.

## Setup

### 1. Start Test Database

The test database runs on port 5433 to avoid conflicts with the main database:

```bash
# Start only the test database
docker-compose up db-test -d

# Or start all services
docker-compose up -d
```

### 2. Environment Configuration

The tests use `.env.test` for configuration:

```bash
# Test Database
POSTGRES_TEST_HOST=localhost
POSTGRES_TEST_PORT=5433
POSTGRES_TEST_USER=workout_test
POSTGRES_TEST_PASSWORD=workout_test
POSTGRES_TEST_DB=workout_test_db

# JWT Configuration
JWT_SECRET=test-jwt-secret-key-for-integration-tests
JWT_EXPIRES_IN=1h
```

### 3. Install Dependencies

```bash
npm install
```

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Tests in Watch Mode
```bash
npm run test:e2e:watch
```

### Run Tests with Coverage
```bash
npm run test:e2e:cov
```

### Run Specific Test File
```bash
npm run test:e2e -- auth.controller.e2e-spec.ts
```

### Run Specific Test Suite
```bash
npm run test:e2e -- -t "POST /auth/login"
```

### Run with Verbose Output
```bash
npm run test:e2e -- --verbose
```

## Test Architecture

### Test Database Configuration (`test.config.ts`)
- Configures TypeORM for test database
- Uses `synchronize: true` to auto-create schema
- Uses `dropSchema: true` to clean database before tests
- Loads entities automatically

### Test Setup Flow

1. **beforeAll**: 
   - Create NestJS testing module
   - Initialize application with validation pipes
   - Connect to test database
   - Create roles (trainee, admin)
   - Create test users with hashed passwords

2. **Each Test**:
   - Sends HTTP request using `supertest`
   - Validates response status and body
   - Verifies database state if needed

3. **afterAll**:
   - Close database connection
   - Close application

## Key Features

### Real Database Integration
- Tests use actual PostgreSQL database
- Schema is automatically created/dropped
- Tests real database constraints and relations
- Validates actual SQL queries

### Real Service Layer
- No mocked services
- Tests actual business logic
- Validates password hashing with bcrypt
- Tests JWT generation and verification

### Real HTTP Layer
- Uses supertest for HTTP requests
- Tests actual request/response cycle
- Validates request validation pipes
- Tests actual guards and interceptors

### Isolation
- Each test run starts with clean database
- Tests don't affect production data
- Concurrent test execution is prevented (`maxWorkers: 1`)

## Best Practices Implemented

### ✅ Comprehensive Coverage
- Happy path scenarios
- Error scenarios
- Edge cases
- Security tests
- Performance tests

### ✅ Realistic Test Data
- Hashed passwords (bcrypt)
- Valid email formats
- Proper role relationships
- Realistic user data

### ✅ Clear Test Names
- Descriptive test descriptions
- Clear intent in test names
- Grouped by functionality

### ✅ Proper Assertions
- Status code validation
- Response structure validation
- JWT payload validation
- Database state validation

### ✅ Error Handling
- Tests both success and failure
- Validates error messages
- Checks HTTP status codes
- Tests validation errors

### ✅ Performance Considerations
- Tests include performance checks
- Validates response times
- Tests concurrent requests
- Monitors sequential operations

## Troubleshooting

### Database Connection Issues
```bash
# Check if test database is running
docker ps | grep workout-db-test

# View database logs
docker logs workout-db-test

# Restart test database
docker-compose restart db-test
```

### Port Already in Use
```bash
# Kill process using port 5433
lsof -ti:5433 | xargs kill -9

# Or change port in .env.test and docker-compose.yml
```

### Tests Hanging
- Check `testTimeout` in jest-e2e.json (default: 30000ms)
- Ensure database is accessible
- Check for open connections in afterAll hook

### Schema Sync Issues
- Ensure `synchronize: true` in test.config.ts
- Ensure `dropSchema: true` for clean state
- Check entity paths are correct

## Continuous Integration

### GitHub Actions Example
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: workout_test
          POSTGRES_PASSWORD: workout_test
          POSTGRES_DB: workout_test_db
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
```

## Extending Tests

### Adding New Test Cases

1. Add test in appropriate `describe` block:
```typescript
it('should handle new scenario', async () => {
    const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
    };

    const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

    expect(response.body).toHaveProperty('access_token');
});
```

2. Add setup data if needed in `beforeAll` or `beforeEach`

3. Clean up resources in `afterEach` or `afterAll`

### Testing Other Controllers

Use the same pattern:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTestDatabaseConfig } from './test.config';

describe('YourController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot(getTestDatabaseConfig()),
                YourModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should test endpoint', async () => {
        const response = await request(app.getHttpServer())
            .get('/your-endpoint')
            .expect(200);

        expect(response.body).toBeDefined();
    });
});
```

## Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeORM Testing Guide](https://typeorm.io/usage-in-tests)

## Maintenance

### Regular Checks
- [ ] Update test data when schema changes
- [ ] Add tests for new endpoints
- [ ] Update mocks when services change
- [ ] Review and remove obsolete tests
- [ ] Check test coverage remains high

### Performance Monitoring
- Monitor test execution time
- Optimize slow tests
- Consider splitting large test files
- Use test.only() for debugging specific tests
