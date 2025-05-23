# 🔧 Sorun Giderme Kılavuzu

Bu kılavuz, Muhasebe Demo projesinde karşılaşabileceğiniz yaygın sorunları ve çözümlerini içerir.

## 🚨 Yaygın Sorunlar

### 1. Node.js Bulunamadı

**Hata**: `node: command not found` veya `'node' is not recognized`

**Çözüm**:
```bash
# macOS (Homebrew ile)
brew install node

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Windows
# https://nodejs.org/ adresinden indirip yükleyin
```

**Kontrol**:
```bash
node --version  # v18.0.0 veya üzeri olmalı
npm --version   # 8.0.0 veya üzeri olmalı
```

### 2. Port Çakışması

**Hata**: `Error: listen EADDRINUSE :::3000` veya `Port 3001 is already in use`

**Çözüm**:

#### Frontend Portu Değiştirme (3000 → 3002)
```bash
# frontend/package.json dosyasını düzenleyin
"scripts": {
  "start": "PORT=3002 react-scripts start"
}

# Windows için
"start": "set PORT=3002 && react-scripts start"
```

#### Backend Portu Değiştirme (3001 → 3003)
```bash
# backend/.env dosyasını düzenleyin
PORT=3003
```

### 3. Bağımlılık Yükleme Hataları

**Hata**: `npm ERR!` veya paket yükleme sorunları

**Çözüm**:
```bash
# npm cache temizle
npm cache clean --force

# node_modules ve package-lock.json sil
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Yeniden yükle
npm install
```

### 4. Veritabanı Sorunları

**Hata**: `PrismaClientInitializationError` veya veritabanı bağlantı hatası

**Çözüm**:
```bash
cd backend

# Veritabanını sıfırla
rm -f dev.db

# Prisma client yeniden oluştur
npx prisma generate
npx prisma db push

# Veritabanı durumunu kontrol et
npx prisma studio
```

### 5. TypeScript Build Hataları

**Hata**: `TS2322` veya TypeScript derleme hataları

**Çözüm**:
```bash
cd backend

# TypeScript cache temizle
rm -rf dist
rm -rf node_modules/.cache

# Yeniden build et
npm run build
```

### 6. CORS Hataları

**Hata**: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Çözüm**:
```bash
# backend/.env dosyasını kontrol edin
CORS_ORIGIN="http://localhost:3000"

# Eğer frontend farklı portta çalışıyorsa
CORS_ORIGIN="http://localhost:3002"
```

### 7. JWT Token Hataları

**Hata**: `JsonWebTokenError` veya authentication sorunları

**Çözüm**:
```bash
# backend/.env dosyasında JWT_SECRET kontrol edin
JWT_SECRET="your-secret-key-here"

# Tarayıcı localStorage temizle
# F12 → Application → Local Storage → Clear All
```

## 🔍 Hata Ayıklama

### Log Kontrolü

#### Backend Logları
```bash
cd backend
npm run dev

# Detaylı loglar için
DEBUG=* npm run dev
```

#### Frontend Logları
```bash
cd frontend
npm start

# Tarayıcı console'u kontrol edin (F12)
```

### Veritabanı Kontrolü
```bash
cd backend
npx prisma studio
# http://localhost:5555 adresinde açılır
```

### API Test
```bash
# Health check
curl http://localhost:3001/health

# Postman veya Thunder Client kullanın
```

## 🛠️ Sıfırlama Komutları

### Tam Sıfırlama
```bash
# Tüm bağımlılıkları ve cache'i temizle
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json backend/dist backend/dev.db
rm -rf frontend/node_modules frontend/package-lock.json frontend/build

# Yeniden kur
./setup.sh  # veya setup.bat (Windows)
```

### Sadece Veritabanı Sıfırlama
```bash
cd backend
rm -f dev.db
npx prisma db push
```

### Sadece Frontend Sıfırlama
```bash
cd frontend
rm -rf node_modules package-lock.json build
npm install
```

## 🌐 Platform Özel Sorunlar

### macOS
```bash
# Xcode Command Line Tools gerekebilir
xcode-select --install

# Homebrew ile Node.js
brew install node
```

### Windows
```bash
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Windows Build Tools (gerekirse)
npm install --global windows-build-tools
```

### Linux (Ubuntu/Debian)
```bash
# Build essentials
sudo apt install build-essential

# Node.js repository ekle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 📞 Yardım Alma

### 1. Hata Mesajını Kopyalayın
- Tam hata mesajını kopyalayın
- Hangi adımda hata aldığınızı belirtin

### 2. Sistem Bilgilerini Toplayın
```bash
node --version
npm --version
cat /etc/os-release  # Linux
sw_vers              # macOS
ver                   # Windows
```

### 3. İletişim
- **GitHub Issues**: Hata raporu oluşturun
- **README.md**: Dokümantasyonu tekrar okuyun
- **HIZLI-BASLANGIC.md**: Basit kurulum kılavuzu

## ✅ Başarı Kontrol Listesi

Kurulum başarılı ise:
- [ ] `node --version` çalışıyor (v18+)
- [ ] `npm --version` çalışıyor
- [ ] `npm run dev` hatasız çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] http://localhost:3001/health JSON döndürüyor
- [ ] Kayıt/giriş sayfası görünüyor

---

**İpucu**: Çoğu sorun `./setup.sh` (veya `setup.bat`) scriptini yeniden çalıştırarak çözülür! 🚀 