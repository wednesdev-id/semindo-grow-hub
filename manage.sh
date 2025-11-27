#!/bin/bash

# manage.sh - Script untuk mengelola project Semindo
# Dapat menjalankan development server dan membersihkan port saat dihentikan

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
DEFAULT_PORT=8080
PORT=$DEFAULT_PORT

# Fungsi untuk menampilkan bantuan
show_help() {
    echo -e "${BLUE}Semindo Project Manager${NC}"
    echo ""
    echo "Penggunaan: ./manage.sh [OPSI] [PERINTAH]"
    echo ""
    echo "PERINTAH:"
    echo "  dev     Menjalankan development server"
    echo "  build   Melakukan build project"
    echo "  lint    Menjalankan linter"
    echo "  test    Menjalankan test"
    echo "  clean   Membersihkan node_modules dan build"
    echo ""
    echo "OPSI:"
    echo "  -p, --port PORT    Port yang akan digunakan (default: 8080)"
    echo "  -h, --help         Menampilkan bantuan ini"
    echo ""
    echo "CONTOH:"
    echo "  ./manage.sh dev              # Menjalankan dev server di port 8080"
    echo "  ./manage.sh -p 3000 dev      # Menjalankan dev server di port 3000"
    echo "  ./manage.sh build            # Melakukan build project"
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
    echo -e "${YELLOW}Mencoba menghentikan proses di port $port...${NC}"
    
    if is_port_in_use $port; then
        local pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            echo -e "${RED}Menghentikan proses dengan PID $pid di port $port${NC}"
            kill -9 $pid
            sleep 1
            
            # Verifikasi apakah port sudah dibebaskan
            if is_port_in_use $port; then
                echo -e "${RED}Gagal menghentikan proses di port $port${NC}"
                return 1
            else
                echo -e "${GREEN}Port $port berhasil dibebaskan${NC}"
                return 0
            fi
        fi
    else
        echo -e "${GREEN}Port $port tidak digunakan${NC}"
        return 0
    fi
}

# Fungsi untuk membersihkan saat script dihentikan
cleanup() {
    echo -e "\n${YELLOW}Menerima sinyal interrupt, membersihkan...${NC}"
    
    # Hentikan development server yang berjalan
    if [ -n "$DEV_PID" ]; then
        echo -e "${YELLOW}Menghentikan development server (PID: $DEV_PID)...${NC}"
        kill $DEV_PID 2>/dev/null
    fi
    
    # Hentikan proses di port yang digunakan
    kill_port $PORT
    
    echo -e "${GREEN}Pembersihan selesai${NC}"
    exit 0
}

# Fungsi untuk menjalankan development server
run_dev() {
    echo -e "${BLUE}Menjalankan development server di port $PORT...${NC}"
    
    # Cek apakah port sudah digunakan
    if is_port_in_use $PORT; then
        echo -e "${YELLOW}Port $port sudah digunakan, mencoba menghentikan proses yang ada...${NC}"
        kill_port $PORT
    fi
    
    # Set trap untuk Ctrl+C
    trap cleanup SIGINT SIGTERM
    
    # Jalankan development server di background
    npm run dev &
    DEV_PID=$!
    
    echo -e "${GREEN}Development server berjalan dengan PID $DEV_PID${NC}"
    echo -e "${GREEN}Tekan Ctrl+C untuk menghentikan server dan membersihkan port${NC}"
    
    # Tunggu proses selesai
    wait $DEV_PID
}

# Fungsi untuk build project
run_build() {
    echo -e "${BLUE}Melakukan build project...${NC}"
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Build berhasil${NC}"
    else
        echo -e "${RED}Build gagal${NC}"
        exit 1
    fi
}

# Fungsi untuk menjalankan linter
run_lint() {
    echo -e "${BLUE}Menjalankan linter...${NC}"
    npm run lint
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Linter berhasil${NC}"
    else
        echo -e "${RED}Linter menemukan error${NC}"
        exit 1
    fi
}

# Fungsi untuk menjalankan test
run_test() {
    echo -e "${BLUE}Menjalankan test...${NC}"
    npm test
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Test berhasil${NC}"
    else
        echo -e "${RED}Test gagal${NC}"
        exit 1
    fi
}

# Fungsi untuk membersihkan project
run_clean() {
    echo -e "${BLUE}Membersihkan project...${NC}"
    
    # Hentikan semua proses di port default
    for port in 8080 8081 8082 3000 3001; do
        kill_port $port
    done
    
    # Hapus node_modules dan build
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}Menghapus node_modules...${NC}"
        rm -rf node_modules
    fi
    
    if [ -d "dist" ]; then
        echo -e "${YELLOW}Menghapus build directory...${NC}"
        rm -rf dist
    fi
    
    echo -e "${GREEN}Pembersihan selesai${NC}"
}

# Parse argumen
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        dev|build|lint|test|clean)
            COMMAND="$1"
            shift
            ;;
        *)
            echo -e "${RED}Opsi tidak dikenal: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Jika tidak ada perintah, tampilkan bantuan
if [ -z "$COMMAND" ]; then
    show_help
    exit 0
fi

# Validasi port
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1024 ] || [ "$PORT" -gt 65535 ]; then
    echo -e "${RED}Port harus berupa angka antara 1024 dan 65535${NC}"
    exit 1
fi

# Eksekusi perintah
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
        echo -e "${RED}Perintah tidak dikenal: $COMMAND${NC}"
        show_help
        exit 1
        ;;
esac