#!/bin/bash

# manage.sh - Script untuk mengelola project Semindo (Fullstack)
# Dapat menjalankan frontend & backend server secara bersamaan dan membersihkan port saat dihentikan

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports
FRONTEND_PORT=8080
BACKEND_PORT=3000

# Ensure we are in the script directory
cd "$(dirname "$0")"

# Fungsi untuk menampilkan bantuan
show_help() {
    echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    Semindo Project Manager v2.0         ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo "Penggunaan: ./manage.sh [PERINTAH]"
    echo ""
    echo -e "${GREEN}📦 DOCKER COMMANDS:${NC}"
    echo "  docker-dev       Menjalankan development environment dengan Docker"
    echo "  docker-prod      Menjalankan production environment dengan Docker"
    echo "  docker-build     Build Docker images"
    echo "  docker-stop      Stop semua Docker containers"
    echo "  docker-clean     Hapus semua Docker containers dan volumes"
    echo "  docker-logs      Lihat logs dari Docker containers"
    echo "  deploy           Build dan deploy production via Docker Compose"
    echo "  destroy          Stop, hapus containers, images & build cache (tanpa hapus volume)"
    echo ""
    echo -e "${GREEN}💻 LOCAL DEVELOPMENT:${NC}"
    echo "  dev              Menjalankan frontend & backend (local, tanpa Docker)"
    echo "  build            Build project (local)"
    echo "  lint             Menjalankan linter"
    echo "  test             Menjalankan test"
    echo "  clean            Membersihkan node_modules dan build"
    echo ""
    echo -e "${GREEN}🗄️  DATABASE (Docker):${NC}"
    echo "  db-migrate       Jalankan database migrations"
    echo "  db-seed         Seed database dengan sample data"
    echo "  db-reset        Reset database (WARNING: hapus semua data)"
    echo ""
    echo -e "${YELLOW}CONTOH:${NC}"
    echo "  ./manage.sh docker-dev       # Development dengan Docker"
    echo "  ./manage.sh dev              # Development lokal (tanpa Docker)"
    echo "  ./manage.sh docker-logs      # Lihat logs Docker"
    echo ""
    echo -e "${BLUE}TIP: Gunakan 'make help' untuk melihat semua Makefile commands${NC}"
}

# Fungsi untuk memeriksa apakah port digunakan
is_port_in_use() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Fungsi untuk membunuh proses yang menggunakan port
kill_port() {
    local port=$1
    
    if is_port_in_use $port; then
        echo -e "${YELLOW}Port $port sedang digunakan. Mencoba membersihkan...${NC}"
        local pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            echo -e "${RED}Menghentikan proses PID $pid di port $port${NC}"
            kill -9 $pid
            sleep 1
            
            if is_port_in_use $port; then
                echo -e "${RED}Gagal membersihkan port $port${NC}"
                return 1
            else
                echo -e "${GREEN}Port $port berhasil dibebaskan${NC}"
                return 0
            fi
        fi
    else
        return 0
    fi
}

# Fungsi untuk membersihkan saat script dihentikan
cleanup() {
    echo -e "\n${YELLOW}Menerima sinyal berhenti. Membersihkan process...${NC}"
    
    # Kill child processes if they exist
    if [ -n "$BACKEND_PID" ]; then
        echo -e "${YELLOW}Menghentikan Backend Server (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}Menghentikan Frontend Server (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Ensure ports are free
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    echo -e "${GREEN}Semua service telah dihentikan. Bye! 👋${NC}"
    exit 0
}

# Fungsi untuk menjalankan development server
run_dev() {
    echo -e "${BLUE}🚀 Memulai Semindo Fullstack Development Environment...${NC}"
    
    # 1. Bersihkan port terlebih dahulu
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    echo -e "${BLUE}Starting Backend & Frontend...${NC}"
    
    # Use concurrently for better logging
    # -n: Names for the processes
    # -c: Colors for the processes
    # --kill-others: Kill all if one dies (optional, but good for dev)
    npx concurrently \
        -n "BACKEND,FRONTEND" \
        -c "blue,green" \
        "cd api && npm run dev" \
        "npm run dev"
}

# Fungsi untuk build project
run_build() {
    echo -e "${BLUE}Melakukan build project...${NC}"
    npm run build
}

# Fungsi untuk menjalankan linter
run_lint() {
    echo -e "${BLUE}Menjalankan linter...${NC}"
    npm run lint
}

# Fungsi untuk menjalankan test
run_test() {
    echo -e "${BLUE}Menjalankan test...${NC}"
    npm test
}

# Fungsi untuk membersihkan project
run_clean() {
    echo -e "${BLUE}Membersihkan project...${NC}"
    
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    
    if [ -d "api/node_modules" ]; then
        rm -rf api/node_modules
    fi
    
    echo -e "${GREEN}Pembersihan selesai${NC}"
}

# Docker Commands
docker_dev() {
    echo -e "${BLUE}🐳 Starting Docker development environment...${NC}"
    docker-compose --profile dev up -d
    echo -e "${GREEN}✅ Development environment started!${NC}"
    echo -e "${YELLOW}Frontend: http://localhost:8080${NC}"
    echo -e "${YELLOW}Backend: http://localhost:3000${NC}"
    echo -e "${YELLOW}Adminer: http://localhost:8081${NC}"
    echo ""
    echo -e "${BLUE}Lihat logs dengan: ./manage.sh docker-logs${NC}"
}

docker_prod() {
    echo -e "${BLUE}🐳 Starting Docker production environment...${NC}"
    docker-compose --profile prod up -d
    echo -e "${GREEN}✅ Production environment started!${NC}"
    echo -e "${YELLOW}Frontend: http://localhost:8080${NC}"
    echo -e "${YELLOW}Backend: http://localhost:3000${NC}"
}

docker_build() {
    echo -e "${BLUE}🔨 Building Docker images...${NC}"
    echo "Select environment:"
    echo "  1) Development"
    echo "  2) Production"
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            docker-compose --profile dev build --no-cache
            ;;
        2)
            docker-compose --profile prod build --no-cache
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            return 1
            ;;
    esac
    echo -e "${GREEN}✅ Build complete!${NC}"
}

docker_stop() {
    echo -e "${BLUE}🛑 Stopping Docker containers...${NC}"
    docker-compose --profile dev down
    docker-compose --profile prod down
    echo -e "${GREEN}✅ All containers stopped!${NC}"
}

docker_clean() {
    echo -e "${RED}⚠️  WARNING: This will remove all containers, volumes, and images!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        docker-compose --profile dev down -v --rmi all
        docker-compose --profile prod down -v --rmi all
        echo -e "${GREEN}✅ Docker cleanup complete!${NC}"
    else
        echo -e "${YELLOW}Cancelled.${NC}"
    fi
}

docker_logs() {
    echo -e "${BLUE}📋 Docker logs (Ctrl+C to exit):${NC}"
    docker-compose logs -f
}

# Deploy production via Docker Compose (build + up)
deploy() {
    echo -e "${BLUE}🚀 Deploying production environment...${NC}"
    echo -e "${YELLOW}Step 1/2: Building Docker images...${NC}"
    docker-compose --profile prod build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed!${NC}"
        return 1
    fi
    echo -e "${YELLOW}Step 2/2: Starting containers...${NC}"
    docker-compose --profile prod up -d
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Deploy failed!${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    echo -e "${YELLOW}Frontend: http://localhost:8080${NC}"
    echo -e "${YELLOW}Backend: http://localhost:3000${NC}"
}

# Destroy containers, images, and build cache without removing volumes
destroy() {
    echo -e "${BLUE}🛑 Stopping and removing containers, images, and build cache (volumes preserved)...${NC}"
    
    # Stop and remove containers
    docker-compose --profile dev down --remove-orphans --rmi local
    docker-compose --profile prod down --remove-orphans --rmi local
    
    # Remove build cache
    echo -e "${BLUE}🧹 Cleaning Docker build cache...${NC}"
    docker builder prune -f
    
    # Remove dangling images
    echo -e "${BLUE}🗑️ Removing dangling images...${NC}"
    docker image prune -f
    
    echo -e "${GREEN}✅ Containers, images, and build cache removed!${NC}"
    echo -e "${YELLOW}Note: Volumes are preserved. Use 'docker-clean' to remove volumes.${NC}"
}

db_migrate() {
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    docker-compose exec backend npx prisma migrate deploy
    echo -e "${GREEN}✅ Migrations complete!${NC}"
}

db_seed() {
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    docker-compose exec backend npx prisma db seed
    echo -e "${GREEN}✅ Database seeded!${NC}"
}

db_reset() {
    echo -e "${RED}⚠️  WARNING: This will delete ALL data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        docker-compose exec backend npx prisma migrate reset --force
        echo -e "${GREEN}✅ Database reset complete!${NC}"
    else
        echo -e "${YELLOW}Cancelled.${NC}"
    fi
}

# Main logic
COMMAND=$1

case $COMMAND in
    # Local development
    dev)
        run_dev
        ;;
    build)
        run_build
        ;;
    lint)
        run_lint
        ;;
    test)
        run_test
        ;;
    clean)
        run_clean
        ;;
    
    # Docker commands
    docker-dev)
        docker_dev
        ;;
    docker-prod)
        docker_prod
        ;;
    docker-build)
        docker_build
        ;;
    docker-stop)
        docker_stop
        ;;
    docker-clean)
        docker_clean
        ;;
    docker-logs)
        docker_logs
        ;;
    deploy)
        deploy
        ;;
    destroy)
        destroy
        ;;
    
    # Database commands
    db-migrate)
        db_migrate
        ;;
    db-seed)
        db_seed
        ;;
    db-reset)
        db_reset
        ;;
    
    *)
        show_help
        ;;
esac