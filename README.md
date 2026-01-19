# Sinergium KM - UMKM Platform

Platform konsultasi dan digitalisasi untuk UMKM Indonesia.

## 🚀 Quick Start

### Development with Docker

```bash
# Start development environment
docker compose --profile dev up -d

# View logs
docker compose logs -f

# Stop services
docker compose --profile dev down
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 16 (handled by Docker)

## 🌐 Services

| Service | Port | URL |
|---------|------|-----|
| Nginx (Gateway) | 9090 | http://localhost:9090 |
| Frontend | 5173 | http://localhost:5173 (direct) |
| Backend API | 3001 | http://localhost:3001 (direct) |
| Database | 5433 | localhost:5433 |
| Adminer | 8082 | http://localhost:8082 |

## 🔧 Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT-CLOUDFLARE.md) - Cloudflare Tunnel setup
- [Docker Guide](DOCKER_GUIDE.md) - Docker commands reference

## 🔄 CI/CD

Automatic deployment on push to `main` branch via GitHub Actions with self-hosted runner.

## 🚢 Deployment

### Development
```bash
./scripts/deploy.sh dev
```

### Rollback
```bash
./scripts/rollback.sh
```

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Reverse Proxy**: Nginx
- **Tunnel**: Cloudflare
- **CI/CD**: GitHub Actions

## 📝 License

Private - All rights reserved

## 👥 Team

Sinergium Indonesia
