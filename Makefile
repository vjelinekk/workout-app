# Default command: start Docker containers
.PHONY: all
all: up

# Start containers in detached mode
.PHONY: up
up:
	docker-compose up -d --build
	@echo "⏳ Waiting for backend to be ready..."
	@sleep 5
	@echo "🔄 Running migrations..."
	docker-compose exec backend npm run migration:run
	@echo "✅ Migrations complete!"
	@echo ""
	@echo "🎉 Docker containers are up! They are running in detached mode."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001"
	@echo "MailHog UI (for email testing - if enabled): http://localhost:8025"
	@echo ""
	@echo "To view logs, run: make logs"
	@echo "To stop containers, run: make down"
	@echo ""

# Stop and remove containers
.PHONY: down
down:
	docker-compose down

# Stop containers and remove volumes
.PHONY: down-v
down-v:
	docker-compose down -v

# Bring everything down and prune dangling volumes
.PHONY: clean
clean: down-v
	docker volume prune -f

# View logs
.PHONY: logs
logs:
	docker-compose logs -f

# Rebuild containers
.PHONY: rebuild
rebuild:
	docker-compose up -d --build --force-recreate

.PHONY: migrate migrate-generate migrate-revert migrate-create

# Run pending migrations
migrate:
	docker-compose exec backend npm run migration:run

# Generate a new migration interactively
migrate-generate:
	@read -p "Enter migration name: " NAME; \
	if [ -z "$$NAME" ]; then \
		echo "Migration name cannot be empty"; \
		exit 1; \
	fi; \
	docker-compose exec backend npm run migration:generate -- ./src/migrations/$$NAME

## Create a new empty migration
migrate-create:
	@read -p "Enter migration name: " NAME; \
	if [ -z "$$NAME" ]; then \
		echo "Migration name cannot be empty"; \
		exit 1; \
	fi; \
	docker-compose exec backend npm run migration:create -- ./src/migrations/$$NAME


# Revert last migration
migrate-revert:
	docker-compose exec backend npm run migration:revert

# Test commands
.PHONY: test-db-up test-db-down test-e2e test-e2e-watch test-e2e-cov

# Start only test database
test-db-up:
	docker-compose up db-test -d
	@echo "✅ Test database is running on port 5433"

# Stop test database
test-db-down:
	docker-compose stop db-test
	@echo "🛑 Test database stopped"

# Run E2E integration tests
test-e2e: test-db-up
	@echo "🧪 Running E2E integration tests..."
	cd backend && npm run test:e2e

# Run E2E tests in watch mode
test-e2e-watch: test-db-up
	@echo "🧪 Running E2E integration tests in watch mode..."
	cd backend && npm run test:e2e:watch

# Run E2E tests with coverage
test-e2e-cov: test-db-up
	@echo "🧪 Running E2E integration tests with coverage..."
	cd backend && npm run test:e2e:cov

# shadcn/ui commands
.PHONY: ui-add ui-install

# Add shadcn/ui component(s) interactively
ui-add:
	@echo "📦 Enter the shadcn/ui components you want to add (space-separated):"; \
	read COMPONENTS; \
	if [ -z "$$COMPONENTS" ]; then \
		echo "❌ No components entered. Aborting."; \
		exit 1; \
	fi; \
	echo "📦 Adding components: $$COMPONENTS"; \
	cd frontend && npx shadcn@latest add $$COMPONENTS; \
	echo "🔄 Installing dependencies in Docker container..."; \
	docker-compose exec frontend npm install; \
	echo "✅ Component(s) added and dependencies installed!"

# Install frontend dependencies in Docker container
ui-install:
	@echo "🔄 Installing frontend dependencies in Docker container..."
	docker-compose exec frontend npm install
	@echo "✅ Dependencies installed!"

