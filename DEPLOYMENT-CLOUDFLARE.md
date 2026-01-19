# Deployment dengan Cloudflare Tunnel

## Setup Cloudflare Tunnel

Anda sudah punya Cloudflare Tunnel yang mengarah ke domain **sinergiumkmindonesia.com**.

### Konfigurasi Tunnel

Pastikan Cloudflare Tunnel dikonfigurasi mengarah ke:
```
localhost:8080
```

Atau jika tunnel di server lain:
```
http://server-ip:8080
```

## Deploy ke Production

### 1. Edit Environment Production

```bash
nano .env.production
```

Update nilai penting:
```bash
DOMAIN=sinergiumkmindonesia.com
DB_PASSWORD=password_kuat_min_16_karakter
JWT_SECRET=jwt_secret_min_32_karakter_untuk_production
```

### 2. Build dan Deploy

```bash
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start semua services
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d
```

### 3. Verifikasi

```bash
# Check status
docker compose ps

# Check logs
docker compose logs -f nginx
docker compose logs -f backend

# Test health endpoint (dari server)
curl http://localhost:8080/healthz
```

### 4. Akses dari Public

Buka browser:
```
https://sinergiumkmindonesia.com
```

## Ports yang Digunakan

| Service | Internal | External | Notes |
|---------|----------|----------|-------|
| Nginx | 80 | 8080 | Cloudflare Tunnel → 8080 |
| Backend | 8000 | - | Internal only |
| Database | 5432 | 5433 | Optional external |
| Adminer | 8080 | 8082 | DB management (optional) |

## Cloudflare Tunnel Configuration

Pastikan tunnel config mengarah ke service Nginx:

```yaml
# Example cloudflared config.yml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: sinergiumkmindonesia.com
    service: http://localhost:8080
  - hostname: www.sinergiumkmindonesia.com
    service: http://localhost:8080
  - service: http_status:404
```

## Troubleshooting

### Nginx tidak bisa diakses

```bash
# Check nginx logs
docker compose logs nginx

# Check nginx config
docker compose exec nginx nginx -t

# Restart nginx
docker compose restart nginx
```

### Backend error

```bash
# Check backend logs
docker compose logs backend

# Check database connection
docker compose exec backend npx prisma db pull
```

### Cloudflare Tunnel tidak connect

```bash
# Check tunnel status dari Cloudflare Dashboard
# Atau restart tunnel service
systemctl restart cloudflared  # jika pakai systemd
```

## Update Application

```bash
# Pull latest code
git pull

# Rebuild
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Restart services
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d
```

## Monitoring

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f nginx
docker compose logs -f backend

# Check resource usage  
docker stats
```

## Backup Database

```bash
# Backup
docker compose exec db pg_dump -U semindo semindo_db > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U semindo semindo_db < backup-20260115.sql
```
