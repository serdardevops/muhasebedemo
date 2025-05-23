# 🚀 Hızlı Başlangıç Kılavuzu

Bu kılavuz, Muhasebe Demo projesini 5 dakikada kurup çalıştırmanızı sağlar.

## 📋 Gereksinimler

Sadece **Node.js** yüklü olması yeterli:
- [Node.js İndir](https://nodejs.org/) (v18 veya üzeri)

## ⚡ Tek Komutla Kurulum

### macOS / Linux
```bash
chmod +x setup.sh && ./setup.sh
```

### Windows
```cmd
setup.bat
```

**Bu kadar!** 🎉 Script her şeyi otomatik olarak yapacak:
- ✅ Bağımlılıkları yükler
- ✅ Veritabanını hazırlar
- ✅ Ayarları yapar
- ✅ Projeyi test eder

## 🏃‍♂️ Çalıştırma

Kurulum tamamlandıktan sonra:

```bash
npm run dev
```

## 🌐 Erişim

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Veritabanı Yönetimi**: `cd backend && npx prisma studio`

## 🔧 Sorun Giderme

### Node.js Yüklü Değil
```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm

# Windows
# https://nodejs.org/ adresinden indirin
```

### Port Çakışması
Eğer 3000 veya 3001 portları kullanılıyorsa:

1. **Frontend portu değiştir**: `frontend/package.json` içinde `"start": "PORT=3002 react-scripts start"`
2. **Backend portu değiştir**: `backend/.env` içinde `PORT=3003`

### Veritabanı Sorunu
```bash
cd backend
rm dev.db  # Veritabanını sil
npx prisma db push  # Yeniden oluştur
```

## 📱 İlk Kullanım

1. **Kayıt Ol**: http://localhost:3000 adresinde yeni hesap oluştur
2. **Giriş Yap**: E-posta ve şifrenle giriş yap
3. **Keşfet**: Dashboard'u ve özellikleri incele

## 🆘 Yardım

- **Dokümantasyon**: [README.md](README.md)
- **API Testi**: http://localhost:3001/health
- **Hata Raporla**: GitHub Issues

---

**İpucu**: Geliştirme sırasında `npm run dev` komutu hem frontend hem backend'i aynı anda çalıştırır. 🚀 