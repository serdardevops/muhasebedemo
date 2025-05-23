@echo off
setlocal enabledelayedexpansion

:: Muhasebe Demo - Windows Kurulum Scripti
:: Bu script projeyi otomatik olarak kurar ve çalıştırır

title Muhasebe Demo - Kurulum

:: Renkli çıktı için
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

echo.
echo %BLUE%╔══════════════════════════════════════════════════════════════╗%NC%
echo %BLUE%║                    MUHASEBE DEMO                             ║%NC%
echo %BLUE%║              Otomatik Kurulum Scripti                       ║%NC%
echo %BLUE%║                                                              ║%NC%
echo %BLUE%║  Bu script projenizi otomatik olarak kuracak ve             ║%NC%
echo %BLUE%║  çalıştıracaktır. Lütfen bekleyiniz...                      ║%NC%
echo %BLUE%╚══════════════════════════════════════════════════════════════╝%NC%
echo.

:: Node.js kontrolü
echo %BLUE%[ADIM]%NC% Node.js kontrolü yapılıyor...
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Node.js bulunamadı!
    echo %YELLOW%⚠%NC% Node.js'i yüklemek için https://nodejs.org/ adresini ziyaret edin
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo %GREEN%✓%NC% Node.js bulundu: !NODE_VERSION!
)

:: npm kontrolü
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% npm bulunamadı!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo %GREEN%✓%NC% npm bulundu: v!NPM_VERSION!
)

:: Bağımlılıkları yükle
echo.
echo %BLUE%[ADIM]%NC% Proje bağımlılıkları yükleniyor...

echo %GREEN%✓%NC% Ana proje bağımlılıkları yükleniyor...
call npm install >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Ana proje bağımlılıkları yüklenemedi!
    pause
    exit /b 1
)

echo %GREEN%✓%NC% Backend bağımlılıkları yükleniyor...
cd backend
call npm install >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Backend bağımlılıkları yüklenemedi!
    pause
    exit /b 1
)
call npm install --save-dev tsconfig-paths >nul 2>&1
cd ..

echo %GREEN%✓%NC% Frontend bağımlılıkları yükleniyor...
cd frontend
call npm install --legacy-peer-deps >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Frontend bağımlılıkları yüklenemedi!
    pause
    exit /b 1
)
call npm install @tanstack/react-query-devtools >nul 2>&1
cd ..

echo %GREEN%✓%NC% Tüm bağımlılıklar başarıyla yüklendi!

:: Environment dosyası oluştur
echo.
echo %BLUE%[ADIM]%NC% Environment dosyaları ayarlanıyor...

if not exist "backend\.env" (
    echo %GREEN%✓%NC% Backend .env dosyası oluşturuluyor...
    (
        echo # Database ^(SQLite - Kolay başlangıç için^)
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # JWT
        echo JWT_SECRET="muhasebe-demo-super-secret-key-%RANDOM%"
        echo JWT_EXPIRES_IN="7d"
        echo.
        echo # Server
        echo PORT=3001
        echo NODE_ENV="development"
        echo.
        echo # CORS
        echo CORS_ORIGIN="http://localhost:3000"
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo.
        echo # Email ^(Opsiyonel^)
        echo SMTP_HOST="smtp.gmail.com"
        echo SMTP_PORT=587
        echo SMTP_USER=""
        echo SMTP_PASS=""
        echo.
        echo # File Upload
        echo MAX_FILE_SIZE=5242880
        echo UPLOAD_PATH="uploads/"
    ) > backend\.env
    echo %GREEN%✓%NC% .env dosyası oluşturuldu ^(SQLite veritabanı ile^)
) else (
    echo %YELLOW%⚠%NC% .env dosyası zaten mevcut, atlanıyor...
)

:: Veritabanını hazırla
echo.
echo %BLUE%[ADIM]%NC% Veritabanı hazırlanıyor...

cd backend

echo %GREEN%✓%NC% Prisma client oluşturuluyor...
call npx prisma generate >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Prisma client oluşturulamadı!
    pause
    exit /b 1
)

echo %GREEN%✓%NC% SQLite veritabanı oluşturuluyor...
call npx prisma db push >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Veritabanı oluşturulamadı!
    pause
    exit /b 1
)

cd ..

echo %GREEN%✓%NC% Veritabanı başarıyla hazırlandı!

:: Test build
echo.
echo %BLUE%[ADIM]%NC% Proje test ediliyor...

cd backend
echo %GREEN%✓%NC% Backend build test ediliyor...
call npm run build >nul 2>&1
if errorlevel 1 (
    echo %RED%✗%NC% Backend build başarısız!
    pause
    exit /b 1
)
cd ..

echo %GREEN%✓%NC% Proje başarıyla test edildi!

:: Tamamlandı mesajı
echo.
echo %GREEN%╔══════════════════════════════════════════════════════════════╗%NC%
echo %GREEN%║                    KURULUM TAMAMLANDI! 🎉                   ║%NC%
echo %GREEN%╚══════════════════════════════════════════════════════════════╝%NC%
echo.

echo %BLUE%Projenizi çalıştırmak için:%NC%
echo.
echo   %YELLOW%1. Tüm servisleri başlat:%NC%
echo      npm run dev
echo.
echo   %YELLOW%2. Sadece backend:%NC%
echo      npm run dev:backend
echo.
echo   %YELLOW%3. Sadece frontend:%NC%
echo      npm run dev:frontend
echo.
echo %BLUE%Erişim adresleri:%NC%
echo   • Frontend: http://localhost:3000
echo   • Backend API: http://localhost:3001
echo   • API Docs: http://localhost:3001/health
echo.
echo %BLUE%Veritabanı yönetimi:%NC%
echo   • Prisma Studio: cd backend ^&^& npx prisma studio
echo.
echo %BLUE%Yardım için:%NC%
echo   • README.md dosyasını okuyun
echo.
echo %GREEN%İyi çalışmalar! ��%NC%
echo.

pause 