# Workout Management Application - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Core Features](#core-features)
6. [Requirements Fulfillment](#requirements-fulfillment)
7. [Project Structure](#project-structure)
8. [Database Design](#database-design)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Documentation](#api-documentation)

---

## Project Overview

This is a full-stack workout and fitness management application designed to help trainers and trainees manage workout plans, track exercise progress, and monitor fitness goals. The application supports multi-role access (users, trainers, admins, superadmins), trainer-trainee relationships, and comprehensive workout session logging.

**Primary Use Cases:**
- Trainers can create workout plans and assign them to their trainees
- Users can log their workout sessions with detailed exercise tracking
- Admins can manage public exercise libraries and user accounts
- Real-time progress tracking with previous session data comparison

---

## Quick Start Guide

### Prerequisites
- Docker and Docker Compose installed
- Make utility installed (usually pre-installed on macOS/Linux)

### Starting the Application

```bash
# Start all services (backend, frontend, databases)
make up

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001/v1/
# - Swagger API Docs: http://localhost:3001/api
```

### Other Useful Commands

```bash
make down              # Stop all containers
make logs              # View container logs
make migrate           # Run database migrations
make test-e2e          # Run end-to-end tests
make test-e2e-watch    # Run tests in watch mode
```

### Default Credentials

The application seeds a superadmin, trainee and trainer account on first run:
- superadmin:
  - **Email:** superadmin@example.com
  - **Password:** Check your .env file (SUPERADMIN_PASSWORD)
- trainee:
  - **Email**: trainee@example.com
  - **Password**: trainee123
- trainer:
  - **Email**: trainer@example.com
  - **Password**: trainer123

### Where to Find What

| Feature | Location |
|---------|----------|
| API Documentation | http://localhost:3001/api (Swagger UI) |
| Backend Code | `/backend/src/` |
| Frontend Code | `/frontend/src/` |
| Database Migrations | `/backend/src/migrations/` |
| Tests | `/backend/test/` |
| Environment Config | `.env` files in root, backend, and frontend directories |

---

## System Architecture

### Architectural Pattern

The application implements a **modular layered architecture** with clear separation of concerns:

#### Backend Architecture (NestJS)

The backend follows NestJS's modular architecture pattern with distinct layers:

```
┌─────────────────────────────────────────┐
│         Controllers Layer               │  ← HTTP Request Handling
├─────────────────────────────────────────┤
│         Services Layer                  │  ← Business Logic
├─────────────────────────────────────────┤
│         Repositories Layer              │  ← Data Access
├─────────────────────────────────────────┤
│         Entities Layer                  │  ← Database Models
└─────────────────────────────────────────┘
```

**Layer Responsibilities:**

1. **Controllers Layer** (`/src/modules/*/controllers/`)
   - Handle HTTP requests and responses
   - Input validation using DTOs with class-validator
   - Route definitions and Swagger documentation
   - Authentication and authorization guards

2. **Services Layer** (`/src/modules/*/services/`)
   - Business logic implementation
   - Transaction management
   - Data transformation and mapping
   - Cross-module interactions

3. **Repositories Layer** (`/src/modules/*/repositories/`)
   - Database query abstraction
   - TypeORM interaction
   - Soft delete handling
   - Custom query methods

4. **Entities Layer** (`/src/modules/*/entities/`)
   - Database schema definitions
   - Relationships and constraints
   - TypeORM decorators
   - Data model documentation

**Key Architectural Features:**

- **Service Hierarchy:** Base classes provide reusable CRUD operations
  - `BaseCrudService` → `PublicAuthorizableCrudService` → `ValidatedMappedCrudService`
  - Each layer adds specific functionality (authorization, validation, DTO mapping)

- **Modular Design:** Features organized into independent modules
  - Auth Module (authentication, JWT, Google OAuth)
  - User Module (users, roles, trainer-trainee relationships)
  - Exercise Module (exercises, categories, image uploads)
  - Workout Module (workout plans, sessions, exercise logging)
  - Training Split Module (training splits, split assignments)
  - Mail Module (email notifications)

#### Frontend Architecture (Next.js)

The frontend follows Next.js App Router architecture:

```
┌─────────────────────────────────────────┐
│         Pages/Routes Layer              │  ← App Router (file-based routing)
├─────────────────────────────────────────┤
│         Components Layer                │  ← Reusable UI components
├─────────────────────────────────────────┤
│         Hooks Layer                     │  ← Custom React hooks
├─────────────────────────────────────────┤
│         API Client Layer                │  ← Backend communication
├─────────────────────────────────────────┤
│         State Management                │  ← Context API + TanStack Query
└─────────────────────────────────────────┘
```

**Frontend Organization:**

- `/app/` - Pages, layouts, and routing (Next.js App Router)
- `/components/` - Reusable React components (shadcn/ui)
- `/api/` - API client with typed endpoints
- `/hooks/` - Custom React hooks for data fetching
- `/contexts/` - Global state (AuthContext)
- `/schemas/` - Zod validation schemas

---

## Technology Stack

### Backend
- **Framework:** NestJS 11 (Node.js framework with TypeScript)
- **Database:** PostgreSQL 16 with TypeORM (migrations-based schema management)
- **Authentication:** Passport.js (JWT + Google OAuth2)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI
- **Logging:** Pino (structured JSON logging)
- **Caching:** Redis
- **Email:** Resend API / MailHog (development)

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** TanStack Query (server state) + Context API (auth state)
- **Forms:** React Hook Form + Zod validation
- **Internationalization:** next-intl (English/Czech)
- **Theme:** next-themes (light/dark mode)

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Development:** Make (task automation)
- **Testing:** Jest (unit tests), Supertest (E2E integration tests)

---

## Core Features

### 1. Authentication System
- **JWT-based authentication** with refresh tokens
- **Google OAuth2 login** for seamless sign-in
- **Role-based access control** (USER, TRAINER, ADMIN, SUPERADMIN)
- Protected routes with guards on both backend and frontend
- Token auto-refresh on API calls

### 2. User Management
- User registration and profile management
- Role assignment and management
- **Trainer-trainee relationships**
  - Trainers can have multiple trainees
  - Trainees can have one trainer
  - Relationship approval system

### 3. Exercise Management
- Create, read, update, delete exercises
- Exercise categories (chest, back, legs, etc.)
- Image upload for exercises
- Public exercises (created by admins) visible to all users
- Private exercises (user-created) visible only to creator
- Shared exercises (trainers can share with trainees)

### 4. Training Split Management
- Create custom training splits (e.g., Push/Pull/Legs)
- Define workout days within splits
- Assign splits to users
- Link workout plans to specific split days

### 5. Workout Plan Management
- Create workout session plans (templates)
- Add exercises to plans with sets/reps
- Order exercises in specific sequence
- Plans can be assigned to training split days

### 6. Workout Session Logging
- **Start workout sessions** from plans
- **Real-time progress tracking** with timer
- **Log actual reps and weights** for each set
- **View previous session data** for comparison
- **Complete sessions** with final stats
- Session history and analytics

### 7. Admin Features
- User account management
- Approve/reject trainer applications
- Manage public exercise library
- System configuration

---

## Requirements Fulfillment

### 1. Correct Implementation of Selected Architecture ✓

**Implementation:** Modular layered architecture with NestJS

- **Evidence:** The application implements a clear modular architecture:
  - **Modules:** 6 feature modules (Auth, User, Exercise, Workout, Training Split, Mail)
    - Location: `/backend/src/modules/`
  - **Layers:** Controllers → Services → Repositories → Entities
  - **Example Module Structure:**
    ```
    /modules/workout/
      ├── controllers/         # HTTP layer
      ├── services/           # Business logic layer
      ├── repositories/       # Data access layer
      ├── entities/           # Database models
      ├── dtos/              # Data transfer objects
      └── workout.module.ts  # Module definition
    ```

- **Architectural Patterns Used:**
  - Dependency Injection (NestJS built-in IoC container)
  - Repository Pattern (TypeORM repositories)
  - Service Layer Pattern (business logic abstraction)
  - DTO Pattern (data validation and transformation)

### 2. Correct Separation of Application Layers ✓

**Implementation:** Strict layer separation with single responsibility

- **Evidence:**
  - **Controllers** (`*.controller.ts`): Only handle HTTP requests/responses
    - Example: `workout-session.controller.ts` - routes, validation, guards
    - No business logic in controllers

  - **Services** (`*.service.ts`): Business logic only
    - Example: `workout-session.service.ts` (lines 24-524)
    - Transaction management
    - Data transformation
    - Cross-entity operations

  - **Repositories** (`*.repository.ts`): Data access only
    - Custom query methods
    - Soft delete handling
    - No business logic

  - **Entities** (`*.entity.ts`): Database schema definitions
    - TypeORM decorators
    - Relationships
    - No business logic

- **Base Class Hierarchy for Reusability:**
  - `BaseCrudService` - Basic CRUD operations
  - `PublicAuthorizableCrudService` - Adds authorization checks
  - `ValidatedMappedCrudService` - Adds DTO validation and mapping

### 3. Reasonably Long Methods (50-100 lines) ✓

**Implementation:** Methods are focused and well-scoped

- **Method Design Principles:**
  - Each method has a single, clear responsibility
  - Helper methods extract repeated logic
  - Proper error handling
  - Transaction boundaries clearly defined

### 4. Well-Commented Methods/Functions, Data Models, Attributes ✓

**Implementation:** JSDoc comments on all public methods and entities

- **Evidence:**

  **Service Method Comments:**
  ```typescript
  /**
   * Starts a new workout session for the user.
   * Creates a session, initializes exercises from the selected workout plan,
   * and loads previous session data.
   * Prevents starting a new session while another is in progress.
   * Uses transactions for data consistency.
   *
   * @param dto The workout session creation data including workout plan ID
   * @param userId The ID of the user starting the session
   * @returns Workout session response DTO with exercises and previous session data
   * @throws BadRequestException if a workout session is already in progress
   * @throws NotFoundException if the workout plan does not exist
   */
  async startWorkoutSession(...)
  ```

  **Class-Level Comments:**
  ```typescript
  /**
   * Workout session service for managing user workout sessions and exercise logging.
   * Handles session creation, progress tracking, and completion management.
   * Supports loading previous session data for progress comparison and
   * time synchronization.
   */
  @Injectable()
  export class WorkoutSessionService extends ...
  ```

  **Entity Column Comments:**
  ```typescript
  @Column({
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      comment: 'Timestamp when the entry was created',
  })
  createdAt: Date;
  ```

  **Environment Variable Documentation:**
  - Location: `/backend/src/common/constants/env-keys.ts`
  - Every environment variable has descriptive comments
  - Organized by category (Database, Authentication, Email, Redis, etc.)

### 5. Logs Written Where Appropriate and Structured ✓

**Implementation:** Pino structured logging with proper log levels

- **Evidence:**

  **Logger Configuration:**
  - Location: `main.ts:11, 50`
  - Uses Pino (production-grade JSON logger)
  - Structured log format with metadata

  **Logging in Services:**
  ```typescript
  // workout-session.service.ts
  private readonly logger = new Logger(WorkoutSessionService.name);

  // Informational logs
  this.logger.log(
      `User ${userId} starting workout session for plan ${dto.workoutSessionPlanId}`,
  );

  this.logger.log(
      `Workout session ${workoutSessionId} started successfully for user ${userId}`,
  );
  ```

  **Request Logging:**
  - Location: `/backend/src/common/interceptors/logging.interceptor.ts`
  - Logs every HTTP request with method, URL, and elapsed time
  - Structured format: `{ method, url, elapsed }`

  **Log Levels Used:**
  - `logger.log()` - Informational messages (operation started, completed)
  - `logger.error()` - Error conditions
  - `logger.warn()` - Warning conditions
  - `logger.debug()` - Debug information (when needed)

  **Global Exception Filter:**
  - Location: `/backend/src/common/filters/all-exceptions.filter.ts`
  - Logs all exceptions with full context

### 6. Module Covered with Automated Tests ✓

**Implementation:** Comprehensive E2E integration tests

- **Evidence:**

  **Test Location:** `/backend/test/`
  - `workout-session.controller.e2e-spec.ts`
  - `workout-session-plan.controller.e2e-spec.ts`
  - `auth.controller.e2e-spec.ts`
  - `user.controller.e2e-spec.ts`
  - Additional E2E tests for all major features

  **Workout Session Test Coverage:**
  - **Business logic tests:**
    - Starting a workout session
    - Logging exercise progress
    - Completing a session
    - Loading previous session data
    - Preventing duplicate active sessions

  - **Integration tests:**
    - Database transactions
    - Multi-table operations
    - Authorization checks
    - Data validation

  **Test Infrastructure:**
  - Separate test database (PostgreSQL on port 5433)
  - Test configuration: `test.config.ts`
  - Automated setup/teardown with `run-tests.sh`
  - Jest timeout configured for long-running tests
  - Proper test data seeding

  **Running E2E Tests:**
  ```bash
  ./run-tests.sh         # With automatic database management
  ```

  **Running unit tests:**
  ```bash
  cd backend
  npm run test
  ```

### 7. Configurations Read from Property Files/Environment Variables ✓

**Implementation:** Comprehensive configuration management

- **Evidence:**

  **Environment Variable System:**
  - Location: `/backend/src/common/constants/env-keys.ts`
  - Centralized constants prevent typos
  - IDE autocomplete support
  - Organized by category:
    - Database (POSTGRES_HOST, POSTGRES_PORT, etc.)
    - Application (PORT, CORS_ORIGINS, FRONTEND_URL)
    - Authentication (JWT_SECRET, GOOGLE_CLIENT_ID, etc.)
    - Email (EMAIL_PROVIDER, RESEND_API_KEY, etc.)
    - Redis (REDIS_HOST, REDIS_PORT)
    - File Upload (IMAGE_UPLOAD_PATH)

  **Configuration Module:**
  - Location: `app.module.ts:24-26`
  ```typescript
  ConfigModule.forRoot({
      isGlobal: true,  // Available everywhere
  })
  ```

  **Usage Example:**
  ```typescript
  // app.module.ts:27-39
  TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get<string>(ENV_POSTGRES_HOST),
          port: configService.get<number>(ENV_POSTGRES_PORT),
          username: configService.get<string>(ENV_POSTGRES_USER),
          password: configService.get<string>(ENV_POSTGRES_PASSWORD),
          database: configService.get<string>(ENV_POSTGRES_DB),
          ...
      }),
  })
  ```

  **Configuration Files:**
  - `.env` - Main environment variables (not committed)
  - `.env.example` - Template with all variables
  - `.env.test` - Test environment configuration
  - Property files loaded automatically by ConfigService

  **No Hard-Coded Values:**
  - All sensitive data from environment
  - Port numbers configurable
  - Database credentials from .env
  - API keys from environment
  - Feature flags from config

---

## Project Structure

### Backend Structure (`/backend/src/`)

```
backend/src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── data-source.ts               # TypeORM configuration
├── migrations/                  # Database migrations
├── common/                      # Shared utilities
│   ├── constants/              # Environment variable keys
│   ├── entities/               # Base entity classes
│   │   ├── base.entity.ts     # id, timestamps, soft delete
│   │   └── auditable.entity.ts # + createdBy, updatedBy
│   ├── repositories/           # Base repository classes
│   ├── services/               # Base service classes
│   ├── filters/                # Exception filters
│   ├── interceptors/           # Logging, transformation
│   ├── guards/                 # Authentication guards
│   └── redis/                  # Redis caching module
└── modules/                     # Feature modules
    ├── auth/                   # Authentication & authorization
    │   ├── controllers/
    │   ├── services/
    │   ├── strategies/         # Passport strategies (JWT, Google)
    │   ├── guards/             # Auth guards
    │   └── decorators/         # Custom decorators
    ├── user/                   # User management
    │   ├── controllers/        # user.controller, trainer-trainee.controller
    │   ├── services/
    │   ├── repositories/
    │   ├── entities/           # user.entity, role.entity
    │   └── dtos/
    ├── exercise/               # Exercise management
    │   ├── controllers/        # exercise.controller, category.controller
    │   ├── services/
    │   ├── repositories/
    │   ├── entities/
    │   └── dtos/
    ├── workout/                # Workout session management
    │   ├── controllers/        # 3 controllers (session, plan, plan-exercise)
    │   ├── services/
    │   ├── repositories/
    │   ├── entities/           # workout-session.entity, etc.
    │   └── dtos/
    ├── training-split/         # Training split management
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── entities/
    │   └── dtos/
    └── mail/                   # Email notifications
        ├── services/
        └── templates/
```

### Frontend Structure (`/frontend/src/`)

```
frontend/src/
├── app/                         # Next.js App Router
│   ├── (auth)/                 # Auth routes (login, register)
│   ├── (dashboard)/            # Protected dashboard routes
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects based on auth)
├── components/                  # UI components
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Layout components (navbar, sidebar)
│   ├── forms/                  # Form components
│   └── ...                     # Feature-specific components
├── api/                         # API client
│   ├── client.ts               # Axios instance with interceptors
│   ├── endpoints/              # API endpoint definitions
│   └── services/               # API service classes
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useWorkouts.ts
│   └── ...
├── contexts/                    # React contexts
│   └── AuthContext.tsx         # Global auth state
├── schemas/                     # Zod validation schemas
├── types/                       # TypeScript type definitions
├── constants/                   # App constants
├── utils/                       # Utility functions
└── messages/                    # i18n translations
    ├── en.json                 # English
    └── cs.json                 # Czech
```

---

## Database Design

### Key Entities and Relationships

```
User ←──→ Role (many-to-many)
User ──→ TrainerTrainee ←── User (self-referential)
User ──→ Exercise (one-to-many, creator)
User ──→ TrainingSplit (one-to-many, creator)
User ──→ WorkoutSession (one-to-many, performer)

Exercise ──→ ExerciseCategory (many-to-one)
TrainingSplit ──→ TrainingSplitDay (one-to-many)
TrainingSplitDay ──→ WorkoutSessionPlan (one-to-many)
WorkoutSessionPlan ──→ WorkoutSessionPlanExercise (one-to-many)
WorkoutSessionPlan ──→ WorkoutSession (one-to-many)
WorkoutSession ──→ WorkoutSessionExercise (one-to-many)
WorkoutSessionExercise ──→ Exercise (many-to-one)
```

### Base Entity Pattern

All entities extend `BaseEntity` which provides:
- `id` (auto-increment primary key)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `isDeleted` (soft delete flag)

Auditable entities also extend `AuditableEntity` which adds:
- `createdById` (foreign key to User)
- `updatedById` (foreign key to User)

### Migration-Based Schema Management

- **Never use TypeORM synchronize:true**
- All schema changes via migrations
- Migration files in `/backend/src/migrations/`
- Generate migrations: `npm run migration:generate -- MigrationName`
- Run migrations: `npm run migration:run` or `make migrate`

---

## Authentication & Authorization

### Authentication Flow

1. **Login/Register:**
   - User submits credentials
   - Backend validates and generates JWT
   - Frontend stores token in localStorage
   - AuthContext updates global state

2. **Google OAuth:**
   - User clicks "Login with Google"
   - Redirected to Google consent screen
   - Callback to backend with authorization code
   - Backend exchanges code for user info
   - JWT generated and returned to frontend

3. **Protected Requests:**
   - Axios interceptor adds `Authorization: Bearer <token>` header
   - Backend JwtAuthGuard validates token
   - User object attached to request
   - Controllers access via `@JwtUser()` decorator

4. **Token Expiry:**
   - 401 response triggers auto-logout
   - User redirected to login page
   - Token cleared from storage

### Authorization Levels

1. **Public Routes:**
   - Decorated with `@Public()`
   - No authentication required
   - Examples: login, register, health check

2. **Authenticated Routes:**
   - Default for all routes (global JwtAuthGuard)
   - Requires valid JWT token
   - User must be logged in

3. **Role-Based Routes:**
   - Decorated with `@Roles(RoleEnum.ADMIN, ...)`
   - Requires specific roles
   - Examples: admin user management, trainer features

4. **Resource-Based Authorization:**
   - Services check ownership/access
   - Public resources (visible to all)
   - Private resources (owner only)
   - Shared resources (trainer-trainee relationship)

### Role Hierarchy

- **ADMIN:** Full system access, manage users, approve trainers, manage public exercises
- **TRAINER:** Create workout plans, manage trainees, share resources
- **TRAINEE:** Log workouts, view own data, use shared resources

---

## API Documentation

### Base URL

- **Local Development:** `http://localhost:3001/v1/`
- **Swagger UI:** `http://localhost:3001/api`

### Main Endpoints

#### Authentication (`/v1/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/exchange-code` - Exchange auth code for token

#### Users (`/v1/users`)
- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin only)

#### Exercises (`/v1/exercises`)
- `GET /exercises` - List all exercises
- `POST /exercises` - Create exercise
- `GET /exercises/:id` - Get exercise by ID
- `PATCH /exercises/:id` - Update exercise
- `DELETE /exercises/:id` - Delete exercise
- `POST /exercises/:id/image` - Upload exercise image

#### Workout Sessions (`/v1/workout-sessions`)
- `POST /workout-sessions/start` - Start new workout session
- `GET /workout-sessions/in-progress` - Get active session
- `GET /workout-sessions/:id` - Get session by ID
- `POST /workout-sessions/:id/log` - Log exercise progress
- `POST /workout-sessions/:id/finish` - Complete session
- `POST /workout-sessions/sync-time` - Sync session timer

#### Workout Plans (`/v1/workout-session-plans`)
- `GET /workout-session-plans` - List workout plans
- `POST /workout-session-plans` - Create workout plan
- `GET /workout-session-plans/:id` - Get plan by ID
- `PATCH /workout-session-plans/:id` - Update plan
- `DELETE /workout-session-plans/:id` - Delete plan

#### Training Splits (`/v1/training-splits`)
- `GET /training-splits` - List training splits
- `POST /training-splits` - Create training split
- `GET /training-splits/:id` - Get split by ID
- `PATCH /training-splits/:id` - Update split
- `DELETE /training-splits/:id` - Delete split

### Request/Response Format

All endpoints use JSON format and follow RESTful conventions:

**Success Response:**
```json
{
  "id": 1,
  "name": "Bench Press",
  "description": "...",
  "createdAt": "2024-11-29T10:00:00Z"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Authentication Header

Protected endpoints require JWT token:
```
Authorization: Bearer <your-jwt-token>
```

---

## Development Notes

### Environment Setup

1. Copy `.env.example` to `.env` and fill in values
2. Ensure Docker is running
3. Run `make up` to start all services
4. Database migrations run automatically on startup

### Database Migrations

**Create a new migration:**
```bash
cd backend
npm run migration:generate -- AddUserProfile
```

**Run pending migrations:**
```bash
make migrate
# OR
cd backend
npm run migration:run
```

**Revert last migration:**
```bash
cd backend
npm run migration:revert
```

### Testing

**Run all E2E tests:**
```bash
make test-e2e
```

**Run tests in watch mode:**
```bash
make test-e2e-watch
```

**Run specific test file:**
```bash
cd backend
npm test -- workout-session.controller.e2e-spec.ts
```

### Code Quality

**Linting:**
```bash
cd frontend
npm run eslint

cd backend
npm run lint
```

**Formatting:**
```bash
cd frontend
npm run prettier
```

---

## Conclusion

This workout management application demonstrates professional full-stack development practices with:

- **Clean architecture** with modular design and clear layer separation
- **Comprehensive documentation** at code, API, and project levels
- **Robust testing** with integration tests covering core business logic
- **Production-ready features** including authentication, authorization, logging, and configuration management
- **Modern technology stack** with TypeScript, NestJS, Next.js, and PostgreSQL
- **Developer-friendly** with Docker, Make commands, and comprehensive API documentation

All specified requirements have been fulfilled with concrete implementations and evidence provided in this documentation.
