#!/bin/bash

# Muhasebe Demo - Detaylı Kurulum Scripti
# Bu script projeyi otomatik olarak kurar ve hataları detaylı gösterir

set -e  # Hata durumunda scripti durdur

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo ve başlık
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    MUHASEBE DEMO                             ║"
echo "║           Detaylı Kurulum Scripti (Verbose)                 ║"
echo "║                                                              ║"
echo "║  Bu script projeyi kurar ve hataları detaylı gösterir       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Fonksiyonlar
print_step() {
    echo -e "\n${BLUE}[ADIM]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Hata yakalama fonksiyonu
handle_error() {
    local exit_code=$?
    local line_number=$1
    print_error "Hata oluştu! (Satır: $line_number, Kod: $exit_code)"
    echo -e "${YELLOW}Detaylı hata bilgisi için setup-verbose.sh kullanın${NC}"
    exit $exit_code
}

# Hata yakalama
trap 'handle_error $LINENO' ERR

# Node.js kontrolü
check_node() {
    print_step "Node.js kontrolü yapılıyor..."
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js bulundu: $NODE_VERSION"
        
        # Node.js versiyonu kontrolü (v18+ gerekli)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js v18 veya üzeri gerekli. Mevcut versiyon: $NODE_VERSION"
            print_warning "Lütfen Node.js'i güncelleyin: https://nodejs.org/"
            exit 1
        fi
    else
        print_error "Node.js bulunamadı!"
        print_warning "Node.js'i yüklemek için:"
        echo "  macOS: brew install node"
        echo "  Ubuntu: sudo apt install nodejs npm"
        echo "  Windows: https://nodejs.org/ adresinden indirin"
        exit 1
    fi
}

# npm kontrolü
check_npm() {
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        print_success "npm bulundu: v$NPM_VERSION"
    else
        print_error "npm bulunamadı!"
        exit 1
    fi
}

# Bağımlılıkları yükle
install_dependencies() {
    print_step "Proje bağımlılıkları yükleniyor..."
    
    # Ana proje bağımlılıkları
    print_success "Ana proje bağımlılıkları yükleniyor..."
    echo "  → npm install çalıştırılıyor..."
    npm install
    
    # Backend bağımlılıkları
    print_success "Backend bağımlılıkları yükleniyor..."
    cd backend
    echo "  → Backend npm install çalıştırılıyor..."
    npm install
    echo "  → tsconfig-paths yükleniyor..."
    npm install --save-dev tsconfig-paths
    cd ..
    
    # Frontend bağımlılıkları
    print_success "Frontend bağımlılıkları yükleniyor..."
    cd frontend
    echo "  → Frontend npm install çalıştırılıyor..."
    npm install --legacy-peer-deps
    echo "  → React Query DevTools yükleniyor..."
    npm install @tanstack/react-query-devtools
    cd ..
    
    print_success "Tüm bağımlılıklar başarıyla yüklendi!"
}

# Environment dosyalarını oluştur
setup_environment() {
    print_step "Environment dosyaları ayarlanıyor..."
    
    # Backend .env dosyası
    if [ ! -f "backend/.env" ]; then
        print_success "Backend .env dosyası oluşturuluyor..."
        cat > backend/.env << EOF
# Database (SQLite - Kolay başlangıç için)
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="muhasebe-demo-super-secret-key-$(date +%s)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Opsiyonel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="uploads/"
EOF
        print_success ".env dosyası oluşturuldu (SQLite veritabanı ile)"
    else
        print_warning ".env dosyası zaten mevcut, atlanıyor..."
    fi
}

# Veritabanını hazırla
setup_database() {
    print_step "Veritabanı hazırlanıyor..."
    
    cd backend
    
    # Prisma client generate
    print_success "Prisma client oluşturuluyor..."
    echo "  → npx prisma generate çalıştırılıyor..."
    npx prisma generate
    
    # Veritabanı oluştur (SQLite)
    print_success "SQLite veritabanı oluşturuluyor..."
    echo "  → npx prisma db push çalıştırılıyor..."
    npx prisma db push
    
    cd ..
    
    print_success "Veritabanı başarıyla hazırlandı!"
}

# Test build
test_build() {
    print_step "Proje test ediliyor..."
    
    cd backend
    print_success "Backend build test ediliyor..."
    echo "  → npm run build çalıştırılıyor..."
    npm run build
    cd ..
    
    print_success "Proje başarıyla test edildi!"
}

# Başlangıç talimatları
show_instructions() {
    echo -e "\n${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    KURULUM TAMAMLANDI! 🎉                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BLUE}Projenizi çalıştırmak için:${NC}"
    echo ""
    echo -e "  ${YELLOW}1. Tüm servisleri başlat:${NC}"
    echo "     npm run dev"
    echo ""
    echo -e "  ${YELLOW}2. Sadece backend:${NC}"
    echo "     npm run dev:backend"
    echo ""
    echo -e "  ${YELLOW}3. Sadece frontend:${NC}"
    echo "     npm run dev:frontend"
    echo ""
    echo -e "${BLUE}Erişim adresleri:${NC}"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend API: http://localhost:3001"
    echo "  • API Docs: http://localhost:3001/health"
    echo ""
    echo -e "${BLUE}Veritabanı yönetimi:${NC}"
    echo "  • Prisma Studio: cd backend && npx prisma studio"
    echo ""
    echo -e "${BLUE}Yardım için:${NC}"
    echo "  • README.md dosyasını okuyun"
    echo "  • SORUN-GIDERME.md dosyasını kontrol edin"
    echo ""
    echo -e "${GREEN}İyi çalışmalar! 🚀${NC}"
}

# Ana kurulum fonksiyonu
main() {
    echo -e "\n${BLUE}Detaylı kurulum başlatılıyor...${NC}\n"
    
    # Sistem kontrolleri
    check_node
    check_npm
    
    # Kurulum adımları
    install_dependencies
    setup_environment
    setup_database
    test_build
    
    # Tamamlandı
    show_instructions
}

# Scripti çalıştır
main 