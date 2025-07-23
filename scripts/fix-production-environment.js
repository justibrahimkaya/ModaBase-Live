const fs = require('fs');
const path = require('path');

console.log('🔧 PRODUCTION ENVIRONMENT DÜZELTİLİYOR...\n');

// Mevcut .env dosyasını kontrol et
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 .env.local dosyası:', envExists ? '✅ Mevcut' : '❌ Yok');

// Production environment template
const productionEnv = `# ===========================================
# MODABASE - PRODUCTION ENVIRONMENT VARIABLES
# ===========================================

# Database (Production) - SUPABASE POSTGRESQL
DATABASE_URL="postgresql://postgres:08513628-JUst@db.wcutymcedxgeyrnpuyvt.supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="production-secret-key-minimum-32-charactors-long-for-security"
NEXTAUTH_URL="https://www.modabase.com.tr"

# Application Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://www.modabase.com.tr"
NEXT_PUBLIC_COMPANY_NAME="ModaBase"
NEXT_PUBLIC_BASE_URL="https://www.modabase.com.tr"

# Email Service (SMTP) - GMAIL APP PASSWORD
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="info@modabase.com.tr"
SMTP_PASS="yqarfkyevahfineng"
EMAIL_FROM="ModaBase <info@modabase.com.tr>"

# Email Alternative Variables (Kod tutarlılığı için)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="info@modabase.com.tr"
EMAIL_PASS="yqarfkyevahfineng"

# Payment Gateway (PayTR) - PRODUCTION DEĞERLERİ
PAYTR_MERCHANT_ID="596379"
PAYTR_MERCHANT_KEY="srMxKnSgipN1Z1Td"
PAYTR_MERCHANT_SALT="TzXLtjFSuyDPsi8B"
PAYTR_TEST_MODE="false"
PAYTR_NOTIFICATION_URL="https://www.modabase.com.tr/api/paytr/notification"

# Security
ENCRYPTION_KEY="a1b2c3d4e5f678901234567890123456"
JWT_SECRET="super-secure-jwt-secret-key-2024-modabase"
API_KEY="modabase-api-key-2024-secure-32-chars"

# WhatsApp Configuration
WHATSAPP_SUPPORT_NUMBER="905362971255"
WHATSAPP_BUSINESS_NUMBER="905362971255"
WHATSAPP_ADMIN_NUMBER="905362971255"

# Site Configuration
SITE_NAME="ModaBase"
SITE_DESCRIPTION="Modern E-Ticaret Platformu"
MAX_FILE_SIZE="10"
ALLOWED_FILE_TYPES="jpg, jpeg, png, gif, webp"
CURRENCY="TRY"
TIMEZONE="Europe/Istanbul"

# Kargonomi API Configuration - PRODUCTION
KARGONOMI_BASE_URL="https://app.kargonomi.com.tr/api/v1"
KARGONOMI_BEARER_TOKEN="sk-proj_oqL2hhJy1BQB136LhRw4MkuLo3y19wRYPZ9C4Rfy196db063"

# Cargo Company API Configuration (via Kargonomi)
ARAS_API_ENDPOINT="https://app.kargonomi.com.tr/api/v1"
ARAS_API_KEY="your_aras_api_key_here"
PTT_API_ENDPOINT="https://app.kargonomi.com.tr/api/v1"
PTT_API_KEY="your_ptt_api_key_here"
KOLAYGELSIN_API_ENDPOINT="https://app.kargonomi.com.tr/api/v1"
KOLAYGELSIN_API_KEY="your_kolaygelsin_api_key_here"
HEPSIJET_API_ENDPOINT="https://app.kargonomi.com.tr/api/v1"
HEPSIJET_API_KEY="your_hepsijet_api_key_here"
SURAT_API_ENDPOINT="https://app.kargonomi.com.tr/api/v1"
SURAT_API_KEY="your_surat_api_key_here"
UPS_API_ENDPOINT="https://app.kargonomi.com.tr/api/v1"
UPS_API_KEY="your_ups_api_key_here"

# ===========================================
# PRODUCTION İÇİN HAZIR!
# ===========================================
`;

// .env.local dosyasını oluştur/güncelle
try {
  fs.writeFileSync(envPath, productionEnv);
  console.log('✅ .env.local dosyası oluşturuldu/güncellendi');
  console.log('📁 Dosya yolu:', envPath);
} catch (error) {
  console.error('❌ .env.local dosyası oluşturulamadı:', error.message);
}

console.log('\n📋 PRODUCTION ENVIRONMENT ÖZETİ:');
console.log('✅ DATABASE_URL - Supabase PostgreSQL');
console.log('✅ NEXTAUTH_SECRET - Güvenli');
console.log('✅ NEXTAUTH_URL - Production domain');
console.log('✅ NODE_ENV - Production');
console.log('✅ SMTP - Gmail konfigürasyonu');
console.log('✅ PayTR - Production merchant bilgileri');
console.log('✅ Kargonomi - Production API token');
console.log('✅ WhatsApp - Production numaraları');

console.log('\n🚨 ÖNEMLİ UYARILAR:');
console.log('1. Bu dosya sadece local development için!');
console.log('2. Vercel\'de environment variables manuel olarak set edilmeli!');
console.log('3. Gerçek PayTR merchant hesabı gerekli!');
console.log('4. Kargonomi API token aktif olmalı!');

console.log('\n🎯 SONRAKI ADIMLAR:');
console.log('1. Vercel Dashboard → Settings → Environment Variables');
console.log('2. Yukarıdaki değerleri Vercel\'e ekle');
console.log('3. Deploy et ve test et');
console.log('4. Gerçek PayTR hesabı aç (opsiyonel)');

console.log('\n✅ Production environment hazır!'); 