# Vercel Deployment Rehberi

Bu rehber ModaBase projesini Vercel'e deploy etmek için gerekli adımları içerir.

## 🚀 Hızlı Test Deployment (Database'siz)

Build hatalarını test etmek için önce database'siz deploy yapabilirsiniz:

1. Vercel'de projeyi import edin
2. Sadece bu environment variables'ları ekleyin:
   ```env
   NEXTAUTH_SECRET="test-secret-32-characters-minimum"
   NEXTAUTH_URL="https://your-vercel-url.vercel.app"
   DATABASE_URL="file:./temp.db"
   ```
3. Deploy edin - build geçerse database kurulumuna geçin

⚠️ **Not:** Bu geçici bir test için. Production için mutlaka gerçek database kullanın!

## Adım 1: Production Database Kurulumu

### Önerilen: Supabase (Ücretsiz PostgreSQL)

1. [Supabase.com](https://supabase.com) adresinden hesap oluşturun
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name**: modabase-production
   - **Database Password**: Güçlü bir şifre belirleyin
   - **Region**: Europe (eu-central-1) - Türkiye'ye yakın
4. "Create new project" butonuna tıklayın
5. Proje oluştuktan sonra "Settings" > "Database" sekmesine gidin
6. "Connection string" > "Nodejs" seçin
7. Bağlantı string'ini kopyalayın (şuna benzer olacak):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Alternatif: Neon (Ücretsiz PostgreSQL)

1. [Neon.tech](https://neon.tech) adresinden hesap oluşturun
2. "Create a database" butonuna tıklayın
3. Database adını "modabase" olarak ayarlayın
4. Connection string'i kopyalayın

## Adım 2: Vercel Environment Variables

1. Vercel dashboard'unuzda projenizi açın
2. "Settings" sekmesine gidin
3. "Environment Variables" bölümüne gidin
4. Aşağıdaki değişkenleri ekleyin:

### Gerekli Environment Variables:

```env
# Database
DATABASE_URL="YOUR_SUPABASE_CONNECTION_STRING"

# NextAuth
NEXTAUTH_SECRET="production-secret-32-characters-or-more"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="ModaBase <your-email@gmail.com>"

# PayTR (Ödeme)
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"

# App Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_COMPANY_NAME="ModaBase"

# Security
ENCRYPTION_KEY="32-character-encryption-key-here"
JWT_SECRET="your-jwt-secret-key"
```

## Adım 3: Database Migration

Database'i kurduktan sonra tabloları oluşturmanız gerekiyor:

### Database Migration (Production)

Production database'inizi kurduktan sonra tabloları oluşturun:

```bash
# Local'den production database'e migration yapın:
DATABASE_URL="your-production-database-url" npm run db:deploy

# Seed data eklemek için (opsiyonel):
DATABASE_URL="your-production-database-url" npm run db:seed
```

**Önemli:** Vercel build sırasında otomatik migration yapmıyoruz çünkü:
- Güvenlik riski oluşturabilir
- Build process daha yavaş olur
- Manuel kontrol daha güvenli

Migration'ı build'den önce manuel olarak yapmanız öneriliyor.

## Adım 4: Vercel Deployment

1. GitHub reponuzu Vercel'e bağlayın
2. "Import Project" butonuna tıklayın
3. Build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Environment Variables'ları ekleyin (Adım 2)
5. "Deploy" butonuna tıklayın

## Adım 5: Domain ve SSL

1. Vercel'de "Domains" sekmesine gidin
2. Custom domain ekleyin (örn: modabase.com.tr)
3. DNS ayarlarını yapın
4. SSL otomatik aktif olacak

## Troubleshooting

### Build Hatası: "Table does not exist"

Bu hata database migration yapılmadığında oluşur:

```bash
# Local'de test edin:
DATABASE_URL="your-production-url" npx prisma db push

# Seed data eklemek için:
DATABASE_URL="your-production-url" npm run db:seed
```

### Build Hatası: "BigInt serialization"

Bu hatayı `app/api/test-db/route.ts` dosyasındaki düzeltme çözmeli.

### Environment Variables Hatası

- Vercel dashboard'da tüm environment variables'ların doğru eklendiğini kontrol edin
- `NEXTAUTH_SECRET` ve `DATABASE_URL` mutlaka olmalı

## Email Setup (Gmail için)

1. Gmail hesabınızda "2-Step Verification" aktif edin
2. "App Passwords" oluşturun
3. Oluşturulan app password'u `SMTP_PASS` olarak kullanın

## Güvenlik Önerileri

1. **Strong Secrets**: Tüm secret key'ler 32+ karakter olmalı
2. **Environment**: Production environment variables asla commit etmeyin
3. **Database**: Database kullanıcısı sadece gerekli izinlere sahip olmalı
4. **CORS**: API'lerde uygun CORS ayarları yapın

## Performans Optimizasyonu

1. **Images**: Cloudinary veya Vercel Image Optimization kullanın
2. **Caching**: Redis cache ekleyin (Upstash öneriliyor)
3. **CDN**: Static dosyalar için CDN kullanın

## Monitoring

1. **Vercel Analytics**: Otomatik aktif olur
2. **Sentry**: Error tracking için Sentry ekleyin
3. **Logs**: Vercel Function Logs'u takip edin

---

**Not**: Bu deployment rehberi production ortamı içindir. Development için local `.env.local` dosyasını kullanmaya devam edin.
