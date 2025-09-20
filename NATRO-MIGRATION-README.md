# 🚀 NATRO VERİTABANI MİGRASYON REHBERİ

## 📋 HIZLI BAŞLANGIÇ

Supabase'den Natro MySQL'e geçiş için adım adım rehber:

### ✅ ÖN GEREKSİNİMLER

1. **Natro Hosting Paketi:**
   - Sınırsız MySQL veritabanı hakkı
   - Node.js 18+ desteği
   - SSH erişimi (tercihen)

2. **Yerel Ortam:**
   - Node.js 18+
   - Git
   - MySQL client (opsiyonel)

---

## 📝 MİGRASYON ADIMLARI

### ADIM 1: NATRO'DA VERİTABANI OLUŞTURMA

1. **cPanel'e giriş yapın**
2. **MySQL Veritabanları** bölümüne gidin
3. **Yeni veritabanı oluşturun:**
   ```
   Veritabanı Adı: modabase_db
   ```
4. **Yeni kullanıcı oluşturun:**
   ```
   Kullanıcı Adı: modabase_user
   Şifre: [güçlü bir şifre]
   ```
5. **Kullanıcıyı veritabanına ekleyin** (TÜM YETKİLER ile)

### ADIM 2: ENVIRONMENT AYARLARI

1. **natro-env-example.txt** dosyasını **.env.natro** olarak kopyalayın:
   ```bash
   cp natro-env-example.txt .env.natro
   ```

2. **Natro bilgilerinizi girin:**
   ```env
   # Natro MySQL
   NATRO_DATABASE_URL="mysql://modabase_user:ŞİFRENİZ@localhost:3306/modabase_db"
   
   # Eski Supabase (backup için)
   SUPABASE_DATABASE_URL="postgresql://postgres:08513628-JUst@db.wcutymcedxgeyrnpuyvt.supabase.co:5432/postgres"
   ```

### ADIM 3: VERİLERİ YEDEKLEME

```bash
# Supabase'den tüm verileri JSON formatında yedekle
node scripts/natro-migration/backup-supabase.js
```

✅ Backup `scripts/natro-migration/backup/` klasöründe oluşacak

### ADIM 4: MYSQL SCHEMA OLUŞTURMA

```bash
# MySQL için Prisma schema'yı kullan
cp prisma/schema-mysql.prisma prisma/schema.prisma

# Schema'yı MySQL'e push et
DATABASE_URL=$NATRO_DATABASE_URL npx prisma db push --skip-generate
```

### ADIM 5: VERİLERİ TAŞIMA

```bash
# Backup'tan MySQL'e veri yükle
node scripts/natro-migration/restore-to-mysql.js
```

### ADIM 6: DOĞRULAMA

```bash
# Migration'ı doğrula
node scripts/natro-migration/verify-migration.js
```

---

## 🔧 NATRO'DA DEPLOYMENT

### 1. DOSYALARI YÜKLEME

**FTP/SFTP ile yükleyin:**
```
- Tüm proje dosyaları (node_modules hariç)
- .env.production dosyası
- natro-deployment/ klasörü
```

### 2. SSH İLE KURULUM (varsa)

```bash
# SSH'a bağlanın
ssh kullanici@sunucu.com

# Proje dizinine gidin
cd public_html

# Dependencies yükleyin
npm install

# Build alın
npm run build

# PM2 ile başlatın
pm2 start natro-deployment/ecosystem.config.js
```

### 3. cPanel Node.js App (SSH yoksa)

1. **cPanel > Setup Node.js App**
2. **Create Application:**
   - Node version: 18+
   - Application mode: Production
   - Application root: public_html
   - Application URL: siteniz.com
   - Application startup file: node_modules/next/dist/bin/next
3. **Run NPM Install**
4. **Run Script:** build
5. **Start App**

### 4. APACHE PROXY AYARLARI

**.htaccess** dosyasını public_html'e kopyalayın:
```bash
cp natro-deployment/.htaccess public_html/.htaccess
```

---

## 🧪 TEST KOMUTLARI

### Bağlantı Testi
```bash
node scripts/natro-migration/test-migration.js
```

### Veri Karşılaştırması
```bash
node scripts/natro-migration/verify-migration.js
```

### Yerel Test
```bash
# .env dosyasını natro ayarlarıyla güncelleyin
DATABASE_URL="mysql://..." npm run dev
```

---

## 🔍 SORUN GİDERME

### ❌ MySQL Bağlantı Hatası

**Çözüm:**
```bash
# MySQL bağlantısını test edin
mysql -h localhost -u modabase_user -p modabase_db

# Eğer localhost çalışmıyorsa 127.0.0.1 deneyin
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/db"
```

### ❌ Karakter Encoding Sorunu

**Çözüm:**
```sql
-- MySQL'de çalıştırın
ALTER DATABASE modabase_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ❌ Node.js Versiyon Sorunu

**Çözüm:**
```bash
# NVM varsa
nvm install 18
nvm use 18

# Yoksa Natro destek ile iletişime geçin
```

### ❌ PM2 Bulunamadı

**Çözüm:**
```bash
npm install -g pm2
# veya
npm install pm2 --save
npx pm2 start ecosystem.config.js
```

---

## 📊 MİGRASYON KONTROL LİSTESİ

- [ ] **Natro'da MySQL veritabanı oluşturuldu**
- [ ] **Environment değişkenleri ayarlandı**
- [ ] **Supabase backup alındı**
- [ ] **MySQL schema oluşturuldu**
- [ ] **Veriler MySQL'e taşındı**
- [ ] **Migration doğrulandı**
- [ ] **Uygulama Natro'ya yüklendi**
- [ ] **Build başarılı**
- [ ] **PM2 ile uygulama başlatıldı**
- [ ] **Apache proxy ayarları yapıldı**
- [ ] **DNS ayarları güncellendi**
- [ ] **SSL sertifikası aktif**
- [ ] **Site çalışıyor**

---

## 💡 İPUÇLARI

### 1. Aşamalı Geçiş
- Önce TEST ortamında deneyin
- Küçük veri setleriyle başlayın
- Tüm fonksiyonları test edin

### 2. Performans
- MySQL indeksleri kontrol edin
- Query cache'i aktifleştirin
- CDN kullanmayı düşünün

### 3. Güvenlik
- Güçlü şifreler kullanın
- .env dosyalarını public_html dışında tutun
- Regular backup alın

### 4. Monitoring
```bash
# PM2 monitoring
pm2 monit
pm2 logs
pm2 status

# MySQL monitoring
SHOW PROCESSLIST;
SHOW STATUS;
```

---

## 📞 DESTEK

### Natro Destek
- **MySQL kurulum yardımı**
- **Node.js versiyon güncelleme**
- **Port açma (3000)**
- **SSL sertifikası**

### Teknik Sorular
- Prisma Docs: https://www.prisma.io/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- PM2 Docs: https://pm2.keymetrics.io/docs

---

## 🎉 BAŞARILI MİGRASYON SONRASI

1. **Eski Supabase projesini 1 hafta bekletin** (acil durumlar için)
2. **DNS propagasyonu için 24-48 saat bekleyin**
3. **Tüm müşterileri bilgilendirin**
4. **Regular backup planı oluşturun**
5. **Monitoring kurun**

---

## 📅 TAHMİNİ SÜRE

- Hazırlık: **1-2 saat**
- Veritabanı kurulum: **30 dakika**
- Veri taşıma: **1-2 saat** (veri boyutuna göre)
- Deployment: **1-2 saat**
- Test ve düzeltmeler: **2-3 saat**

**TOPLAM: 6-10 saat** (DNS propagasyon hariç)

---

✅ **Migration tamamlandığında Supabase bağlantısını kapatmayı unutmayın!**
