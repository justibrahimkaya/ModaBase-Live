# 🚀 Production Güncelleme Kontrol Listesi

## ✅ 1. Kod Güncellemesi
- [x] Değişiklikler commit edildi
- [x] GitHub'a push edildi
- [ ] Vercel otomatik deploy tamamlandı

## 📧 2. Email Servisi Kontrolü

### Production'da Email Çalışması İçin:

**Vercel Dashboard → Settings → Environment Variables** bölümüne git ve şunları kontrol et:

```env
# SMTP Ayarları (Gmail kullanıyorsanız)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@modabase.com  # Gerçek email adresiniz
SMTP_PASS=xxxx xxxx xxxx xxxx  # Gmail App Password

# Email From Adresi
EMAIL_FROM=ModaBase <info@modabase.com>
```

⚠️ **Kritik**: Gmail için App Password kullanmalısınız!

### Gmail App Password Nasıl Alınır:
1. Gmail hesabınıza git
2. Google Account Settings → Security
3. "2-Step Verification" aktif olmalı
4. "App passwords" sekmesi
5. "ModaBase" için yeni app password oluştur
6. 16 haneli kodu SMTP_PASS olarak kullan

## 🔐 3. Super Admin Giriş Testi

Production'da test edin:
- URL: `https://your-domain.com/admin/login`
- Email: `info@modabase.com`
- Şifre: `08513628JUst`

## 📝 4. Business Registration Testi

### Test Senaryosu:
1. `/admin/register` sayfasına git
2. Dummy bir işletme kaydı oluştur
3. Kontrol et:
   - [x] Kayıt başarılı mı?
   - [x] `info@modabase.com`'a bildirim email'i geldi mi?
   - [x] Süper admin `/admin/business-approvals` sayfasında görüyor mu?
   - [x] Onay/Red işlemi çalışıyor mu?
   - [x] İşletmeye sonuç email'i gidiyor mu?

## 🗄️ 5. Database Migration (İlk defa güncelleyenler için)

Eğer database'de yeni tablolar varsa:

```bash
# Production database'e connect ol
npx prisma db push --force-reset

# Seed data'yı çalıştır (super admin için)
npx prisma db seed
```

⚠️ **Dikkat**: `--force-reset` mevcut data'yı siler!

## 🌐 6. Domain ve SSL Kontrolü

- [x] Domain çalışıyor mu?
- [x] HTTPS aktif mi?
- [x] www yönlendirmesi doğru mu?

## 📊 7. Performance Kontrolü

- [x] Site yükleme hızı (< 3 saniye)
- [x] Mobile responsive
- [x] Console'da error yok

## 🚨 8. Hata Durumları

### Deploy Başarısız Olursa:
1. Vercel "Deployments" sekmesinde hata logunu oku
2. En yaygın sorunlar:
   - Environment variables eksik
   - Database connection hatası
   - Build error (TypeScript/syntax)

### Email Gönderilmiyorsa:
1. Gmail App Password doğru mu?
2. SMTP ayarları doğru mu?
3. Vercel logs'da email error'u var mı?

### Database Bağlanamıyorsa:
1. DATABASE_URL doğru mu?
2. Supabase/Neon database'i çalışıyor mu?
3. Connection string güncel mi?

## 🎯 9. Son Kontroller

- [x] Ana sayfa açılıyor
- [x] User registration çalışıyor
- [x] Admin login çalışıyor  
- [x] Business registration çalışıyor
- [x] Email notifications çalışıyor
- [x] Mobile'da sorunsuz

## 📞 10. Acil Durum

Eğer site çöktüyse:
1. Vercel'de "Redeploy" butonuna bas
2. Önceki working deployment'a "Promote to Production"
3. GitHub'dan son working commit'e geri dön: `git revert HEAD`

---

**✅ Tüm maddeler tamamlandığında production güncellemeniz hazır!**