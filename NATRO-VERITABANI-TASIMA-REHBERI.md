# SUPABASE'DEN NATRO'YA VERİTABANI TAŞIMA REHBERİ

## 📋 GENEL BİLGİ

Mevcut Sistem:
- **Veritabanı**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Tablo Sayısı**: 21 tablo
- **Platform**: Next.js + Vercel

Hedef Sistem:
- **Hosting**: Natro
- **Veritabanı Seçenekleri**: MySQL veya PostgreSQL

---

## 🎯 NATRO'DA VERİTABANI SEÇENEKLERİ

### SEÇENEK 1: MySQL (ÖNERİLEN)
Natro'da MySQL desteği daha yaygın ve stabil. Sınırsız veritabanı hakkınız varsa MySQL kullanabilirsiniz.

### SEÇENEK 2: PostgreSQL 
Eğer Natro'da PostgreSQL desteği varsa, mevcut yapınızı koruyarak daha kolay geçiş yapabilirsiniz.

---

## 📦 HAZIRLIK AŞAMASI

### 1. Mevcut Verilerin Yedeğini Alın

```bash
# Supabase Dashboard'dan backup alın
# Veya pg_dump kullanın:
pg_dump postgresql://postgres:08513628-JUst@db.wcutymcedxgeyrnpuyvt.supabase.co:5432/postgres > backup.sql
```

### 2. Natro Panel'den Veritabanı Oluşturun

1. Natro cPanel'e giriş yapın
2. "MySQL Veritabanları" veya "PostgreSQL Veritabanları" bölümüne gidin
3. Yeni veritabanı oluşturun:
   - Veritabanı Adı: `modabase` (veya istediğiniz isim)
   - Kullanıcı Adı: `modabase_user`
   - Şifre: Güçlü bir şifre belirleyin
4. Kullanıcıya TÜM YETKİLERİ verin

### 3. Veritabanı Bağlantı Bilgileri

Natro'dan alacağınız bilgiler:
- **Host**: genellikle `localhost` veya `mysql.siteniz.com`
- **Port**: MySQL için 3306, PostgreSQL için 5432
- **Database**: oluşturduğunuz veritabanı adı
- **Username**: oluşturduğunuz kullanıcı adı
- **Password**: belirlediğiniz şifre

---

## 🔧 SEÇENEK A: MySQL'E GEÇİŞ (ÖNERİLEN)

### 1. Prisma Schema'yı MySQL'e Uyarlayın

`prisma/schema-mysql.prisma` adında yeni bir dosya oluşturun:

```prisma
generator client {
  provider     = "prisma-client-js"
  engineType   = "binary"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "mysql"  // PostgreSQL yerine MySQL
  url      = env("DATABASE_URL")
}

// Model tanımlarınız aynı kalacak, sadece bazı veri tipleri değişebilir
// Örneğin: String @db.Text gibi eklemeler gerekebilir uzun metinler için
```

### 2. Environment Değişkenlerini Güncelleyin

`.env.production` dosyasını oluşturun:

```env
# Natro MySQL Bağlantısı
DATABASE_URL="mysql://modabase_user:SİFRENİZ@localhost:3306/modabase"

# Alternatif format (eğer üstteki çalışmazsa):
# DATABASE_URL="mysql://kullanıcı:şifre@host:port/veritabanı?ssl-mode=REQUIRED"
```

### 3. Veri Taşıma Scripti

`scripts/migrate-to-mysql.js` dosyası oluşturun:

```javascript
// PostgreSQL'den MySQL'e veri taşıma scripti
const { PrismaClient: PostgresClient } = require('@prisma/client');
const { PrismaClient: MySQLClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Farklı env dosyaları yükleyin
dotenv.config({ path: '.env.supabase' }); // Eski Supabase bağlantısı
const postgresDb = new PostgresClient({
  datasources: {
    db: { url: process.env.SUPABASE_DATABASE_URL }
  }
});

dotenv.config({ path: '.env.natro' }); // Yeni Natro bağlantısı
const mysqlDb = new MySQLClient({
  datasources: {
    db: { url: process.env.NATRO_DATABASE_URL }
  }
});

async function migrateData() {
  console.log('Veri taşıma başlıyor...');

  try {
    // 1. Kullanıcıları taşı
    console.log('Kullanıcılar taşınıyor...');
    const users = await postgresDb.user.findMany();
    for (const user of users) {
      await mysqlDb.user.create({ data: user });
    }
    console.log(`✓ ${users.length} kullanıcı taşındı`);

    // 2. Kategorileri taşı
    console.log('Kategoriler taşınıyor...');
    const categories = await postgresDb.category.findMany();
    for (const category of categories) {
      await mysqlDb.category.create({ data: category });
    }
    console.log(`✓ ${categories.length} kategori taşındı`);

    // 3. Ürünleri taşı
    console.log('Ürünler taşınıyor...');
    const products = await postgresDb.product.findMany();
    for (const product of products) {
      await mysqlDb.product.create({ data: product });
    }
    console.log(`✓ ${products.length} ürün taşındı`);

    // 4. Siparişleri taşı
    console.log('Siparişler taşınıyor...');
    const orders = await postgresDb.order.findMany({
      include: { items: true }
    });
    for (const order of orders) {
      const { items, ...orderData } = order;
      const createdOrder = await mysqlDb.order.create({ data: orderData });
      
      // Sipariş kalemlerini taşı
      for (const item of items) {
        await mysqlDb.orderItem.create({
          data: {
            ...item,
            orderId: createdOrder.id
          }
        });
      }
    }
    console.log(`✓ ${orders.length} sipariş taşındı`);

    // Diğer tablolar için benzer işlemler...

    console.log('✅ Tüm veriler başarıyla taşındı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await postgresDb.$disconnect();
    await mysqlDb.$disconnect();
  }
}

migrateData();
```

### 4. MySQL Veritabanını Hazırlayın

```bash
# Schema'yı MySQL'e push edin
npx prisma db push --schema=./prisma/schema-mysql.prisma

# Migration scripti çalıştırın
node scripts/migrate-to-mysql.js
```

---

## 🔧 SEÇENEK B: PostgreSQL KULLANMAYA DEVAM

Eğer Natro'da PostgreSQL desteği varsa:

### 1. Natro'da PostgreSQL Veritabanı Oluşturun

### 2. Backup'ı Yeni Veritabanına Yükleyin

```bash
# Natro PostgreSQL'e bağlanın ve backup'ı yükleyin
psql -h natro_host -U kullanıcı_adı -d veritabanı_adı < backup.sql
```

### 3. Environment Değişkenini Güncelleyin

```env
DATABASE_URL="postgresql://kullanıcı:şifre@natro_host:5432/veritabanı_adı"
```

---

## 🚀 UYGULAMA DEPLOYMENT

### 1. Natro'da Node.js Hosting Ayarları

```bash
# .htaccess dosyası (Apache için)
RewriteEngine On
RewriteRule ^$ http://localhost:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### 2. PM2 ile Uygulamayı Başlatın

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'modabase',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'mysql://...',
      NEXTAUTH_URL: 'https://siteniz.com',
      NEXTAUTH_SECRET: 'güvenli-secret-key'
    }
  }]
};
```

### 3. Başlatma Komutları

```bash
# Bağımlılıkları yükleyin
npm install

# Prisma client oluşturun
npx prisma generate

# Build alın
npm run build

# PM2 ile başlatın
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Veri Tipleri Uyumluluğu
- PostgreSQL `TEXT` → MySQL `LONGTEXT`
- PostgreSQL `SERIAL` → MySQL `AUTO_INCREMENT`
- PostgreSQL `BOOLEAN` → MySQL `TINYINT(1)`
- PostgreSQL Arrays → MySQL JSON

### 2. Güvenlik
- Tüm şifreleri güçlü yapın
- SSL bağlantısını aktif edin
- Firewall kurallarını ayarlayın
- Regular backup alın

### 3. Test Süreci
1. Önce TEST veritabanında deneyin
2. Tüm fonksiyonları test edin
3. Performansı kontrol edin
4. Sonra production'a geçin

### 4. DNS Ayarları
Natro'dan alacağınız IP adresini domain DNS ayarlarınıza ekleyin:
- A Record: @ → Natro IP
- A Record: www → Natro IP

---

## 🔍 SORUN GİDERME

### Problem: Bağlantı hatası
```bash
# Bağlantıyı test edin
mysql -h host -u kullanıcı -p veritabanı
```

### Problem: Karakter encoding
```sql
-- MySQL'de UTF8 ayarlayın
ALTER DATABASE modabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Problem: Timeout hataları
```javascript
// Prisma connection pool ayarları
datasources: {
  db: {
    url: process.env.DATABASE_URL,
    connection_limit: 5,
    connect_timeout: 10
  }
}
```

---

## 📞 NATRO İLE İLETİŞİM

Taşıma işlemi için Natro destek ekibinden yardım alabilirsiniz:

1. **PostgreSQL Desteği**: PostgreSQL var mı sorun
2. **Node.js Versiyon**: Node.js 18+ desteği
3. **Port İzinleri**: 3000 portu için izin
4. **SSL Sertifikası**: Let's Encrypt desteği
5. **Backup İmkanları**: Otomatik backup

---

## ✅ KONTROL LİSTESİ

- [ ] Supabase'den tam backup alındı
- [ ] Natro'da veritabanı oluşturuldu
- [ ] Schema MySQL'e uyarlandı (MySQL seçtiyseniz)
- [ ] Veriler başarıyla taşındı
- [ ] Environment değişkenleri güncellendi
- [ ] Uygulama Natro'da çalışıyor
- [ ] DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] Tüm fonksiyonlar test edildi
- [ ] Backup sistemi kuruldu

---

## 🎯 TAHMİNİ SÜRE

- Hazırlık: 1-2 saat
- Veri taşıma: 2-4 saat (veri miktarına göre)
- Test: 2-3 saat
- DNS propagasyonu: 24-48 saat

**Toplam**: 1-2 gün

---

## 💡 TAVSİYELER

1. **Önce test ortamında deneyin**
2. **Müşterilerinizi bilgilendirin** (bakım saati)
3. **Eski sistemi hemen kapatmayın** (1 hafta bekleyin)
4. **Düzenli backup alın**
5. **Monitoring kurun** (uptime, performans)

Bu rehberi takip ederek Supabase'den Natro'ya sorunsuz geçiş yapabilirsiniz!
