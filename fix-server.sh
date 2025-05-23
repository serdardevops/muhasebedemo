#!/bin/bash

# Ubuntu Server Quick Fix Script
# Bu script yaygın deployment sorunlarını düzeltir

echo "🔧 Ubuntu Server Quick Fix Başlıyor..."

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 1. PM2 process'ini restart et
print_step "PM2 muhasebe-backend restart ediliyor..."
pm2 restart muhasebe-backend 2>/dev/null || pm2 start /opt/muhasebedemo/backend/dist/index.js --name "muhasebe-backend"
print_success "PM2 restart tamamlandı"

# 2. Nginx restart
print_step "Nginx restart ediliyor..."
sudo systemctl restart nginx
print_success "Nginx restart tamamlandı"

# 3. Firewall portlarını kontrol et ve aç
print_step "Firewall portları açılıyor..."
sudo ufw allow 80 >/dev/null 2>&1
sudo ufw allow 443 >/dev/null 2>&1
sudo ufw allow 3001 >/dev/null 2>&1
print_success "Firewall portları açıldı"

# 4. Nginx konfigürasyonunu test et
print_step "Nginx konfigürasyon test ediliyor..."
if sudo nginx -t >/dev/null 2>&1; then
    print_success "Nginx konfigürasyonu OK"
else
    echo "❌ Nginx konfigürasyon hatası! Manuel kontrol gerekli."
fi

# 5. Sistem durumunu kontrol et
echo ""
echo "📊 Sistem Durumu:"
echo "==================="

# PM2 durum
echo "🔥 PM2 Durumu:"
pm2 list 2>/dev/null | grep muhasebe-backend || echo "❌ PM2 process bulunamadı"

# Nginx durum
echo ""
echo "🌐 Nginx Durumu:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx çalışıyor"
else
    echo "❌ Nginx çalışmıyor"
fi

# Port kontrol
echo ""
echo "🔌 Port Durumu:"
if netstat -tlnp | grep :80 >/dev/null; then
    echo "✅ Port 80 açık"
else
    echo "❌ Port 80 kapalı"
fi

if netstat -tlnp | grep :3001 >/dev/null; then
    echo "✅ Port 3001 açık"
else
    echo "❌ Port 3001 kapalı"
fi

# Server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "📱 Erişim Bilgileri:"
echo "==================="
echo "🌐 Frontend: http://$SERVER_IP"
echo "🔌 Backend API: http://$SERVER_IP/api"
echo "💚 Health Check: http://$SERVER_IP/health"
echo "🔐 Demo Login: admin@demo.com / demo123"

echo ""
echo "✅ Quick fix tamamlandı!"
echo ""
echo "🔍 Hala sorun varsa şu komutu çalıştır:"
echo "   ./debug-server.sh" 