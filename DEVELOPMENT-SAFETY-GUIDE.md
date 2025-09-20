# 🚨 DEVELOPMENT GÜVENLİK REHBERİ

## ⚠️ KRİTİK UYARI: PRODUCTION VERİLERİNİ KORUYUN!

Bu rehber gerçek kullanıcı verilerinin kaybolmaması için **MUTLAKA** uygulanmalıdır.

## 🔒 1. ENVIRONMENT AYIRIMI (ACİL!)

### .env.local Dosyası Oluşturun
Proje ana dizininde `.env.local` dosyası oluşturun:

```env
# LOCAL DEVELOPMENT - GÜVENLİ
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"

# Test Email
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="test@test.com"
SMTP_PASS="test"

# Test PayTR
PAYTR_MERCHANT_ID="test"
PAYTR_MERCHANT_KEY="test"
PAYTR_MERCHANT_SALT="test"
```

### Production Environment
Production'da farklı `DATABASE_URL` kullanılmalı:
```env
# PRODUCTION - GERÇEK VERİLER
DATABASE_URL="postgresql://prod-user:password@prod-host:5432/modabase_production"
```

## 🛡️ 2. GÜVENLİ GELIŞTIRME WORKFLOW'U

### A) Yeni Özellik Geliştirirken:

```bash
# 1. Development database kullanın
DATABASE_URL="file:./dev.db" npm run dev

# 2. Schema değişikliği yaparken
DATABASE_URL="file:./dev.db" npx prisma db push

# 3. Test için seed data
DATABASE_URL="file:./dev.db" npm run db:seed
```

### B) Production'a Deploy Etmeden Önce:

```bash
# 1. Production schema'yı test edin (TEST DB'de)
DATABASE_URL="postgresql://test-db-url" npx prisma db push --accept-data-loss

# 2. Backup alın
# Vercel/Supabase dashboard'dan backup indirin

# 3. Migration planı yapın
# Hangi tablolar değişecek, veri kaybı olabilir mi?
```

## ⚡ 3. ACİL DURUM PLANI

### Production'da Hata Olursa:

```bash
# 1. Hemen önceki commit'e dönün
git revert HEAD
git push origin main

# 2. Database backup'ından restore edin
# Supabase Dashboard > Database > Backups

# 3. Schema'yı geri alın
DATABASE_URL="production-url" npx prisma db push --reset
```

## 📋 4. GÜVENLI DEPLOYMENT CHECKLIST

### Her Deployment Öncesi:

- [ ] ✅ Development'ta test edildi
- [ ] ✅ Database backup alındı
- [ ] ✅ Schema değişiklikleri test edildi
- [ ] ✅ Migration planı hazırlandı
- [ ] ✅ Rollback planı var
- [ ] ✅ Test verisiyle production test edildi

### Schema Değişikliği Varsa:

- [ ] ✅ Veri kaybı analizi yapıldı
- [ ] ✅ Migration script test edildi
- [ ] ✅ Backup stratejisi belirlendi
- [ ] ✅ Downtime planı yapıldı

## 🔧 5. GÜVENLI SCHEMA DEĞİŞİKLİĞİ

### Güvenli Değişiklikler:
✅ Yeni tablo eklemek
✅ Yeni kolon eklemek (nullable)
✅ Index eklemek
✅ Yeni ilişki eklemek

### Riskli Değişiklikler:
❌ Kolonu silmek
❌ Tablo silmek
❌ Kolon tipini değiştirmek
❌ NOT NULL constraint eklemek

### Riskli Değişiklik Yaparken:

```bash
# 1. ÖNCE BACKUP ALIN!
# 2. Test database'de deneyin
DATABASE_URL="test-db" npx prisma db push

# 3. Migration script yazın
npx prisma migrate dev --name describe-change

# 4. Production'da gradual deployment
# Önce yeni kolonu ekleyin, sonra eski kolonu silin
```

## 📱 6. KULLANICI VERİSİ KORUMA

### Müşteri Siparişleri:
- Asla `Order` tablosunu manipüle etmeyin
- Sipariş durumlarını doğrudan DB'den değiştirmeyin
- Test siparişlerini production'da yapmayın

### Kullanıcı Bilgileri:
- `User` tablosunda test yapmayın
- Email adreslerini değiştirmeyin
- Şifre hash'lerini manipüle etmeyin

### Stok Bilgileri:
- `Product.stock` alanını doğrudan değiştirmeyin
- `StockMovement` tablosunu kullanın
- Rezervasyon sistemini bozacak değişiklik yapmayın

## 🚨 7. ACİL DURUM KONTAKLARI

### Hosting (Vercel):
- Dashboard: vercel.com
- Support: vercel.com/support

### Database (Supabase):
- Dashboard: supabase.com/dashboard
- Backup: Settings > Database > Backups

### Domain:
- DNS ayarları değiştirilmemeli
- SSL sertifikası otomatik

## 💡 8. GELIŞTIRME İPUÇLARI

### Güvenli Test Etmek:
```bash
# 1. Ayrı bir test environment kullanın
DATABASE_URL="postgresql://test-db" npm run dev

# 2. Production verilerini clone edin (hassas verileri temizleyerek)
# 3. Gerçek ödeme testleri yapmayın
```

### Schema Debug:
```bash
# Schema'yı görmek için
npx prisma studio

# Migration historysi
npx prisma migrate status

# Schema diff
npx prisma db diff
```

---

## ⚡ ACİL TODO:

1. **ŞİMDİ**: `.env.local` dosyası oluşturun
2. **ŞİMDİ**: Development database ayrı yapın
3. **BUGÜN**: Production backup alın
4. **BU HAFTA**: Test environment kurun
5. **HER DEPLOYMENT**: Bu checklist'i takip edin

**UNUTMAYIN**: Gerçek kullanıcı verileri bir kez kaybolduğunda geri getirilemez!
