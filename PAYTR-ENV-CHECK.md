# PayTR Environment Değişkenleri Kontrol Listesi

## ❌ SORUN: Vercel'de PayTR değişkenleri eksik!

### Hata Mesajı:
```
"Missing PayTR credentials on server (merchant_id/key/salt)"
```

## ÇÖZÜM: Vercel Dashboard'dan Environment Variables Ekle

1. **Vercel.com'a giriş yap**
2. **ModaBase projesini seç**
3. **Settings → Environment Variables** bölümüne git
4. **Şu değişkenleri ekle:**

```
PAYTR_MERCHANT_ID = 596379
PAYTR_MERCHANT_KEY = srMxKnSgipN1Z1Td
PAYTR_MERCHANT_SALT = TzXLtjFSuyDPsi8B
PAYTR_TEST_MODE = false
```

5. **"Save" butonuna bas**
6. **Deployments sekmesine git**
7. **En son deployment'ın yanındaki 3 nokta menüsünden "Redeploy" seç**
8. **"Redeploy" butonuna bas**

## Önemli Notlar:
- Bu değişkenler Production, Preview ve Development ortamları için eklenmelidir
- Redeploy işlemi zorunludur, yoksa değişkenler aktif olmaz
- Deploy işlemi 1-2 dakika sürer

## Test:
Deploy bittikten sonra tekrar ödeme yapmayı dene.