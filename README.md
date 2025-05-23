# Muhasebe Demo - Localhost Muhasebe Sistemi

Bu proje, küçük ve orta ölçekli işletmeler için geliştirilmiş **sadece localhost'ta çalışan** kapsamlı bir ön muhasebe sistemidir. Sistem tamamen yerel ağda çalışır ve internet erişimi gerektirmez.

## 🔒 Güvenlik Özellikleri

- **Sadece Localhost Erişimi**: Sistem yalnızca `localhost` ve `127.0.0.1` adreslerinden erişilebilir
- **İnternet Erişimi Yok**: Dış ağdan hiçbir erişim mümkün değildir
- **JWT Tabanlı Kimlik Doğrulama**: Güvenli oturum yönetimi
- **Şifrelenmiş Parolalar**: bcrypt ile hash'lenmiş parolalar
- **Rate Limiting**: API isteklerinde hız sınırlaması

## 🚀 Özellikler

### ✅ Aktif Modüller
- **Kimlik Doğrulama**: Kullanıcı girişi ve kayıt sistemi
- **Dashboard**: Genel bakış ve istatistikler
- **Müşteri Yönetimi**: Müşteri CRUD işlemleri

### 🔄 Geliştirme Aşamasındaki Modüller
- **Tedarikçi Yönetimi**: Tedarikçi kayıtları ve işlemleri
- **Ürün/Stok Yönetimi**: Ürün kataloğu ve stok takibi
- **Fatura Yönetimi**: Satış/alış faturaları ve PDF oluşturma
- **Gelir/Gider İşlemleri**: Mali işlem kayıtları
- **Raporlama**: Mali raporlar ve analizler

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **Prisma ORM** + **SQLite** (geliştirme)
- **JWT** kimlik doğrulama
- **bcryptjs** parola şifreleme
- **Helmet.js** güvenlik başlıkları

### Frontend
- **React 19** + **TypeScript**
- **Tailwind CSS** responsive tasarım
- **React Query** veri yönetimi
- **React Router** sayfa yönlendirme
- **React Hook Form** form yönetimi

## 📋 Sistem Gereksinimleri

- **Node.js** v18 veya üzeri
- **npm** v8 veya üzeri
- **macOS**, **Linux** veya **Windows**

## ⚡ Hızlı Kurulum

### 1. Otomatik Kurulum (Önerilen)

```bash
# macOS/Linux için
./setup.sh

# Windows için
setup.bat

# Detaylı hata raporlaması ile (macOS/Linux)
./setup-verbose.sh
```

### 2. Manuel Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Veritabanını hazırla
cd backend && npx prisma generate && npx prisma db push

# Geliştirme sunucularını başlat
npm start
```

## 🌐 Erişim Bilgileri

### Uygulama URL'leri
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

### Demo Hesap Bilgileri
- **E-posta**: admin@demo.com
- **Şifre**: demo123
- **Rol**: Admin

## 📁 Proje Yapısı

```
muhasebedemo/
├── backend/                 # Node.js API sunucusu
│   ├── src/
│   │   ├── controllers/     # API kontrolcüleri
│   │   ├── routes/         # API rotaları
│   │   ├── middleware/     # Ara yazılımlar
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   └── types/          # TypeScript tipleri
│   ├── prisma/             # Veritabanı şeması
│   └── package.json
├── frontend/               # React uygulaması
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── contexts/       # React context'leri
│   │   └── services/       # API servisleri
│   └── package.json
├── setup.sh               # macOS/Linux kurulum scripti
├── setup.bat              # Windows kurulum scripti
└── package.json           # Ana proje dosyası
```

## 🔧 Geliştirme Komutları

```bash
# Tüm servisleri başlat
npm start
npm run dev

# Sadece backend'i başlat
npm run dev:backend

# Sadece frontend'i başlat
npm run dev:frontend

# Veritabanını sıfırla
cd backend && npx prisma db push --force-reset

# TypeScript kontrolü
npm run type-check
```

## 📊 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/me` - Kullanıcı profili
- `POST /api/auth/logout` - Çıkış

### Müşteriler
- `GET /api/customers` - Müşteri listesi
- `POST /api/customers` - Yeni müşteri
- `PUT /api/customers/:id` - Müşteri güncelle
- `DELETE /api/customers/:id` - Müşteri sil

### Diğer Modüller (Geliştirme Aşamasında)
- `/api/suppliers` - Tedarikçiler
- `/api/products` - Ürünler
- `/api/invoices` - Faturalar
- `/api/transactions` - İşlemler

## 🔐 Güvenlik Yapılandırması

### CORS Ayarları
```javascript
// Sadece localhost erişimine izin verilir
origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
```

### Rate Limiting
- **15 dakikada 100 istek** sınırı
- IP bazlı sınırlama

### Güvenlik Başlıkları
- Helmet.js ile otomatik güvenlik başlıkları
- XSS koruması
- CSRF koruması

## 🐛 Sorun Giderme

### Port Çakışması
```bash
# Kullanılan portları kontrol et
lsof -i :3000
lsof -i :3001

# İşlemleri sonlandır
kill -9 <PID>
```

### Veritabanı Sorunları
```bash
# Veritabanını sıfırla
cd backend
rm -f prisma/dev.db
npx prisma db push
```

### Node.js Sürüm Kontrolü
```bash
# Node.js sürümünü kontrol et
node --version  # v18+ gerekli
npm --version   # v8+ gerekli
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `SORUN-GIDERME.md` dosyasını kontrol edin
2. GitHub Issues bölümünde yeni bir issue açın
3. Detaylı hata loglarını paylaşın

---

**Not**: Bu sistem sadece localhost'ta çalışacak şekilde tasarlanmıştır ve production ortamında kullanılmadan önce ek güvenlik önlemleri alınmalıdır. 