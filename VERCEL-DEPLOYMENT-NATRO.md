# 🚀 VERCEL CANLI DEPLOYMENT - NATRO MySQL

## ⚡ HIZLI ADIMLAR

### 1️⃣ VERCEL DASHBOARD'A GİRİN
https://vercel.com adresine gidin ve projenizi seçin

### 2️⃣ ENVIRONMENT DEĞİŞKENLERİNİ GÜNCELLEYİN

**Settings → Environment Variables** bölümüne gidin ve şunları ekleyin/güncelleyin:

```env
# 🔴 ESKİ SUPABASE (SİLİN veya YORUM YAPIN)
# DATABASE_URL="postgresql://..." ❌ BUNU SİLİN

# ✅ YENİ NATRO MYSQL
DATABASE_URL="mysql://user8D2:08513628JUst----@94.73.150.249:3306/db8D2"

# ✅ NEXTAUTH (Production URL'nizi yazın)
NEXTAUTH_URL="https://moda-base-live.vercel.app"
NEXTAUTH_SECRET="development-secret-key-minimum-32-characters-long-for-security"

# ✅ APP URL
NEXT_PUBLIC_APP_URL="https://moda-base-live.vercel.app"

# ✅ SMTP EMAIL
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="kavram.triko@gmail.com"
SMTP_PASS="yqarfkyevahfnenq"
EMAIL_FROM="Kavram Triko <kavram.triko@gmail.com>"

# ✅ PAYTR
NEXT_PUBLIC_PAYTR_MERCHANT_ID="Kavram Triko"
PAYTR_MERCHANT_ID="test-merchant-id"
PAYTR_MERCHANT_KEY="test-merchant-key"
PAYTR_MERCHANT_SALT="test-merchant-salt"

# ✅ WHATSAPP
WHATSAPP_SUPPORT_NUMBER="905362971255"
WHATSAPP_BUSINESS_NUMBER="905362971255"
WHATSAPP_ADMIN_NUMBER="905362971255"

# ✅ OPENAI (Opsiyonel)
OPENAI_API_KEY="sk-proj-YOUR_OPENAI_API_KEY_HERE"

# ✅ KARGONOMI
KARGONOMI_BASE_URL="https://app.kargonomi.com.tr/api/v1"
KARGONOMI_BEARER_TOKEN="YOUR_KARGONOMI_TOKEN_HERE"
```

### 3️⃣ BUILD TRIGGER EDİN

Vercel Dashboard'da:
1. **Deployments** sekmesine gidin
2. **Redeploy** butonuna tıklayın
3. **Use existing Build Cache** seçeneğini KAPATIN ❌
4. **Redeploy** tıklayın

VEYA Terminal'den:
```bash
git add .
git commit -m "Migration to Natro MySQL completed"
git push
```

---

## ✅ KONTROL LİSTESİ

- [ ] Vercel Environment Variables güncellendi
- [ ] DATABASE_URL Natro MySQL'i gösteriyor
- [ ] NEXTAUTH_URL production URL'si
- [ ] Build başarılı
- [ ] Site açılıyor
- [ ] Login çalışıyor
- [ ] Ürünler görünüyor
- [ ] Admin paneli çalışıyor

---

## 🔴 SUPABASE'İ KAPATMA

### ⚠️ ÖNEMLİ: Önce canlı sitenin çalıştığından emin olun!

1. **Vercel'de site çalıştığından emin olduktan sonra:**
   - Supabase Dashboard'a girin
   - Project Settings → General
   - "Pause Project" veya "Delete Project"

2. **Environment'tan Supabase'i temizleyin:**
   - Tüm `SUPABASE_` ile başlayan değişkenleri silin
   - Eski PostgreSQL DATABASE_URL'i silin

---

## 🚨 ACİL DURUM PLANI

Eğer bir sorun olursa:

### SORUN: Site açılmıyor
```env
# Vercel'de DATABASE_URL'i kontrol edin
DATABASE_URL="mysql://user8D2:08513628JUst----@94.73.150.249:3306/db8D2"
```

### SORUN: Login çalışmıyor
```env
# NEXTAUTH_URL'in doğru olduğundan emin olun
NEXTAUTH_URL="https://moda-base-live.vercel.app"
NEXTAUTH_SECRET="development-secret-key-minimum-32-characters-long-for-security"
```

### SORUN: MySQL bağlanamıyor
1. Natro Panel → Uzak MySQL
2. IP kısıtlamasını kaldırın: `%` (tüm IP'ler)

---

## 📞 DESTEK

### Natro Destek:
- MySQL erişim sorunu için
- Sunucu yavaşlığı için

### Vercel Destek:
- Build hataları için
- Environment değişkenleri için

---

## 🎉 BAŞARILI DEPLOYMENT SONRASI

1. **Test Edin:**
   - Ana sayfa
   - Ürün sayfaları
   - Admin giriş
   - Sipariş verme

2. **Monitör Edin:**
   - Vercel Analytics
   - MySQL performansı

3. **Backup Alın:**
   - Natro'dan haftalık backup
   - Vercel deployment history

---

## 🚀 DEPLOYMENT KOMUTLARI

```bash
# Build kontrolü
npm run build

# Git push (otomatik deploy)
git add .
git commit -m "Switch from Supabase to Natro MySQL"
git push

# Vercel CLI ile deploy
vercel --prod
```

---

✅ **HAZIR! Şimdi Vercel'e gidip deployment yapabilirsiniz!**
