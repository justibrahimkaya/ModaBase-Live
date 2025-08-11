# 🚀 ModaBase Deployment Rehberi

## 📋 Hızlı Başlangıç (İlk 30 dakika)

### 1. Vercel Hesabı Açın
1. [vercel.com](https://vercel.com) adresine gidin
2. GitHub hesabınızla giriş yapın  
3. "New Project" butonuna tıklayın
4. ModaBase repository'nizi seçin

### 2. Supabase Database Kurulumu
1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" ile hesap açın
3. "New Project" oluşturun:
   - **Project Name**: ModaBase Production
   - **Database Password**: Güçlü bir şifre belirleyin
   - **Region**: Europe (eu-central-1) - Türkiye'ye en yakın
4. Database URL'ini kopyalayın: Settings > Database > Connection String

### 3. Domain Bağlama
1. Vercel project settings'e gidin
2. "Domains" sekmesine tıklayın
3. `www.modabase.com.tr` domain'ini ekleyin
4. DNS ayarlarınızı güncelleyin:
   - **A Record**: `76.76.19.61` (Vercel IP)
   - **CNAME**: `www` → `cname.vercel-dns.com`

## ⚙️ Environment Variables Kurulumu

Vercel dashboard'da "Settings" > "Environment Variables" bölümüne gidin ve şunları ekleyin:

```env
# Database
DATABASE_URL=supabase'den aldığınız connection string

# Auth
NEXTAUTH_SECRET=güçlü-random-string-buraya
NEXTAUTH_URL=https://www.modabase.com.tr

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@modabase.com.tr
SMTP_PASS=gmail-app-password

NODE_ENV=production
```

## 🗄️ Database Migration

Vercel'e deploy ettikten sonra:

1. Vercel Functions sekmesine gidin
2. Database migration'ı çalıştırın:
   ```bash
   npx prisma db push
   ```
3. Seed data'yı ekleyin:
   ```bash
   npm run db:seed
   ```

## 📧 Email Servisi Kurulumu

### Gmail SMTP Kullanımı:
1. Gmail hesabınızda 2FA'yı aktif edin
2. "App Passwords" oluşturun: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generated password'ü `SMTP_PASS` olarak kullanın

## 💳 Ödeme Gateway (PayTR)

1. [paytr.com](https://paytr.com) adresine gidin
2. Üye olun ve başvuru yapın
3. Test hesabı için credentials alın:
   - Merchant ID
   - Merchant Key  
   - Merchant Salt
4. Environment variables'a ekleyin

## 🔒 Güvenlik Kontrolleri

### SSL/HTTPS ✅
- Vercel otomatik SSL sağlar
- `https://www.modabase.com.tr` çalışır durumda olmalı

### Security Headers
```javascript
// next.config.js'e ekleyin
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
]
```

## 📈 Monitoring & Analytics

### Google Analytics
1. [analytics.google.com](https://analytics.google.com) hesap açın
2. Property oluşturun: `www.modabase.com.tr`
3. Measurement ID'yi environment variable olarak ekleyin

### Error Tracking
1. [sentry.io](https://sentry.io) hesap açın
2. Next.js project oluşturun
3. DSN'i environment variable olarak ekleyin

## ✅ Go-Live Checklist

- [ ] Vercel deployment başarılı
- [ ] Database connection çalışıyor
- [ ] Domain yönlendirme aktif
- [ ] SSL sertifikası çalışıyor
- [ ] Email gönderimi test edildi
- [ ] Ödeme sistemi test edildi
- [ ] Admin panel erişimi
- [ ] Google Analytics aktif
- [ ] Backup stratejisi belirlendi

## 🚨 İlk Gün Sonrası

1. **Performance Monitoring**: Core Web Vitals takibi
2. **User Feedback**: WhatsApp entegrasyonu aktif
3. **SEO**: Google Search Console kurulumu
4. **Social Media**: Instagram, Facebook entegrasyonu
5. **Email Marketing**: Newsletter sistemi

## 📞 Acil Durum Contacts

- **Hosting**: Vercel Support
- **Database**: Supabase Support  
- **Domain**: Domain registrar support
- **Payment**: PayTR customer service

---

**🎉 Başarılar! ModaBase artık canlı!** 