#!/bin/bash

# Production Deployment Script for Sinergium KM

set -e

echo "🚀 Deploying Sinergium KM to Production..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Step 1: Build images
echo "📦 Building Docker images..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Step 2: Start database first
echo "🗄️  Starting database..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d db

# Wait for database to be healthy
echo "⏳ Waiting for database to be ready..."
sleep 10

# Step 3: Run migrations
echo "🔄 Running database migrations..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Step 4: Start all services
echo "🌐 Starting all services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d

# Step 5: Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🔗 Access URLs:"
echo "  - Frontend: https://$DOMAIN"
echo "  - Backend API: https://$DOMAIN/api/v1"
echo "  - Health Check: https://$DOMAIN/healthz"
echo ""
echo "📝 View logs: docker compose logs -f"
