#!/bin/bash

# NATRO DEPLOYMENT SCRIPT
# =======================
# Bu script Natro hosting'e deployment için kullanılır

echo "🚀 ModaBase Natro Deployment Başlıyor..."
echo "======================================="

# 1. Environment dosyasını kontrol et
if [ ! -f .env.production ]; then
    echo "❌ HATA: .env.production dosyası bulunamadı!"
    echo "📝 natro-env-example.txt dosyasını .env.production olarak kopyalayın ve düzenleyin."
    exit 1
fi

# 2. Node version kontrolü
echo "📌 Node.js versiyonu kontrol ediliyor..."
node_version=$(node -v)
echo "Node versiyonu: $node_version"

# Node 18+ gerekli
required_version=18
current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$current_version" -lt "$required_version" ]; then
    echo "⚠️ UYARI: Node.js 18 veya üzeri gerekli. Mevcut: $node_version"
fi

# 3. Dependencies yükle
echo ""
echo "📦 Bağımlılıklar yükleniyor..."
npm ci --production=false

# 4. Prisma setup
echo ""
echo "🔧 Prisma setup yapılıyor..."

# MySQL schema'sını kullan
cp prisma/schema-mysql.prisma prisma/schema.prisma

# Prisma generate
npx prisma generate

# 5. Database migration
echo ""
echo "🗄️ Veritabanı migration..."
read -p "Veritabanını sıfırlamak istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Veritabanı push ediliyor..."
    npx prisma db push --skip-generate
else
    echo "Migration atlandı."
fi

# 6. Build application
echo ""
echo "🔨 Uygulama build ediliyor..."
npm run build

# 7. Test build
echo ""
echo "🧪 Build test ediliyor..."
npm run start &
BUILD_PID=$!
sleep 10

# Test if server is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Build başarılı!"
    kill $BUILD_PID
else
    echo "❌ Build başarısız!"
    kill $BUILD_PID
    exit 1
fi

# 8. PM2 Setup
echo ""
echo "⚙️ PM2 setup..."

# PM2 yüklü mü kontrol et
if ! command -v pm2 &> /dev/null; then
    echo "PM2 yükleniyor..."
    npm install -g pm2
fi

# Eski process varsa durdur
pm2 stop modabase 2>/dev/null || true
pm2 delete modabase 2>/dev/null || true

# Yeni process başlat
echo "PM2 ile uygulama başlatılıyor..."
pm2 start natro-deployment/ecosystem.config.js

# PM2 startup
pm2 startup
pm2 save

# 9. Log klasörü oluştur
mkdir -p logs

echo ""
echo "================================"
echo "✅ DEPLOYMENT TAMAMLANDI!"
echo "================================"
echo ""
echo "📊 Durum kontrol komutları:"
echo "  pm2 status        - Process durumu"
echo "  pm2 logs          - Logları görüntüle"
echo "  pm2 monit         - Monitoring"
echo "  pm2 restart all   - Restart"
echo ""
echo "🌐 Uygulama: http://localhost:3000"
echo ""
echo "⚠️ ÖNEMLİ: Apache/Nginx proxy ayarlarını yapmayı unutmayın!"
