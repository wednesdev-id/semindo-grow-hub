# Docker Setup Guide - Semindo Platform

Panduan lengkap untuk menjalankan Semindo Platform menggunakan Docker.

## 📋 Prerequisites

- Docker Desktop atau Docker Engine (v20.10+)
- Docker Compose (v2.0+)
- Make (optional, untuk shortcuts)
- 4GB RAM minimum
- 10GB disk space

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy template environment
cp .env.example .env

# Edit .env and customize
# For Docker: change DATABASE_URL localhost to 'db'
nano .env
```

### 2. Start Development Environment

```bash
# Menggunakan manage.sh
./manage.sh docker-dev

# Atau menggunakan Makefile
make dev

# Atau langsung docker-compose dengan profile
docker-compose --profile dev up -d
```

### 3. Access Services

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Adminer (Database UI)**: http://localhost:8081

### 4. View Logs

```bash
./manage.sh docker-logs
# Atau
make dev-logs
```

## 📦 Available Commands

### Using manage.sh

```bash
# Development
./manage.sh docker-dev      # Start development environment
./manage.sh docker-stop     # Stop all containers
./manage.sh docker-logs     # View logs

# Production
./manage.sh docker-prod     # Start production environment
./manage.sh docker-build    # Build production images

# Database
./manage.sh db-migrate      # Run migrations
./manage.sh db-seed         # Seed database
./manage.sh db-reset        # Reset database (⚠️ deletes all data)

# Cleanup
./manage.sh docker-clean    # Remove all containers and volumes
```

### Using Makefile

```bash
# Development
make dev                # Start dev environment
make dev-down           # Stop dev environment
make dev-logs           # View dev logs

# Production
make prod               # Start production
make prod-build         # Build production images

# Database
make migrate            # Run migrations
make seed               # Seed database
make db-reset           # Reset database

# Testing
make test               # Run all tests
make test-backend       # Run backend tests
make test-frontend      # Run frontend tests

# Utilities
make shell-backend      # SSH into backend container
make shell-frontend     # SSH into frontend container
make shell-db           # PostgreSQL shell
make health             # Check service health
make backup             # Backup database
make logs               # View all logs

# Cleanup
make clean              # Remove containers, volumes, images
make clean-volumes      # Remove volumes only
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Network                    │
│  (semindo-network / semindo-dev-network)    │
│                                              │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   Frontend   │  │   Backend    │        │
│  │  (Nginx/Vite)│  │   (Node.js)  │        │
│  │   Port 8080  │  │   Port 3000  │        │
│  └──────────────┘  └──────────────┘        │
│         │                  │                 │
│         │                  │                 │
│         │          ┌───────┴────────┐       │
│         │          │   PostgreSQL   │       │
│         │          │    Port 5432   │       │
│         │          └────────────────┘       │
│         │                                    │
│         │          ┌────────────────┐       │
│         └──────────┤    Adminer     │       │
│                    │   Port 8081    │       │
│                    └────────────────┘       │
└─────────────────────────────────────────────┘
```

**Key Features:**
- **Unified Dockerfile**: Single Dockerfile dengan multi-stage builds
- **Build Targets**: Development & Production dalam satu file
- **Unified Compose**: Single docker-compose.yml dengan profiles
- **Hot-reload**: Volume mounting untuk development
- **Optimized**: Production builds dengan minimal image size

## 🔧 Configuration

### Docker Compose Profiles

**Development Mode:**
```bash
docker-compose --profile dev up -d
```

**Production Mode:**
```bash
docker-compose --profile prod up -d
```

### Environment Variables (.env)

```bash
# Database
DB_USER=semindo
DB_PASSWORD=strong_password_here
DB_NAME=semindo_db
DB_PORT=5432

# Backend
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
BACKEND_PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000/api/v1
FRONTEND_PORT=8080

# Adminer
ADMINER_PORT=8081
```

### Custom Ports

Edit `docker-compose.yml` atau `docker-compose.dev.yml`:

```yaml
services:
  frontend:
    ports:
      - "9000:80"  # Change 9000 to your preferred port
```

## 🔍 Development vs Production

**Unified Dockerfile Approach:**
- Single Dockerfile dengan multi-stage builds
- `target: development` untuk dev environment
- `target: production` untuk prod environment

### Development Mode
- **Docker Compose**: `docker-compose.dev.yml`
- **Build Target**: `development`
- **Features**:
  - Volume mounting untuk hot-reload
  - ts-node untuk backend
  - Vite dev server untuk frontend
  - Source maps enabled
  - Debug logging
  - Node modules di container (faster)

### Production Mode
- **Docker Compose**: `docker-compose.yml`
- **Build Target**: `production`
- **Features**:
  - Multi-stage builds
  - Optimized images
  - Nginx untuk serving frontend
  - Compiled JavaScript
  - Minimal image size
  - Health checks
  - Non-root user (security)

## 🗃️ Database Management

### Run Migrations

```bash
make migrate
# Atau
docker-compose exec backend npx prisma migrate deploy
```

### Create New Migration

```bash
make migrate-create
# Atau
docker-compose exec backend npx prisma migrate dev --name your_migration_name
```

### Seed Database

```bash
make seed
# Atau
docker-compose exec backend npx prisma db seed
```

### Backup Database

```bash
make backup
# Atau
mkdir -p backups
docker-compose exec -T db pg_dump -U semindo semindo_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
make restore
# Follow prompts to select backup file
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use manage.sh to clean ports
./manage.sh docker-stop
```

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
make dev-build
# Atau
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Database Connection Failed

```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Clear Everything and Start Fresh

```bash
# Stop all containers
make down

# Remove all volumes and images
make clean

# Rebuild from scratch
make dev-build
make dev
```

## 📊 Health Checks

Check service health:

```bash
# Using Makefile
make health

# Using curl
curl http://localhost:3000/api/v1/health
curl http://localhost:8080
```

## 🔒 Security Notes

1. **Change default passwords** in `.env` before production
2. **JWT_SECRET** harus strong random string (gunakan password generator)
3. **Never commit** `.env` file to version control
4. **Use secrets management** untuk production (Docker secrets, Kubernetes secrets, etc.)
5. **Enable HTTPS** untuk production deployment

## 📝 Logs

### View All Logs

```bash
make logs
# Atau
docker-compose logs -f
```

### View Specific Service

```bash
make logs-backend
make logs-frontend
make logs-db
```

### Save Logs to File

```bash
docker-compose logs > logs/docker_$(date +%Y%m%d_%H%M%S).log
```

## 🚢 Deployment

### Build Production Images

```bash
make prod-build
```

### Push to Registry

```bash
# Tag images
docker tag semindo-frontend:latest your-registry/semindo-frontend:v1.0.0
docker tag semindo-backend:latest your-registry/semindo-backend:v1.0.0

# Push to registry
docker push your-registry/semindo-frontend:v1.0.0
docker push your-registry/semindo-backend:v1.0.0
```

### Deploy to Server

```bash
# SSH to server
ssh user@your-server

# Pull images
docker-compose pull

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

## 🧹 Maintenance

### Update Dependencies

```bash
make update-deps
```

### Prune Docker System

```bash
make docker-prune
# Atau
docker system prune -af --volumes
```

### Monitor Resource Usage

```bash
docker stats
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 💡 Tips

1. **Use .dockerignore** to exclude unnecessary files from build context
2. **Multi-stage builds** reduce final image size significantly
3. **Layer caching** speeds up builds - order Dockerfile commands wisely
4. **Health checks** ensure containers are actually ready, not just running
5. **Named volumes** persist data across container restarts
6. **Networks** isolate services and improve security

## 🆘 Need Help?

1. Check container logs: `make logs`
2. Check service health: `make health`
3. Verify environment variables: `cat .env`
4. Ensure ports are not in use: `lsof -i :8080`
5. Rebuild from scratch if needed: `make clean && make dev-build && make dev`
