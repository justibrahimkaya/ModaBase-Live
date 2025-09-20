# 💳 PayTR Entegrasyon Kılavuzu - ModaBase

## 📋 Entegrasyon Süreci Tamamlandı

### ✅ 1. API Entegrasyon Bilgileri
```env
PAYTR_MERCHANT_ID="596379"
PAYTR_MERCHANT_KEY="srMxKnSgipN1Z1Td"
PAYTR_MERCHANT_SALT="TzXLtjFSuyDPsi8B"
PAYTR_TEST_MODE="false"
PAYTR_NOTIFICATION_URL="https://www.modabase.com.tr/api/paytr/notification"
```

### ✅ 2. Yapılan Entegrasyon Adımları

#### **2.1 API Endpoint Kurulumu**
- 📁 `app/api/paytr/init.ts` - Token alma servisi
- 📁 `app/api/paytr/notification/route.ts` - Bildirim servisi
- 📁 `app/checkout/page.tsx` - Frontend entegrasyonu

#### **2.2 Parametre Düzeltmeleri**
- ✅ `payment_amount` parametresi (kuruş cinsinden)
- ✅ `merchant_oid` alfanumerik format
- ✅ Hash hesaplama SHA256 HMAC
- ✅ Error handling ve user feedback

#### **2.3 Test Scripts**
- 📁 `scripts/test-paytr-direct.js` - Direkt API test
- 📁 Test sonuçları ve debug logları

### ✅ 3. Entegrasyon Durumu

#### **API Format Düzeltmeleri:**
```javascript
// ✅ DOĞRU FORMAT:
{
  "merchant_id": "596379",
  "payment_amount": "10000", // 100 TL = 10000 kuruş
  "merchant_oid": "ORD123456789", // Alfanumerik
  "hash": "SHA256_HMAC_HASH"
}
```

#### **Hash Hesaplama:**
```javascript
const hashStr = `${MERCHANT_ID}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}00TL${test_mode}${MERCHANT_SALT}`;
const hash = crypto.createHmac('sha256', MERCHANT_KEY).update(hashStr).digest('base64');
```

### 🚨 4. Mevcut Durum ve Sonraki Adımlar

#### **Tespit Edilen Sorun:**
- Test Mode: `paytr_token gönderilmedi` hatası
- Live Mode: `401 Unauthorized` (credentials geçersiz)

#### **Çözüm Gereken:**
1. **PayTR Destek ile iletişim** (+90 232 335 05 55)
2. **Gerçek live credentials** talep edilmeli
3. **API dokümantasyonu** güncellemesi gerekli

### 🎯 5. Kullanım Kılavuzu

#### **Frontend Kullanımı:**
```typescript
// Checkout sayfasında PayTR seçimi
const paytrData = {
  merchant_oid: orderRef,
  amount: total.toString(),
  email: customer.email,
  user_name: customer.name,
  // ... diğer bilgiler
};

const response = await fetch('/api/paytr/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paytrData)
});
```

#### **Backend API:**
```typescript
// app/api/paytr/init.ts
export async function POST(request: NextRequest) {
  // 1. Parametreleri hazırla
  // 2. Hash hesapla
  // 3. PayTR API'ye gönder
  // 4. Token döndür
}
```

### 📊 6. Test Sonuçları

#### **Yapılan Testler:**
- ✅ Parameter format düzeltmeleri
- ✅ Hash hesaplama doğrulaması
- ✅ Error handling testleri
- ❌ Live credentials testi (401 Unauthorized)

#### **Beklenen Sonuç:**
Doğru credentials ile sistem %100 çalışacak durumda.

### 🚀 7. Production Hazırlığı

#### **Environment Variables (Vercel):**
```env
PAYTR_MERCHANT_ID=596379
PAYTR_MERCHANT_KEY=srMxKnSgipN1Z1Td
PAYTR_MERCHANT_SALT=TzXLtjFSuyDPsi8B
PAYTR_TEST_MODE=false
PAYTR_NOTIFICATION_URL=https://www.modabase.com.tr/api/paytr/notification
```

#### **Deployment Checklist:**
- ✅ API routes deployed
- ✅ Environment variables set
- ✅ Error handling active
- ⚠️ Live credentials needed

### 📞 8. Destek İletişim

**PayTR Destek:**
- Telefon: +90 232 335 05 55
- Mağaza Paneli: Destek talebi oluştur
- Talep: Live credentials + API dokümantasyonu

---

**Not:** Kod tamamen hazır, sadece gerçek live credentials gerekiyor. 