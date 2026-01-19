#!/bin/bash

# SSL Certificate Setup using Let's Encrypt

set -e

DOMAIN="sinergiumkmindonesia.com"
EMAIL="your-email@example.com"  # CHANGE THIS!

echo "🔐 Setting up SSL certificates for $DOMAIN"

# Step 1: Start only nginx on port 80 for certificate verification
echo "📋 Step 1: Starting Nginx for ACME challenge..."

# Temporarily use HTTP-only nginx config
mkdir -p nginx/ssl
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

# Step 2: Run certbot
echo "📋 Step 2: Running Certbot..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# Step 3: Restart nginx with HTTPS
echo "📋 Step 3: Restarting Nginx with SSL..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

echo ""
echo "✅ SSL certificates installed successfully!"
echo ""
echo "📝 Certificates location: ./certbot/conf/live/$DOMAIN/"
echo "📝 Auto-renewal: Add this to crontab:"
echo "   0 3 * * * docker compose -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.prod.yml run --rm certbot renew && docker compose -f $(pwd)/docker-compose.yml -f $(pwd)/docker-compose.prod.yml restart nginx"
