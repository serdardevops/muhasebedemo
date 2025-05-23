#!/bin/bash

# VMware Ubuntu Server Debug Script
# Bu script VMware deployment sorunlarını tespit eder
# Local Network IP: 192.168.1.170

echo "🔍 VMware Ubuntu Server Debug Başlıyor..."

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
echo "🖥️  VMWARE SISTEM BİLGİLERİ"
echo "========================================"

# VMware IP adresi
VMWARE_IP="192.168.1.170"
print_info "Hedef VMware IP: $VMWARE_IP"

# Gerçek IP adresini bul
CURRENT_IP=$(hostname -I | awk '{print $1}')
print_info "Mevcut IP: $CURRENT_IP"

# İşletim sistemi
print_info "OS: $(lsb_release -d | cut -f2)"

# VMware tools
if command -v vmware-toolbox-cmd &> /dev/null; then
    print_success "VMware Tools kurulu"
    vmware-toolbox-cmd -v
else
    print_warning "VMware Tools kurulu değil"
fi

echo ""
echo "========================================"
echo "🌐 NETWORK AYARLARI"
echo "========================================"

# Network interface bilgileri
print_info "Network interface'ler:"
ip addr show | grep -E "inet |inet6" | grep -v "127.0.0.1" | head -5

# Default gateway
print_info "Default gateway:"
ip route | grep default

# DNS ayarları
print_info "DNS ayarları:"
cat /etc/resolv.conf | grep nameserver

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

# Tüm açık portları göster
print_info "Tüm açık portlar:"
netstat -tlnp | grep LISTEN | head -10

echo ""
echo "========================================"
echo "🔥 PM2 DURUMU"
echo "========================================"

if command -v pm2 &> /dev/null; then
    print_info "PM2 durum listesi:"
    pm2 list
    
    echo ""
    print_info "PM2 muhasebe-backend logs (son 15 satır):"
    pm2 logs muhasebe-backend --lines 15 --nostream || print_error "PM2 log hatası"
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

# Nginx error log
print_info "Nginx error log (son 10 satır):"
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || print_warning "Nginx error log okunamadı"

echo ""
echo "========================================"
echo "🔥 FIREWALL DURUMU"
echo "========================================"

print_info "UFW durum:"
sudo ufw status

print_info "UFW rules:"
sudo ufw status numbered

echo ""
echo "========================================"
echo "📁 DOSYA KONTROLLERI"
echo "========================================"

# Proje dizini kontrol
if [ -d "/opt/muhasebedemo" ]; then
    print_success "Proje dizini mevcut: /opt/muhasebedemo"
    ls -la /opt/muhasebedemo/ | head -10
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
echo "🌐 VMWARE BAĞLANTI TESTLERİ"
echo "========================================"

# Localhost backend test
print_info "Backend health check (localhost):"
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend localhost'ta erişilebilir"
    curl -s http://localhost:3001/health | head -3
else
    print_error "Backend localhost'ta erişilemiyor!"
fi

# VMware IP backend test
print_info "Backend health check (VMware IP: $VMWARE_IP):"
if curl -s http://$VMWARE_IP/health > /dev/null; then
    print_success "Backend VMware IP'den erişilebilir"
    curl -s http://$VMWARE_IP/health | head -3
else
    print_error "Backend VMware IP'den erişilemiyor!"
fi

# Frontend test
print_info "Frontend test (VMware IP: $VMWARE_IP):"
if curl -s -I http://$VMWARE_IP | grep "200 OK" > /dev/null; then
    print_success "Frontend VMware IP'den erişilebilir"
else
    print_error "Frontend VMware IP'den erişilemiyor!"
    curl -s -I http://$VMWARE_IP | head -1
fi

# Local network connectivity test
print_info "Local network connectivity test:"
ping -c 2 192.168.1.1 > /dev/null && print_success "Gateway erişilebilir" || print_error "Gateway erişilemiyor"

echo ""
echo "========================================"
echo "🔧 VMWARE SPESİFİK KONTROLLER"
echo "========================================"

# VMware network adapter tipi
print_info "Network adapter bilgileri:"
cat /proc/net/dev | grep -E "ens|eth|eno" | head -3

# VMware shared folders (eğer varsa)
print_info "VMware shared folders:"
ls -la /mnt/hgfs/ 2>/dev/null || print_info "Shared folder yok veya mount edilmemiş"

# Memory ve CPU
print_info "Sistem kaynakları:"
free -h | head -2
nproc && echo "CPU cores"

echo ""
echo "========================================"
echo "📋 VMWARE ÖNERİLEN ÇÖZÜMLER"
echo "========================================"

echo "🔧 Backend çalışmıyorsa:"
echo "   pm2 restart muhasebe-backend"
echo "   pm2 logs muhasebe-backend"

echo ""
echo "🔧 Nginx çalışmıyorsa:"
echo "   sudo systemctl restart nginx"
echo "   sudo nginx -t"

echo ""
echo "🔧 Network sorunu varsa:"
echo "   sudo systemctl restart networking"
echo "   sudo systemctl restart NetworkManager"

echo ""
echo "🔧 VMware network ayarları:"
echo "   - VM'de Network Adapter'ı 'Bridged' mode'a al"
echo "   - Host-only veya NAT yerine Bridged kullan"
echo "   - VM'yi yeniden başlat"

echo ""
echo "🔧 IP adresi değişmişse:"
echo "   - /opt/muhasebedemo/backend/.env dosyasında CORS_ORIGIN güncelle"
echo "   - Nginx config'de server_name güncelle"
echo "   - pm2 restart muhasebe-backend"

echo ""
echo "🔧 Firewall sorunu varsa:"
echo "   sudo ufw allow from 192.168.1.0/24"
echo "   sudo ufw allow 80"
echo "   sudo ufw allow 3001"

echo ""
echo "🔧 Hızlı fix için:"
echo "   ./fix-server.sh"

echo ""
echo "📱 VMware Erişim URL'leri:"
echo "   Frontend: http://192.168.1.170"
echo "   Backend: http://192.168.1.170/api"
echo "   Health: http://192.168.1.170/health"

# IP adresi farklıysa uyarı
if [ "$CURRENT_IP" != "$VMWARE_IP" ]; then
    echo ""
    print_warning "UYARI: Mevcut IP ($CURRENT_IP) hedef IP'den ($VMWARE_IP) farklı!"
    print_warning "VM'nin static IP'si ayarlanmalı veya config dosyaları güncellenmelidir."
fi

echo ""
echo "🔍 VMware Debug tamamlandı!" 