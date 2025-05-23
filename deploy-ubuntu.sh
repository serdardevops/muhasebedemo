#!/bin/bash

# Muhasebe Demo - Ubuntu Server Deployment Script
# Bu script Ubuntu 20.04+ için tasarlanmıştır

set -e

echo "🚀 Muhasebe Demo - Ubuntu Server Deployment Başlıyor..."

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

# 1. Sistem güncellemesi
print_status "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# 2. Gerekli paketleri kur
print_status "Gerekli paketler kuruluyor..."
sudo apt install -y curl wget git build-essential

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

# 6. UFW Firewall ayarları
print_status "Firewall ayarları yapılıyor..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 7. Proje klasörü oluştur
print_status "Proje klasörü hazırlanıyor..."
sudo mkdir -p /opt/muhasebedemo
sudo chown $USER:$USER /opt/muhasebedemo
cd /opt/muhasebedemo

# 8. GitHub'dan projeyi clone et
print_status "Proje GitHub'dan indiriliyor..."
echo "GitHub repository URL'ini girin (örn: https://github.com/username/muhasebedemo.git):"
read REPO_URL
git clone $REPO_URL .

# 9. Backend dependencies kurulumu
print_status "Backend dependencies kuruluyor..."
cd /opt/muhasebedemo
npm install

# 10. Backend environment dosyası oluştur
print_status "Backend environment dosyası oluşturuluyor..."
cd backend
cp env.example .env

# Environment dosyasını düzenle
cat > .env << EOF
# Database (SQLite - Production için PostgreSQL önerilir)
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# CORS - Ubuntu server IP'si ekle
CORS_ORIGIN="http://localhost:3000,http://$(hostname -I | awk '{print $1}'):3000"

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

# 11. Prisma database setup
print_status "Veritabanı hazırlanıyor..."
npx prisma generate
npx prisma db push

# 12. Backend build
print_status "Backend build ediliyor..."
npm run build

# 13. Frontend build
print_status "Frontend build ediliyor..."
cd ../frontend
npm install
npm run build

# 14. PM2 ile backend'i başlat
print_status "Backend PM2 ile başlatılıyor..."
cd ../backend
pm2 start dist/index.js --name "muhasebe-backend"
pm2 save
pm2 startup

# 15. Nginx konfigürasyonu
print_status "Nginx konfigürasyonu yapılıyor..."
sudo tee /etc/nginx/sites-available/muhasebedemo > /dev/null << EOF
server {
    listen 80;
    server_name $(hostname -I | awk '{print $1}') localhost;

    # Frontend (React build)
    location / {
        root /opt/muhasebedemo/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
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

# 16. Sistem servislerini kontrol et
print_status "Sistem servisleri kontrol ediliyor..."
print_success "PM2 Durumu:"
pm2 status

print_success "Nginx Durumu:"
sudo systemctl status nginx --no-pager -l

# 17. Deployment bilgileri
SERVER_IP=$(hostname -I | awk '{print $1}')
print_success "🎉 Deployment tamamlandı!"
echo ""
echo "📊 Erişim Bilgileri:"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend API: http://$SERVER_IP/api"
echo "   Health Check: http://$SERVER_IP/health"
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

print_warning "Not: Production ortamında PostgreSQL kullanmanız önerilir!" 