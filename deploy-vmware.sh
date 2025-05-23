#!/bin/bash

# Muhasebe Demo - VMware Local Network Deployment Script
# Bu script VMware üzerinde Ubuntu için tasarlanmıştır
# Local Network IP: 192.168.1.170

set -e

echo "🖥️ Muhasebe Demo - VMware Local Network Deployment Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# VMware spesifik ayarlar
VMWARE_IP="192.168.1.170"
GITHUB_REPO="https://github.com/serdardevops/muhasebedemo.git"

print_status "VMware IP: $VMWARE_IP"
print_status "GitHub Repo: $GITHUB_REPO"

# 1. Sistem güncellemesi
print_status "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# 2. Gerekli paketleri kur
print_status "Gerekli paketler kuruluyor..."
sudo apt install -y curl wget git build-essential net-tools

# 3. Node.js kurulumu (v18+)
print_status "Node.js kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Node.js sürümünü kontrol et
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION ve npm $NPM_VERSION kuruldu"

# 4. PM2 kurulumu (process manager)
print_status "PM2 process manager kuruluyor..."
sudo npm install -g pm2

# 5. Nginx kurulumu (reverse proxy)
print_status "Nginx kuruluyor..."
sudo apt install -y nginx

# 6. Firewall ayarları (VMware için)
print_status "Firewall ayarları yapılıyor..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
# Local network erişimi için
sudo ufw allow from 192.168.1.0/24
sudo ufw --force enable

# 7. Proje klasörü oluştur
print_status "Proje klasörü hazırlanıyor..."
sudo mkdir -p /opt/muhasebedemo
sudo chown $USER:$USER /opt/muhasebedemo
cd /opt/muhasebedemo

# 8. GitHub'dan projeyi clone et
print_status "Proje GitHub'dan indiriliyor..."
git clone $GITHUB_REPO .

# 9. Root dependencies kurulumu
print_status "Root dependencies kuruluyor..."
npm install

# 10. Backend environment dosyası oluştur
print_status "Backend environment dosyası oluşturuluyor..."
cd backend
cp env.example .env

# Environment dosyasını VMware için özelleştir
cat > .env << EOF
# Database (SQLite - Local network için ideal)
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# CORS - VMware local network için
CORS_ORIGIN="http://localhost:3000,http://192.168.1.170:3000,http://192.168.1.170"

# Rate Limiting (Local network için esnek)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Email (Opsiyonel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="uploads/"

# Local Network Settings
TRUST_PROXY=true
EOF

# 11. Backend dependencies kurulumu
print_status "Backend dependencies kuruluyor..."
npm install

# 12. Prisma database setup
print_status "Veritabanı hazırlanıyor..."
npx prisma generate
npx prisma db push

# Demo data oluştur (opsiyonel)
print_status "Demo data oluşturuluyor..."
npm run seed 2>/dev/null || print_warning "Demo data scripti bulunamadı (normal)"

# 13. Backend build
print_status "Backend build ediliyor..."
npm run build

# 14. Frontend dependencies ve build
print_status "Frontend dependencies kuruluyor..."
cd ../frontend
npm install

# Frontend için environment (opsiyonel)
cat > .env << EOF
REACT_APP_API_URL=http://192.168.1.170/api
REACT_APP_ENV=production
EOF

print_status "Frontend build ediliyor..."
npm run build

# 15. PM2 ile backend'i başlat
print_status "Backend PM2 ile başlatılıyor..."
cd ../backend
pm2 start dist/index.js --name "muhasebe-backend"
pm2 save
pm2 startup

# 16. Nginx konfigürasyonu (VMware için)
print_status "Nginx konfigürasyonu yapılıyor..."
sudo tee /etc/nginx/sites-available/muhasebedemo > /dev/null << EOF
server {
    listen 80;
    server_name 192.168.1.170 localhost;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json text/plain application/xml;

    # Frontend (React build)
    location / {
        root /opt/muhasebedemo/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers for local network
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 10M;
    }
}
EOF

# Nginx site'ı etkinleştir
sudo ln -sf /etc/nginx/sites-available/muhasebedemo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx konfigürasyonunu test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
sudo systemctl enable nginx

# 17. Network interface ayarlarını kontrol et
print_status "Network ayarları kontrol ediliyor..."
ip addr show | grep "192.168.1.170" || print_warning "IP adresi 192.168.1.170 bulunamadı!"

# 18. Sistem servislerini kontrol et
print_status "Sistem servisleri kontrol ediliyor..."
print_success "PM2 Durumu:"
pm2 status

print_success "Nginx Durumu:"
sudo systemctl status nginx --no-pager -l

# 19. VMware spesifik kontroller
print_status "VMware spesifik kontroller..."

# Port kontrolleri
print_info "Port durumları:"
sudo netstat -tlnp | grep -E ':80|:3001' || print_warning "Portlar henüz açılmamış olabilir"

# Firewall kontrol
print_info "Firewall durumu:"
sudo ufw status

# 20. Final test
print_status "Bağlantı testleri yapılıyor..."

# Local test
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend localhost'ta çalışıyor"
else
    print_error "Backend localhost'ta çalışmıyor!"
fi

# VMware IP test
if curl -s http://192.168.1.170/health > /dev/null; then
    print_success "Backend VMware IP'den erişilebilir"
else
    print_warning "Backend VMware IP'den henüz erişilemiyor (VM yeniden başlatma gerekebilir)"
fi

# 21. Deployment bilgileri
print_success "🎉 VMware Deployment tamamlandı!"
echo ""
echo "========================================="
echo "📊 VMware Erişim Bilgileri"
echo "========================================="
echo "🖥️  VMware IP: 192.168.1.170"
echo "🌐 Frontend: http://192.168.1.170"
echo "🔌 Backend API: http://192.168.1.170/api"
echo "💚 Health Check: http://192.168.1.170/health"
echo ""
echo "🔐 Demo Hesap:"
echo "   E-posta: admin@demo.com"
echo "   Şifre: demo123"
echo ""
echo "📋 Yönetim Komutları:"
echo "   PM2 durum: pm2 status"
echo "   PM2 log: pm2 logs muhasebe-backend"
echo "   PM2 restart: pm2 restart muhasebe-backend"
echo "   Nginx restart: sudo systemctl restart nginx"
echo ""
echo "📁 Proje Dizini: /opt/muhasebedemo"
echo "🔧 Backend ENV: /opt/muhasebedemo/backend/.env"
echo ""
echo "🌐 Local Network Erişim:"
echo "   Host bilgisayardan: http://192.168.1.170"
echo "   Aynı ağdaki diğer cihazlardan: http://192.168.1.170"
echo ""
print_warning "VMware'de Network Adapter'ın 'Bridged' modda olduğundan emin ol!"
print_warning "VM'yi yeniden başlatmak performans için iyi olabilir."

echo ""
echo "🔧 Sorun giderme için:"
echo "   ./debug-server.sh"
echo "   ./fix-server.sh" 