.PHONY: help build up down restart logs clean dev prod migrate seed shell-backend shell-frontend shell-db test

# Default target
help:
	@echo "Semindo Project - Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make build          - Build all Docker images"
	@echo "  make up             - Start all services (production)"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make clean          - Remove all containers, volumes, and images"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development environment with hot-reload"
	@echo "  make dev-build      - Build development images"
	@echo "  make dev-down       - Stop development environment"
	@echo "  make dev-logs       - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod           - Start production environment"
	@echo "  make prod-build     - Build production images"
	@echo ""
	@echo "Database:"
	@echo "  make migrate        - Run database migrations"
	@echo "  make migrate-create - Create a new migration"
	@echo "  make seed           - Seed the database"
	@echo "  make db-reset       - Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make shell-db       - Open PostgreSQL shell"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linters"

# Build images
build:
	docker-compose --profile prod build

dev-build:
	docker-compose --profile dev build

prod-build:
	docker-compose --profile prod build --no-cache

# Start services
up:
	docker-compose --profile prod up -d
	@echo "✅ Production environment started"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend: http://localhost:3000"
	@echo "Adminer: http://localhost:8081"

dev:
	docker-compose --profile dev up -d
	@echo "✅ Development environment started with hot-reload"
	@echo "Frontend: http://localhost:8080"
	@echo "Backend: http://localhost:3000"
	@echo "Adminer: http://localhost:8081"

prod:
	docker-compose --profile prod up -d
	@echo "✅ Production environment started"

# Stop services
down:
	docker-compose --profile dev --profile prod down

dev-down:
	docker-compose --profile dev down

# Restart services
restart:
	docker-compose --profile prod restart

dev-restart:
	docker-compose --profile dev restart

# View logs
logs:
	docker-compose logs -f

dev-logs:
	docker-compose --profile dev logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

# Clean up
clean:
	docker-compose down -v --rmi all
	@echo "✅ Cleaned up all containers, volumes, and images"

clean-volumes:
	docker-compose down -v
	@echo "✅ Cleaned up all volumes"

# Database operations
migrate:
	docker-compose exec backend npx prisma migrate deploy
	@echo "✅ Migrations applied"

migrate-dev:
	docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

migrate-create:
	@read -p "Enter migration name: " name; \
	docker-compose exec backend npx prisma migrate dev --name $$name --create-only
	@echo "✅ Migration created"

seed:
	docker-compose exec backend npx prisma db seed
	@echo "✅ Database seeded"

db-reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose exec backend npx prisma migrate reset --force; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Cancelled"; \
	fi

# Shell access
shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

shell-db:
	docker-compose exec db psql -U semindo -d semindo_db

# Testing
test:
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

test-backend:
	docker-compose exec backend npm test

test-frontend:
	docker-compose exec frontend npm test

# Linting
lint:
	docker-compose exec backend npm run lint
	docker-compose exec frontend npm run lint

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:3000/api/v1/health || echo "Backend: ❌ Not healthy"
	@curl -f http://localhost:8080 || echo "Frontend: ❌ Not healthy"
	@docker-compose ps

# Backup database
backup:
	@mkdir -p ./backups
	@docker-compose exec -T db pg_dump -U semindo semindo_db > ./backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backed up to ./backups/"

# Restore database
restore:
	@ls -1 ./backups/*.sql
	@read -p "Enter backup file name: " file; \
	docker-compose exec -T db psql -U semindo semindo_db < ./backups/$$file
	@echo "✅ Database restored"

# Update dependencies
update-deps:
	docker-compose exec backend npm update
	docker-compose exec frontend npm update
	@echo "✅ Dependencies updated"

# Prune Docker system
docker-prune:
	docker system prune -af --volumes
	@echo "✅ Docker system pruned"
