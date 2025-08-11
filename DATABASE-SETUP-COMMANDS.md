# 🗄️ VERİTABANI BAĞLANTISI KURULUM REHBERİ

## 📋 **ADIM 1: SUPABASE DATABASE OLUŞTUR**

### 1.1 Supabase.com'a Git
```
https://supabase.com/dashboard
```

### 1.2 Yeni Proje Oluştur
- **"New Project"** tıkla
- **Project Name**: `ModaBase Production`
- **Database Password**: Güçlü şifre oluştur (kaydet!)
- **Region**: `Europe Central (eu-central-1)`
- **Pricing Plan**: `Free tier` (başlangıç için)

### 1.3 Database URL'i Al
```bash
Settings → Database → Connection String → URI kopyala
```

**Format:** 
```
postgresql://postgres.[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 📋 **ADIM 2: VERCEL ENVIRONMENT VARIABLES**

### 2.1 Vercel Dashboard'da
- Projen → **Settings** → **Environment Variables**
- **Import .env** buton tıkla
- Aşağıdaki listeyi yapıştır:

```env
DATABASE_URL=postgresql://postgres.[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=modabase-2024-production-secret-key-lorem-ipsum-dolor-sit-amet-32-chars
NEXTAUTH_URL=https://www.modabase.com.tr
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://www.modabase.com.tr
NEXT_PUBLIC_COMPANY_NAME=ModaBase
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@modabase.com.tr
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=ModaBase <info@modabase.com.tr>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@modabase.com.tr
EMAIL_PASS=xxxx xxxx xxxx xxxx
PAYTR_MERCHANT_ID=test-merchant-id
PAYTR_MERCHANT_KEY=test-merchant-key
PAYTR_MERCHANT_SALT=test-merchant-salt
ENCRYPTION_KEY=modabase-encryption-key-32-chars-production
JWT_SECRET=modabase-jwt-secret-key-production-2024
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### 2.2 **ÖNEMLİ**: 
- `[PASSWORD]` yerine Supabase şifrenizi yazın
- `[PROJECT-REF]` yerine Supabase project ID'nizi yazın
- `SMTP_PASS` yerine Gmail App Password yazın

---

## 📋 **ADIM 3: DATABASE SETUP KOMUTLARI**

### 3.1 Lokal Development için
```bash
# Development database kurulumu
DATABASE_URL="file:./dev.db" npx prisma db push
DATABASE_URL="file:./dev.db" npx prisma db seed
```

### 3.2 Production Database için
```bash
# Production database schema oluştur
DATABASE_URL="[SUPABASE_URL]" npx prisma db push

# Production database'e sample data ekle
DATABASE_URL="[SUPABASE_URL]" npx prisma db seed
```

---

## 📋 **ADIM 4: DEPLOYMENT KOMUTLARI**

### 4.1 Vercel'e Deploy
```bash
# GitHub'a push et
git add .
git commit -m "🚀 Production database setup"
git push origin main

# Vercel otomatik deploy yapar
```

### 4.2 Database Migration (Production)
```bash
# Vercel CLI yükle (henüz yoksa)
npm i -g vercel

# Vercel login
vercel login

# Production'da migration çalıştır
vercel env pull .env.local
DATABASE_URL="[SUPABASE_URL]" npx prisma db push
DATABASE_URL="[SUPABASE_URL]" npx prisma db seed
```

---

## 📋 **ADIM 5: TEST ve DOĞRULAMA**

### 5.1 Database Bağlantısı Test
```bash
# Prisma Studio ile kontrol et
DATABASE_URL="[SUPABASE_URL]" npx prisma studio
```

### 5.2 Production Site Test
```
1. https://www.modabase.com.tr/admin/login
   - Email: info@modabase.com
   - Password: 08513628JUst

2. Ana sayfa yüklenme kontrolü
3. Ürün listeleme kontrolü
4. Sepet işlemleri kontrolü
```

---

## 🚨 **SORUN GİDERME**

### Database Connection Error
```bash
# Prisma client regenerate
npx prisma generate

# Database reset (dikkatli!)
DATABASE_URL="[SUPABASE_URL]" npx prisma db push --force-reset
DATABASE_URL="[SUPABASE_URL]" npx prisma db seed
```

### Vercel Build Error
```bash
# Environment variables kontrol
vercel env ls

# Build logs kontrol
vercel logs
```

### Migration Error
```bash
# Schema.prisma kontrol et
npx prisma validate

# Force migration
DATABASE_URL="[SUPABASE_URL]" npx prisma db push --accept-data-loss
```

---

## 📋 **HIZLI SETUP (1-2 SAATLİK SÜREÇ)**

### ⏱️ **15 dakika**: Supabase database oluştur
### ⏱️ **5 dakika**: Vercel environment variables
### ⏱️ **10 dakika**: Database migration
### ⏱️ **15 dakika**: Gmail SMTP setup
### ⏱️ **15 dakika**: Production test

### 🎯 **TOPLAM: ~60 dakika full production ready!** 