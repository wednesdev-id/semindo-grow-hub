# Production Deployment Guide

## Overview

This guide covers deploying Sinergium KM to production using Docker with Nginx reverse proxy and SSL/TLS certificates.

## Architecture

```
Internet → Nginx (80/443) → Backend API (8000) + Frontend (static)
                          ↓
                      PostgreSQL (5432)
```

## Prerequisites

1. **Server Requirements**:
   - Ubuntu 20.04+ or similar
   - Docker & Docker Compose installed
   - Minimum 2GB RAM, 20GB disk

2. **Domain Configuration**:
   - DNS A record: `sinergiumkmindonesia.com` → Server IP
   - DNS A record: `www.sinergiumkmindonesia.com` → Server IP

3. **Ports Open**:
   - 80 (HTTP)
   - 443 (HTTPS)

## Quick Start

### 1. Configure Environment

Edit `.env.production`:
```bash
DOMAIN=sinergiumkmindonesia.com
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_key_min_32_chars
```

### 2. Deploy Application

```bash
./deploy-prod.sh
```

This will:
- Build Docker images
- Start database
- Run migrations
- Start all services

### 3. Setup SSL Certificates

Edit `setup-ssl.sh` with your email, then run:
```bash
./setup-ssl.sh
```

## Manual Deployment Steps

### Build Images

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### Start Services

```bash
# Start with production profile
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### SSL Certificate Setup

#### Option A: Let's Encrypt (Production)

```bash
# Run certbot
docker compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  --email your@email.com \
  --agree-tos \
  --no-eff-email \
  -d sinergiumkmindonesia.com \
  -d www.sinergiumkmindonesia.com

# Restart nginx
docker compose restart nginx
```

#### Option B: Self-Signed (Testing)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/CN=sinergiumkmindonesia.com"

# Update nginx.conf to use nginx/ssl/ path
# Restart nginx
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d
```

## Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f backend
```

### Health Checks

```bash
# Backend health
curl https://sinergiumkmindonesia.com/healthz

# Nginx status
curl -I https://sinergiumkmindonesia.com
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting service
sudo systemctl stop apache2  # if Apache running
```

### SSL Certificate Issues

```bash
# Check certificate
docker compose exec nginx ls -la /etc/letsencrypt/live/

# Test SSL configuration
docker compose exec nginx nginx -t

# View certbot logs
docker compose logs certbot
```

### Database Connection Issues

```bash
# Check database status
docker compose exec db pg_isready

# Check connection from backend
docker compose exec backend npx prisma db pull
```

## Backup & Restore

### Backup Database

```bash
docker compose exec db pg_dump -U semindo semindo_db > backup.sql
```

### Restore Database

```bash
docker compose exec -T db psql -U semindo semindo_db < backup.sql
```

## Security Checklist

- [ ] Changed default database password
- [ ] Set strong JWT secret
- [ ] Configured firewall (UFW)
- [ ] SSL certificates installed
- [ ] Regular backups scheduled
- [ ] Monitoring setup
- [ ] Updated `.env.production` with production values

## URLs

- **Production**: https://sinergiumkmindonesia.com
- **API**: https://sinergiumkmindonesia.com/api/v1
- **Health**: https://sinergiumkmindonesia.com/healthz
