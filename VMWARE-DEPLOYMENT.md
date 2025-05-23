# 🖥️ VMware Local Network Deployment Rehberi

## 🚀 VMware Ubuntu VM Kurulumu

### 📋 **Ön Gereksinimler**
- VMware Workstation/Player kurulu
- Ubuntu 20.04+ ISO dosyası
- Minimum 4GB RAM, 20GB disk
- Local network erişimi (192.168.1.x)

### 1️⃣ **VM Oluşturma**

#### **VM Ayarları:**
- **RAM**: 4GB (minimum 2GB)
- **Disk**: 20GB (thin provisioned)
- **CPU**: 2 core
- **Network**: **Bridged** mode (önemli!)

#### **Network Konfigürasyonu:**
```
VM Settings → Network Adapter → Bridged
```
⚠️ **NAT veya Host-only KULLANMA!** Sadece Bridged mode.

### 2️⃣ **Ubuntu Kurulumu**
```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# SSH server kurulumu (uzaktan erişim için)
sudo apt install openssh-server -y
sudo systemctl enable ssh
```

### 3️⃣ **Static IP Ayarlama (192.168.1.170)**

Ubuntu'da static IP ayarla:
```bash
# Network ayar dosyasını düzenle
sudo nano /etc/netplan/00-installer-config.yaml
```

**Netplan config:**
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:  # Network interface adı (ip addr ile kontrol et)
      dhcp4: false
      addresses:
        - 192.168.1.170/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

**Uygulamak için:**
```bash
sudo netplan apply
sudo reboot
```

---

## 🚀 Otomatik Deployment

### **Hızlı Kurulum (Tek Komut):**
```bash
# VMware deployment script'ini indir ve çalıştır
wget https://raw.githubusercontent.com/serdardevops/muhasebedemo/main/deploy-vmware.sh
chmod +x deploy-vmware.sh
./deploy-vmware.sh
```

Bu script otomatik olarak:
- ✅ Node.js, PM2, Nginx kurulumu
- ✅ Local network firewall ayarları
- ✅ Proje indirme ve kurulum
- ✅ Database kurulumu
- ✅ Production build
- ✅ PM2 ile backend başlatma
- ✅ Nginx reverse proxy konfigürasyonu
- ✅ VMware IP konfigürasyonu (192.168.1.170)

---

## 🔧 Manuel Kurulum

### 1️⃣ **Sistem Hazırlığı**
```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl wget git build-essential net-tools
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

### 3️⃣ **PM2 ve Nginx**
```bash
# PM2 global kurulumu
sudo npm install -g pm2

# Nginx kurulumu
sudo apt install -y nginx
```

### 4️⃣ **Firewall Ayarları (VMware için)**
```bash
# Local network erişimi
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
sudo ufw allow from 192.168.1.0/24
sudo ufw --force enable
```

### 5️⃣ **Proje Kurulumu**
```bash
# Proje dizini oluştur
sudo mkdir -p /opt/muhasebedemo
sudo chown $USER:$USER /opt/muhasebedemo
cd /opt/muhasebedemo

# GitHub'dan klonla
git clone https://github.com/serdardevops/muhasebedemo.git .

# Dependencies kur
npm install
```

### 6️⃣ **Backend Konfigürasyonu**
```bash
cd backend
cp env.example .env

# .env dosyasını VMware için düzenle
nano .env
```

**VMware .env dosyası:**
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-32-characters"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# CORS - VMware local network için
CORS_ORIGIN="http://localhost:3000,http://192.168.1.170:3000,http://192.168.1.170"

# Rate Limiting (Local network için esnek)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Local Network Settings
TRUST_PROXY=true
```

### 7️⃣ **Database ve Build**
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

### 8️⃣ **PM2 ile Backend Başlatma**
```bash
cd ../backend
pm2 start dist/index.js --name "muhasebe-backend"
pm2 save
pm2 startup
```

### 9️⃣ **Nginx Konfigürasyonu**
```bash
sudo nano /etc/nginx/sites-available/muhasebedemo
```

**Nginx config:**
```nginx
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
        
        # CORS headers for local network
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Nginx'i etkinleştir:**
```bash
sudo ln -s /etc/nginx/sites-available/muhasebedemo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🎯 VMware Erişim Bilgileri

### 📱 **Web Arayüzü**
- **VM içinden**: `http://localhost` veya `http://192.168.1.170`
- **Host bilgisayardan**: `http://192.168.1.170`
- **Aynı ağdaki diğer cihazlardan**: `http://192.168.1.170`

### 🔐 **Demo Hesap**
- **E-posta**: admin@demo.com
- **Şifre**: demo123

### 🔌 **API Endpoints**
- **Base URL**: `http://192.168.1.170/api`
- **Health Check**: `http://192.168.1.170/health`

---

## 🛠️ VMware Sorun Giderme

### **Debug Script Çalıştır:**
```bash
cd /opt/muhasebedemo
wget https://raw.githubusercontent.com/serdardevops/muhasebedemo/main/debug-vmware.sh
chmod +x debug-vmware.sh
./debug-vmware.sh
```

### **Yaygın Sorunlar:**

#### **❌ "Connection refused" Hatası:**
```bash
# VM'nin IP'sini kontrol et
ip addr show

# Network adapter Bridged modda mı?
# VMware → VM Settings → Network Adapter → Bridged

# Servisleri restart et
pm2 restart muhasebe-backend
sudo systemctl restart nginx
```

#### **❌ IP adresi farklı:**
```bash
# Mevcut IP'yi öğren
hostname -I

# .env dosyasını güncelle
nano /opt/muhasebedemo/backend/.env
# CORS_ORIGIN'i yeni IP ile güncelle

# Nginx config'i güncelle
sudo nano /etc/nginx/sites-available/muhasebedemo
# server_name'i yeni IP ile güncelle

# Servisleri restart et
pm2 restart muhasebe-backend
sudo systemctl restart nginx
```

#### **❌ Firewall problemi:**
```bash
# Local network erişimi aç
sudo ufw allow from 192.168.1.0/24
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

#### **❌ VM ağ bağlantısı yok:**
```bash
# Network restart
sudo systemctl restart networking
sudo systemctl restart NetworkManager

# VM'yi yeniden başlat
sudo reboot
```

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

# Monitoring
pm2 monit
```

### **Nginx Komutları**
```bash
# Durum kontrol
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Konfigürasyon test
sudo nginx -t
```

### **Network Komutları**
```bash
# IP adresini görüntüle
ip addr show

# Network bağlantısını test et
ping 192.168.1.1

# Port durumunu kontrol et
netstat -tlnp | grep -E ':80|:3001'
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

## 🔒 VMware Güvenlik Önerileri

### **Local Network Güvenliği**
```bash
# Sadece local network erişimi
sudo ufw allow from 192.168.1.0/24
sudo ufw deny from any to any port 22  # SSH'i sınırla
sudo ufw allow from 192.168.1.0/24 to any port 22
```

### **VM Snapshot**
- Deployment'tan sonra VM snapshot'ı al
- Düzenli backup yapın
- Sistem güncellemelerinden önce snapshot al

### **Resource Monitoring**
```bash
# Sistem kaynaklarını izle
htop
free -h
df -h
```

---

## 🎉 VMware Deployment Tamamlandı!

✅ **Sistem başarıyla kuruldu!**
- **Frontend**: Nginx ile serve ediliyor
- **Backend**: PM2 ile çalışıyor  
- **Database**: SQLite (lokal network için ideal)
- **Network**: Bridged mode ile local network erişimi
- **IP**: 192.168.1.170 static IP

### **Host Bilgisayardan Erişim:**
🌐 **http://192.168.1.170**

### **Sorun Giderme:**
🔧 `./debug-vmware.sh` veya `./fix-server.sh` 