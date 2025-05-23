# 🐧 Ubuntu Server Deployment Rehberi

## 🚀 Hızlı Kurulum (Otomatik)

### 1️⃣ **Ubuntu Server'a Bağlan**
```bash
ssh your-username@your-server-ip
```

### 2️⃣ **Deployment Script'ini İndir ve Çalıştır**
```bash
# GitHub repository'nden deployment script'ini indir
wget https://raw.githubusercontent.com/YOUR_USERNAME/muhasebedemo/main/deploy-ubuntu.sh

# Script'i çalıştırılabilir yap
chmod +x deploy-ubuntu.sh

# Deployment'ı başlat
./deploy-ubuntu.sh
```

Bu script otomatik olarak:
- ✅ Node.js, PM2, Nginx kurulumu
- ✅ Firewall ayarları
- ✅ Proje indirme ve kurulum
- ✅ Database kurulumu
- ✅ Production build
- ✅ PM2 ile backend başlatma
- ✅ Nginx reverse proxy konfigürasyonu

---

## 🔧 Manuel Kurulum

### 1️⃣ **Sistem Hazırlığı**
```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl wget git build-essential
```

### 2️⃣ **Node.js Kurulumu**
```bash
# Node.js v18+ kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Sürüm kontrolü
node --version
npm --version
```

### 3️⃣ **PM2 Process Manager**
```bash
# PM2 global kurulumu
sudo npm install -g pm2
```

### 4️⃣ **Nginx Web Server**
```bash
# Nginx kurulumu
sudo apt install -y nginx

# Firewall ayarları
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 5️⃣ **Proje Kurulumu**
```bash
# Proje dizini oluştur
sudo mkdir -p /opt/muhasebedemo
sudo chown $USER:$USER /opt/muhasebedemo
cd /opt/muhasebedemo

# GitHub'dan klonla
git clone https://github.com/YOUR_USERNAME/muhasebedemo.git .

# Dependencies kur
npm install
```

### 6️⃣ **Backend Konfigürasyonu**
```bash
cd backend

# Environment dosyası oluştur
cp env.example .env

# .env dosyasını düzenle
nano .env
```

**Environment dosyası içeriği:**
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-32-characters"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="production"
CORS_ORIGIN="http://your-server-ip:3000,http://localhost:3000"
```

### 7️⃣ **Database Kurulumu**
```bash
# Prisma generate ve database push
npx prisma generate
npx prisma db push

# Backend build
npm run build
```

### 8️⃣ **Frontend Build**
```bash
cd ../frontend
npm install
npm run build
```

### 9️⃣ **PM2 ile Backend Başlatma**
```bash
cd ../backend

# PM2 ile başlat
pm2 start dist/index.js --name "muhasebe-backend"

# PM2 konfigürasyonunu kaydet
pm2 save

# Sistem başlangıcında otomatik başlatma
pm2 startup
```

### 🔟 **Nginx Konfigürasyonu**
```bash
# Nginx site konfigürasyonu oluştur
sudo nano /etc/nginx/sites-available/muhasebedemo
```

**Nginx konfigürasyonu:**
```nginx
server {
    listen 80;
    server_name your-server-ip localhost;

    # Frontend (React build)
    location / {
        root /opt/muhasebedemo/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Nginx'i etkinleştir:**
```bash
# Site'ı etkinleştir
sudo ln -s /etc/nginx/sites-available/muhasebedemo /etc/nginx/sites-enabled/

# Default site'ı kaldır
sudo rm /etc/nginx/sites-enabled/default

# Konfigürasyonu test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🎯 Erişim Bilgileri

### 📱 **Web Arayüzü**
- **URL**: `http://your-server-ip`
- **Demo Hesap**: admin@demo.com / demo123

### 🔌 **API Endpoints**
- **Base URL**: `http://your-server-ip/api`
- **Health Check**: `http://your-server-ip/health`

---

## 📋 Yönetim Komutları

### **PM2 Komutları**
```bash
# Durum kontrol
pm2 status

# Logları görüntüle
pm2 logs muhasebe-backend

# Restart
pm2 restart muhasebe-backend

# Stop
pm2 stop muhasebe-backend

# Monitoring
pm2 monit
```

### **Nginx Komutları**
```bash
# Durum kontrol
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Reload (konfigürasyon değişikliği sonrası)
sudo systemctl reload nginx

# Konfigürasyon test
sudo nginx -t
```

### **Sistem Logları**
```bash
# PM2 logs
pm2 logs --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

---

## 🔧 Güncelleme İşlemi

```bash
# Proje dizinine git
cd /opt/muhasebedemo

# GitHub'dan güncellemeleri çek
git pull origin main

# Dependencies güncelle
npm install

# Backend build
cd backend && npm run build

# Frontend build
cd ../frontend && npm run build

# Backend'i restart et
pm2 restart muhasebe-backend
```

---

## 🛠️ Sorun Giderme

### **Backend Çalışmıyor**
```bash
# PM2 status kontrol
pm2 status

# Logları kontrol et
pm2 logs muhasebe-backend

# Manuel başlat
cd /opt/muhasebedemo/backend
pm2 start dist/index.js --name "muhasebe-backend"
```

### **Frontend Erişim Problemi**
```bash
# Nginx status kontrol
sudo systemctl status nginx

# Nginx konfigürasyonu test
sudo nginx -t

# Build dosyaları kontrol
ls -la /opt/muhasebedemo/frontend/build/
```

### **Database Problemi**
```bash
# Database dosyası kontrol
ls -la /opt/muhasebedemo/backend/prisma/

# Prisma reset
cd /opt/muhasebedemo/backend
npx prisma db push --force-reset
```

### **Port Problemi**
```bash
# Portları kontrol et
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80

# Process'leri öldür
sudo killall node
pm2 kill
```

---

## 🔒 Güvenlik Önerileri

### **Firewall**
```bash
# Sadece gerekli portları aç
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### **SSL/HTTPS (Certbot)**
```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d your-domain.com
```

### **Database Güvenliği**
- Production'da PostgreSQL kullan
- Database password'u güçlü yapın
- Düzenli backup alın

---

## 📊 Performance İzleme

### **PM2 Monitoring**
```bash
# PM2 web dashboard
pm2 web

# Resource monitoring
pm2 monit
```

### **System Resources**
```bash
# CPU/Memory kullanımı
htop

# Disk kullanımı
df -h

# Network bağlantıları
ss -tlnp
```

---

## 🎉 Deployment Tamamlandı!

✅ **Sistem başarıyla kuruldu!**
- Frontend: Nginx ile serve ediliyor
- Backend: PM2 ile çalışıyor
- Database: SQLite (Production için PostgreSQL önerilir)
- Reverse Proxy: Nginx
- Process Manager: PM2 