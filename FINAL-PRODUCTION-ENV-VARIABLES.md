# 🚀 MODABASE - PRODUCTION ENVIRONMENT VARIABLES (FINAL)
*Projenin son haline göre tam liste - 2024*

## ✅ **ZORUNLU DEĞIŞKENLER** (19 adet)

### 🗄️ **Database & Auth**
```bash
DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="modabase-2024-production-secret-key-lorem-ipsum-dolor-sit-amet-32-chars"
NEXTAUTH_URL="https://www.modabase.com.tr"
NODE_ENV="production"
```

### 📧 **Email System (SMTP)**
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"  
SMTP_USER="info@modabase.com.tr"
SMTP_PASS="xxxx xxxx xxxx xxxx"
EMAIL_FROM="ModaBase <info@modabase.com.tr>"
```

### 🔒 **Security**
```bash
ENCRYPTION_KEY="modabase-encryption-key-32-chars-production"
JWT_SECRET="modabase-jwt-secret-key-production-2024"
```

### 💳 **Payment Gateway**
```bash
PAYTR_MERCHANT_ID="test-merchant-id"
PAYTR_MERCHANT_KEY="test-merchant-key"
PAYTR_MERCHANT_SALT="test-merchant-salt"
```

### 🌐 **App Configuration**
```bash
NEXT_PUBLIC_APP_URL="https://www.modabase.com.tr"
NEXT_PUBLIC_COMPANY_NAME="ModaBase"
```

### 📧 **Email Alternative Variables** *(Kod tutarlılığı için)*
```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="info@modabase.com.tr"  
EMAIL_PASS="xxxx xxxx xxxx xxxx"
```

---

## 🔶 **OPSİYONEL DEĞIŞKENLER** (5 adet)

### 🔐 **Social Login** *(Şu anda disabled)*
```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

### 📈 **Analytics & Monitoring**
```bash
NEXT_PUBLIC_GA_ID="GA-MEASUREMENT-ID"
SENTRY_DSN="your-sentry-dsn"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

---

## 🔍 **KULLANICININ LİSTESİ ANALİZİ**

### ✅ **DOĞRU OLANLAR**
- DATABASE_URL ✅
- NEXTAUTH_SECRET ✅
- NEXTAUTH_URL ✅  
- NODE_ENV ✅
- NEXT_PUBLIC_APP_URL ✅
- NEXT_PUBLIC_COMPANY_NAME ✅
- SMTP_HOST/PORT/USER/PASS ✅
- EMAIL_FROM ✅
- PAYTR_* ✅
- ENCRYPTION_KEY ✅
- JWT_SECRET ✅
- CLOUDINARY_URL ✅ (opsiyonel)
- NEXT_PUBLIC_GA_ID ✅ (opsiyonel)
- SENTRY_DSN ✅ (opsiyonel)

### ❌ **EKSİK OLANLAR**
```bash
# Kod tutarlılığı için gerekli:
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="info@modabase.com.tr"
EMAIL_PASS="xxxx xxxx xxxx xxxx"

# Social login için (şimdilik disabled):
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

---

## 📋 **HIZLI DEPLOYMENT İÇİN MİNİMUM LİSTE**

Bu 15 değişken **mutlaka** olmalı:

```bash
DATABASE_URL="postgresql://postgres.[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="modabase-2024-production-secret-key-lorem-ipsum-dolor-sit-amet-32-chars"
NEXTAUTH_URL="https://www.modabase.com.tr"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://www.modabase.com.tr"
NEXT_PUBLIC_COMPANY_NAME="ModaBase"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="info@modabase.com.tr"
SMTP_PASS="xxxx xxxx xxxx xxxx"
EMAIL_FROM="ModaBase <info@modabase.com.tr>"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="info@modabase.com.tr"
EMAIL_PASS="xxxx xxxx xxxx xxxx"
PAYTR_MERCHANT_ID="test-merchant-id"
PAYTR_MERCHANT_KEY="test-merchant-key"
PAYTR_MERCHANT_SALT="test-merchant-salt"
ENCRYPTION_KEY="modabase-encryption-key-32-chars-production"
JWT_SECRET="modabase-jwt-secret-key-production-2024"
```

---

## 🛠️ **TUTARSIZLIK DÜZELTMELERİ**

**Problem**: Kodda hem `SMTP_*` hem `EMAIL_*` kullanılıyor  
**Çözüm**: Her ikisini de tanımla (kod tutarlılığı için)

**Problem**: Social login variables eksik  
**Çözüm**: Boş string olarak tanımla (error'ları önlemek için)

---

## 🎯 **SONUÇ**

**Kullanıcının listesi %85 doğru!** ✅

**Sadece bu 4 değişken eklenirse tam olur:**
```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"  
EMAIL_USER="info@modabase.com.tr"
EMAIL_PASS="xxxx xxxx xxxx xxxx"
``` 