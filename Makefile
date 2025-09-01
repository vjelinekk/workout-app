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

