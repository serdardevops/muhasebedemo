#!/bin/bash

# Muhasebe Demo - VMware Local Network Deployment Script
# Bu script VMware üzerinde Ubuntu için tasarlanmıştır
# Local Network IP: 192.168.1.187

set -e

echo "🖥️ Muhasebe Demo - VMware Local Network Deployment Başlıyor..."
echo "🔧 IP Adresi: 192.168.1.187"

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
VMWARE_IP="192.168.1.187"
GITHUB_REPO="https://github.com/serdardevops/muhasebedemo.git"

print_status "VMware IP: $VMWARE_IP"
print_status "GitHub Repo: $GITHUB_REPO"

# Mevcut IP'yi kontrol et
CURRENT_IP=$(hostname -I | awk '{print $1}')
if [ "$CURRENT_IP" != "$VMWARE_IP" ]; then
    print_warning "Mevcut IP ($CURRENT_IP) hedef IP'den ($VMWARE_IP) farklı!"
    print_warning "Konfigürasyon her iki IP için de yapılacak."
fi

# 1. Sistem güncellemesi
print_status "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# 2. Gerekli paketleri kur
print_status "Gerekli paketler kuruluyor..."
sudo apt install -y curl wget git build-essential net-tools

# 3. Node.js kurulumu (v18+)
if ! command -v node &> /dev/null; then
    print_status "Node.js kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_success "Node.js zaten kurulu: $(node --version)"
fi

# 4. PM2 kurulumu (process manager)
if ! command -v pm2 &> /dev/null; then
    print_status "PM2 process manager kuruluyor..."
    sudo npm install -g pm2
else
    print_success "PM2 zaten kurulu"
fi

# 5. Nginx kurulumu (reverse proxy)
if ! command -v nginx &> /dev/null; then
    print_status "Nginx kuruluyor..."
    sudo apt install -y nginx
else
    print_success "Nginx zaten kurulu"
fi

# 6. Firewall ayarları (VMware için)
print_status "Firewall ayarları yapılıyor..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
# Local network erişimi için
sudo ufw allow from 192.168.1.0/24
sudo ufw --force enable

# 7. Proje klasörü oluştur veya güncelle
print_status "Proje klasörü hazırlanıyor..."
if [ ! -d "/opt/muhasebedemo" ]; then
    sudo mkdir -p /opt/muhasebedemo
    sudo chown $USER:$USER /opt/muhasebedemo
    cd /opt/muhasebedemo
    
    # GitHub'dan projeyi clone et
    print_status "Proje GitHub'dan indiriliyor..."
    git clone $GITHUB_REPO .
else
    print_status "Proje klasörü mevcut, güncelleniyor..."
    cd /opt/muhasebedemo
    git pull origin main || print_warning "Git pull hatası (normal olabilir)"
fi

# 8. Root dependencies kurulumu
print_status "Root dependencies kuruluyor..."
npm install

# 9. Backend environment dosyası oluştur
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

# CORS - VMware local network için (hem mevcut hem hedef IP)
CORS_ORIGIN="http://localhost:3000,http://192.168.1.187:3000,http://192.168.1.187,http://$CURRENT_IP:3000,http://$CURRENT_IP"

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

# 10. Backend dependencies kurulumu
print_status "Backend dependencies kuruluyor..."
npm install

# 11. Prisma database setup
print_status "Veritabanı hazırlanıyor..."
npx prisma generate
npx prisma db push

# Demo data oluştur (opsiyonel)
print_status "Demo data oluşturuluyor..."
npm run seed 2>/dev/null || print_warning "Demo data scripti bulunamadı (normal)"

# 12. Backend build
print_status "Backend build ediliyor..."
npm run build

# 13. Frontend dependencies ve build
print_status "Frontend dependencies kuruluyor..."
cd ../frontend
npm install

# Frontend için environment (opsiyonel)
cat > .env << EOF
REACT_APP_API_URL=http://192.168.1.187/api
REACT_APP_ENV=production
EOF

print_status "Frontend build ediliyor..."
npm run build

# 14. PM2 ile backend'i başlat
print_status "Backend PM2 ile başlatılıyor..."
cd ../backend

# Mevcut PM2 process'ini durdur (varsa)
pm2 stop muhasebe-backend 2>/dev/null || true
pm2 delete muhasebe-backend 2>/dev/null || true

# Yeni process'i başlat
pm2 start dist/index.js --name "muhasebe-backend"
pm2 save
pm2 startup

# 15. Nginx konfigürasyonu (VMware için)
print_status "Nginx konfigürasyonu yapılıyor..."
sudo tee /etc/nginx/sites-available/muhasebedemo > /dev/null << EOF
server {
    listen 80;
    server_name 192.168.1.187 $CURRENT_IP localhost;

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

# 16. Final test
print_status "Bağlantı testleri yapılıyor..."

# Local test
sleep 3
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend localhost'ta çalışıyor"
else
    print_error "Backend localhost'ta çalışmıyor!"
fi

# VMware IP test
if curl -s http://192.168.1.187/health > /dev/null; then
    print_success "Backend 192.168.1.187'den erişilebilir"
else
    print_warning "Backend 192.168.1.187'den henüz erişilemiyor"
fi

# Frontend test
if curl -s -I http://192.168.1.187 | grep "200 OK" > /dev/null; then
    print_success "Frontend 192.168.1.187'den erişilebilir"
else
    print_warning "Frontend 192.168.1.187'den henüz erişilemiyor"
fi

# 17. Deployment bilgileri
print_success "🎉 VMware Deployment tamamlandı!"
echo ""
echo "========================================="
echo "📊 VMware Erişim Bilgileri"
echo "========================================="
echo "🖥️  VMware IP: 192.168.1.187"
echo "🌐 Frontend: http://192.168.1.187"
echo "🔌 Backend API: http://192.168.1.187/api"
echo "💚 Health Check: http://192.168.1.187/health"
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
echo "   Host bilgisayardan: http://192.168.1.187"
echo "   VM içinden: http://localhost"
echo ""

echo "🔧 Sorun giderme için:"
echo "   pm2 logs muhasebe-backend"
echo "   sudo nginx -t"
echo "   curl http://192.168.1.187/health" 