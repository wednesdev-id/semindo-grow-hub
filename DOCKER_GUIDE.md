# Docker Compose - Quick Reference

## Starting Services

### Development Mode
```bash
# Start all development services
docker-compose --profile dev up

# Start with rebuild
docker-compose --profile dev up --build

# Start in detached mode
docker-compose --profile dev up -d
```

### Production Mode
```bash
# Start all production services
docker-compose --profile prod up

# Start with rebuild
docker-compose --profile prod up --build
```

## Stopping Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

## Checking Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend-dev
docker-compose logs -f frontend-dev
```

## Service URLs

### Development Mode
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Health**: http://localhost:8000/api/v1/health
- **Database (Adminer)**: http://localhost:8081
  - System: PostgreSQL
  - Server: db
  - Username: semindo
  - Password: semindo_password
  - Database: semindo_db

### Production Mode
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8000
- **Database (Adminer)**: http://localhost:8081

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or stop local dev server
pkill -f "manage.sh dev"
```

### Rebuild After Changes
```bash
# Rebuild specific service
docker-compose build backend

# Rebuild all services
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Database Issues
```bash
# Reset database (⚠️ deletes all data)
docker-compose down -v
docker-compose --profile dev up
```
