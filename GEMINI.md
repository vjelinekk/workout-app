# Gemini Project Context: Workout App

This document provides context for the Workout App project to be used in conversations with the Gemini AI assistant.

## Project Overview

The Workout App is a full-stack web application designed for creating and managing workout plans. It consists of a NestJS backend and a Next.js frontend. The application uses a PostgreSQL database for data storage and is fully containerized with Docker.

### Key Technologies

*   **Backend**:
    *   [NestJS](https://nestjs.com/) (TypeScript)
    *   [TypeORM](https://typeorm.io/) for database interaction
    *   [PostgreSQL](https://www.postgresql.org/)
    *   [Passport.js](http://www.passportjs.org/) for authentication (JWT, Google OAuth, Local)
*   **Frontend**:
    *   [Next.js](https.nextjs.org/) (React, TypeScript)
    *   [Tailwind CSS](https://tailwindcss.com/) for styling
    *   [shadcn/ui](https://ui.shadcn.com/) for UI components
    *   [TanStack Query](https://tanstack.com/query/latest) for data fetching
    *   `next-intl` for internationalization
*   **Tooling**:
    *   [Docker](https://www.docker.com/) and Docker Compose
    *   [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code quality
    *   [Jest](https://jestjs.io/) for testing

### Architecture

The application is composed of three main services orchestrated by Docker Compose:

*   `frontend`: The Next.js web application, accessible at `http://localhost:3000`.
*   `backend`: The NestJS API server, accessible at `http://localhost:3001`.
*   `db`: The PostgreSQL database.

A separate `db-test` service is also defined for running backend integration tests.

## Building and Running

The project is managed using a `Makefile` that simplifies common development tasks.

*   **Start the application**:
    ```bash
    make up
    ```
    This will build and start all services in detached mode.

*   **Stop the application**:
    ```bash
    make down
    ```

*   **View logs**:
    ```bash
    make logs
    ```

*   **Run backend E2E tests**:
    ```bash
    make test-e2e
    ```

*   **Manage database migrations**:
    *   Run migrations: `make migrate`
    *   Generate a new migration: `make migrate-generate`
    *   Revert the last migration: `make migrate-revert`

## Development Conventions

### Commit Messages

Commit messages should follow the conventional commit format with one of the following prefixes:

*   `FEATURE`: Adding a new feature, functionality, or module.
*   `FIX`: Bug fixes or corrections.
*   `CHORE`: Project maintenance, tooling, config changes, dependency updates.
*   `STYLE`: Code style changes, formatting, lint fixes.
*   `REFACTOR`: Code restructuring without changing behavior.
*   `TEST`: Adding or updating tests.
*   `DOCS`: Documentation updates.

### Code Style

The project uses ESLint and Prettier to enforce a consistent code style. It is recommended to set up your editor to format on save.

*   **Format backend code**:
    ```bash
    cd backend
    npm run prettier
    ```

*   **Format frontend code**:
    ```bash
    cd frontend
    npm run prettier
    ```

### Frontend UI Components

The frontend uses `shadcn/ui` for its component library. To add new components, use the following command:

```bash
make ui-add
```
