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
    echo -e "${BLUE}Semindo Project Manager${NC}"
    echo ""
    echo "Penggunaan: ./manage.sh [PERINTAH]"
    echo ""
    echo "PERINTAH:"
    echo "  dev     Menjalankan frontend & backend development server"
    echo "  build   Melakukan build project"
    echo "  lint    Menjalankan linter"
    echo "  test    Menjalankan test"
    echo "  clean   Membersihkan node_modules dan build"
    echo ""
    echo "CONTOH:"
    echo "  ./manage.sh dev              # Menjalankan fullstack dev environment"
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

# Main logic
COMMAND=$1

case $COMMAND in
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
    *)
        show_help
        ;;
esac