#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROFILE=${1:-dev}
PROJECT_DIR="/home/wednes/Code/Dev/sinergiumkm"

cd "$PROJECT_DIR"

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Load environment
echo -e "${YELLOW}🔧 Loading environment...${NC}"
if [ -f .env.production ]; then
    cp .env.production .env
else
    cp .env.example .env
fi

# Build images
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker compose -f docker-compose.yml --profile $PROFILE build

# Stop old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker compose --profile $PROFILE down

# Start new containers
echo -e "${YELLOW}▶️  Starting new containers...${NC}"
docker compose --profile $PROFILE up -d

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
if curl --fail --max-time 10 http://localhost:9090/healthz > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Health check passed!${NC}"
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo -e "${GREEN}🌐 Website: https://dev.sinergiumkmindonesia.com${NC}"
else
  echo -e "${RED}❌ Health check failed!${NC}"
  echo -e "${YELLOW}Showing logs:${NC}"
  docker compose logs --tail=50
  exit 1
fi

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deployment complete!${NC}"
