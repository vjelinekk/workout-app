# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack workout/fitness management application with separate backend (NestJS) and frontend (Next.js) in a monorepo structure. The system supports trainer-trainee relationships, workout planning, exercise management, and session logging.

## Technology Stack

**Backend:** NestJS 11, TypeORM, PostgreSQL 16, Passport.js (JWT + Google OAuth), Swagger
**Frontend:** Next.js 15 (App Router), React 19, TanStack Query, Tailwind CSS, shadcn/ui, next-intl
**Infrastructure:** Docker, Docker Compose, Make

## Development Commands

### Starting the Application
```bash
make up              # Start all Docker containers (backend, frontend, databases)
make down            # Stop all containers
make logs            # View container logs
```

### Backend Development (in /backend)
```bash
npm run start:dev    # Development mode with hot reload (runs on port 3001)
npm run build        # Build for production
npm run start:prod   # Run production build
```

### Frontend Development (in /frontend)
```bash
npm run dev          # Development mode with Turbopack (runs on port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run eslint       # Lint code
npm run prettier     # Format code
```

### Database Management
```bash
make migrate                          # Run all pending migrations
npm run migration:generate -- <name>  # Generate new migration (from /backend)
npm run migration:run                 # Run migrations (from /backend)
```

### Testing
```bash
make test-e2e          # Run all E2E tests with test database
make test-e2e-watch    # Run tests in watch mode
./run-tests.sh         # Run tests with automatic database setup/cleanup
npm run test           # Unit tests (from /backend)
```

### UI Development
```bash
make ui-add COMPONENT=<name>  # Add shadcn/ui component to frontend
```

## Architecture

### Backend (/backend)

**NestJS modular architecture:**
- `/src/modules/` - Feature modules (auth, user, exercise, workout, training-split, mail)
- `/src/common/` - Shared base classes, repositories, services, filters, interceptors
- `/src/migrations/` - TypeORM database migrations
- `/test/` - E2E integration tests

**Entry point:** `/src/main.ts` - API runs on port 3001, base path `/v1/`
**API docs:** `http://localhost:3001/api` (Swagger UI)

**Key patterns:**
- **Base entities:** All entities extend `BaseEntity` (id, timestamps, soft delete) or `AuditableEntity` (adds createdBy/updatedBy)
- **Service hierarchy:** Custom CRUD services (BaseCrudService → PublicAuthorizableCrudService → ValidatedMappedCrudService)
- **Repository pattern:** TypeORM repositories with soft delete support
- **Migrations-based schema:** Never use synchronize:true, all changes via migrations

### Frontend (/frontend)

**Next.js App Router structure:**
- `/src/app/` - Pages and layouts (file-based routing)
- `/src/components/` - Reusable React components
- `/src/api/` - API client with endpoints and services
- `/src/hooks/` - Custom React hooks
- `/src/contexts/` - React contexts (AuthContext for global auth state)
- `/src/schemas/` - Zod validation schemas
- `/messages/` - i18n translation files (en.json, cs.json)

**Key patterns:**
- **API integration:** Centralized axios instance with interceptors
- **State management:** TanStack Query for server state, React Context for auth
- **Forms:** React Hook Form + Zod validation
- **Protected routes:** ProtectedRoute component checks authentication
- **Theme:** next-themes with dark mode support
- **i18n:** next-intl for English/Czech translations

### Authentication & Authorization

**Backend:**
- JWT-based auth with Passport strategies (Local, JWT, Google OAuth2)
- Global JwtAuthGuard protects all routes by default
- `@Public()` decorator for unprotected endpoints
- Role-based access control (USER, TRAINER, ADMIN, SUPERADMIN)
- `@Roles()` decorator for role restrictions
- Custom decorators: `@JwtUser()`, `@AuthenticatedUser()`

**Frontend:**
- AuthContext/AuthProvider for global auth state
- ProtectedRoute component for route protection
- Token stored in localStorage
- Axios interceptor adds Bearer token
- 401 responses trigger automatic logout

**Resource scoping:**
- Public resources (created by admins/superadmins, visible to all)
- Private resources (visible only to creator)
- Shared resources (trainers can share with their trainees)

### Database

**TypeORM configuration:** `/backend/src/data-source.ts`
- Always use migrations for schema changes
- Soft delete pattern: check `isDeleted` flag in queries
- Audit trail: `createdBy`/`updatedBy` fields on auditable entities

**Key entities:**
- User ↔ Role (many-to-many)
- Exercise → ExerciseCategory
- TrainingSplit → TrainingSplitDay
- TrainingSplitAssignment (links splits to users)
- WorkoutSessionPlan → WorkoutSessionPlanExercise
- WorkoutSession → WorkoutSessionExercise
- TrainerTrainee (trainer-trainee relationships)

## API Structure

RESTful API at `/v1/<resource>`:
- `/v1/auth` - login, register, google oauth, token exchange
- `/v1/users` - user management
- `/v1/exercises` - exercise CRUD + image upload
- `/v1/exercise-categories` - category management
- `/v1/training-splits` - workout split management
- `/v1/training-split-days` - day-level management
- `/v1/training-split-assignments` - assignment management
- `/v1/workout-session-plans` - workout plan templates
- `/v1/workout-sessions` - actual workout session logging
- `/v1/trainer-trainee` - trainer/trainee relationships

All endpoints:
- Use DTOs with class-validator for validation
- Have Swagger documentation
- Follow REST conventions
- Return appropriate HTTP status codes

## Commit Convention

Use these prefixes (from README.md):
- **FEATURE** - New feature, functionality, or module
- **FIX** - Bug fixes or corrections
- **CHORE** - Maintenance, tooling, config, dependencies
- **STYLE** - Code style, formatting, lint fixes (no logic changes)
- **REFACTOR** - Code restructuring without behavior changes
- **TEST** - Adding or updating tests
- **DOCS** - Documentation updates

## Important Notes

1. **Backend runs on port 3001**, frontend on port 3000
2. **Test database** runs on port 5433 (dev database on 5432)
3. **File uploads** go to `/backend/public/uploads/`
4. **Always read environment variables** from .env files (not committed)
5. **Soft deletes:** Never hard delete entities, set `isDeleted = true`
6. **Role hierarchy:** SUPERADMIN > ADMIN > TRAINER > USER
7. **Multi-tenancy:** Trainers can have multiple trainees and share resources
8. **i18n keys:** Keep frontend messages in sync with /messages/*.json files
9. **Migrations:** Always generate migrations for schema changes, never modify existing migrations
10. **E2E tests:** Use separate test database, clean up after tests
