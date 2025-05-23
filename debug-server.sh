#!/bin/bash

# Ubuntu Server Debug Script
# Bu script deployment sorunlarını tespit eder

echo "🔍 Ubuntu Server Debug Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

echo "========================================"
echo "🖥️  SISTEM BİLGİLERİ"
echo "========================================"

# Server IP adresi
SERVER_IP=$(hostname -I | awk '{print $1}')
print_info "Server IP: $SERVER_IP"

# İşletim sistemi
print_info "OS: $(lsb_release -d | cut -f2)"

echo ""
echo "========================================"
echo "🔌 PORT KONTROLLERI"
echo "========================================"

# Port 3001 (Backend) kontrol
if netstat -tlnp | grep :3001 > /dev/null; then
    print_success "Port 3001 (Backend) açık"
    netstat -tlnp | grep :3001
else
    print_error "Port 3001 (Backend) kapalı!"
fi

# Port 80 (Nginx) kontrol
if netstat -tlnp | grep :80 > /dev/null; then
    print_success "Port 80 (Nginx) açık"
    netstat -tlnp | grep :80
else
    print_error "Port 80 (Nginx) kapalı!"
fi

echo ""
echo "========================================"
echo "🔥 PM2 DURUMU"
echo "========================================"

if command -v pm2 &> /dev/null; then
    print_info "PM2 durum listesi:"
    pm2 list
    
    echo ""
    print_info "PM2 muhasebe-backend logs (son 10 satır):"
    pm2 logs muhasebe-backend --lines 10 --nostream || print_error "PM2 log hatası"
else
    print_error "PM2 kurulu değil!"
fi

echo ""
echo "========================================"
echo "🌐 NGINX DURUMU"
echo "========================================"

if systemctl is-active --quiet nginx; then
    print_success "Nginx çalışıyor"
else
    print_error "Nginx çalışmıyor!"
    systemctl status nginx --no-pager
fi

# Nginx konfigürasyon test
print_info "Nginx konfigürasyon testi:"
sudo nginx -t

# Nginx sites
print_info "Nginx aktif siteler:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "========================================"
echo "🔥 FIREWALL DURUMU"
echo "========================================"

print_info "UFW durum:"
sudo ufw status

echo ""
echo "========================================"
echo "📁 DOSYA KONTROLLERI"
echo "========================================"

# Proje dizini kontrol
if [ -d "/opt/muhasebedemo" ]; then
    print_success "Proje dizini mevcut: /opt/muhasebedemo"
    ls -la /opt/muhasebedemo/
else
    print_error "Proje dizini bulunamadı: /opt/muhasebedemo"
fi

# Backend build kontrol
if [ -d "/opt/muhasebedemo/backend/dist" ]; then
    print_success "Backend build mevcut"
    ls -la /opt/muhasebedemo/backend/dist/
else
    print_error "Backend build bulunamadı!"
fi

# Frontend build kontrol
if [ -d "/opt/muhasebedemo/frontend/build" ]; then
    print_success "Frontend build mevcut"
    ls -la /opt/muhasebedemo/frontend/build/ | head -5
else
    print_error "Frontend build bulunamadı!"
fi

# .env dosyası kontrol
if [ -f "/opt/muhasebedemo/backend/.env" ]; then
    print_success ".env dosyası mevcut"
    print_info ".env içeriği (hassas bilgiler gizli):"
    cat /opt/muhasebedemo/backend/.env | grep -v "SECRET\|PASSWORD" || echo "Dosya okunamadı"
else
    print_error ".env dosyası bulunamadı!"
fi

echo ""
echo "========================================"
echo "🌐 BAĞLANTI TESTLERİ"
echo "========================================"

# Localhost backend test
print_info "Backend health check (localhost):"
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend localhost'ta erişilebilir"
    curl -s http://localhost:3001/health | head -3
else
    print_error "Backend localhost'ta erişilemiyor!"
fi

# Harici IP backend test
print_info "Backend health check (harici IP):"
if curl -s http://$SERVER_IP/health > /dev/null; then
    print_success "Backend harici IP'den erişilebilir"
else
    print_error "Backend harici IP'den erişilemiyor!"
fi

# Frontend test
print_info "Frontend test (harici IP):"
if curl -s -I http://$SERVER_IP | grep "200 OK" > /dev/null; then
    print_success "Frontend harici IP'den erişilebilir"
else
    print_error "Frontend harici IP'den erişilemiyor!"
    curl -s -I http://$SERVER_IP | head -1
fi

echo ""
echo "========================================"
echo "📋 ÖNERİLEN ÇÖZÜMLER"
echo "========================================"

echo "🔧 Backend çalışmıyorsa:"
echo "   pm2 restart muhasebe-backend"
echo "   pm2 logs muhasebe-backend"

echo ""
echo "🔧 Nginx çalışmıyorsa:"
echo "   sudo systemctl restart nginx"
echo "   sudo nginx -t"

echo ""
echo "🔧 Build eksikse:"
echo "   cd /opt/muhasebedemo/backend && npm run build"
echo "   cd /opt/muhasebedemo/frontend && npm run build"

echo ""
echo "🔧 Firewall sorunu varsa:"
echo "   sudo ufw allow 80"
echo "   sudo ufw allow 3001"
echo "   sudo ufw status"

echo ""
echo "🔧 Hızlı restart için:"
echo "   sudo systemctl restart nginx"
echo "   pm2 restart all"

echo ""
echo "📱 Erişim URL'leri:"
echo "   Frontend: http://$SERVER_IP"
echo "   Backend: http://$SERVER_IP/api"
echo "   Health: http://$SERVER_IP/health"

echo ""
echo "�� Debug tamamlandı!" 