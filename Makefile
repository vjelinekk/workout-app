# Default command: start Docker containers
.PHONY: all
all: up

# Start containers in detached mode
.PHONY: up
up:
	docker-compose up -d --build
	@echo ""
	@echo "🎉 Docker containers are up!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001"
	@echo ""

# Stop and remove containers
.PHONY: down
down:
	docker-compose down

# View logs
.PHONY: logs
logs:
	docker-compose logs -f

# Rebuild containers
.PHONY: rebuild
rebuild:
	docker-compose up -d --build --force-recreate

.PHONY: migrate migrate-generate migrate-revert

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


# Revert last migration
migrate-revert:
	docker-compose exec backend npm run migration:revert
