# 📋 E-ARŞİV ENTEGRASYON REHBERİ

## 🎯 DURUM ÖZET
- **Mevcut Sistem:** Manuel PDF fatura oluşturma
- **Hedef:** GİB e.arşiv entegrasyonu
- **Durum:** Entegrasyon mümkün ama özel çalışma gerekiyor

---

## 🚨 MEVCUT FATURA SORUNU ÇÖZÜMÜ

### 1. Sorun Tanı (Önce Bu Script'i Çalıştırın)
```bash
node debug-invoice-system.js
```

### 2. Olası Sorunlar ve Çözümler

#### A) PDF Oluşturma Hatası
- **Sebep:** pdfkit bağımlılığı eksik/bozuk
- **Çözüm:** `npm install pdfkit@^0.15.2`

#### B) Dosya İzni Sorunu
- **Sebep:** public/invoices klasörüne yazma izni yok
- **Çözüm:** Klasör izinlerini kontrol edin

#### C) Environment Variables Eksik
- **Gerekli:** SMTP ayarları email göndermek için
- **Kontrol:** `.env` dosyasında email ayarları

---

## 🏛️ E.ARŞİV ENTEGRASYON SÜRECİ

### 1. Gereksinimler

#### A) Yasal Gereksinimler
- [x] Vergi mükellefi olma (✅ Şirket bilgileriniz mevcut)
- [ ] GİB'e e.arşiv başvuru
- [ ] Test ortamı sertifikası
- [ ] Prodüksiyon sertifikası

#### B) Teknik Gereksinimler
- [ ] GİB e.arşiv test ortamı erişimi
- [ ] SSL sertifikası (HTTPS) ✅ Mevcut
- [ ] XML imzalama kütüphanesi
- [ ] UBL-TR 1.2 fatura formatı desteği

### 2. Entegrasyon Adımları

#### ADIM 1: GİB Başvuru Süreci
```
1. https://www.gib.gov.tr > Elektronik Hizmetler
2. e.arşiv fatura sistemine başvuru
3. Test ortamı kullanıcı bilgileri alma
4. Sertifika yükleme işlemleri
```

#### ADIM 2: Teknik Altyapı Kurulum

```javascript
// Gerekli NPM Paketleri
npm install xmlbuilder2 node-forge axios crypto

// e.arşiv servis yapısı
/lib/earsiv/
  ├── earsivService.ts      // Ana servis
  ├── xmlBuilder.ts         // UBL-TR XML oluşturucu
  ├── authentication.ts    // GİB kimlik doğrulama
  ├── invoiceValidator.ts  // Fatura doğrulayıcı
  └── constants.ts         // GİB API sabitleri
```

#### ADIM 3: XML Fatura Formatı
```xml
<!-- UBL-TR 1.2 Standart Format -->
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
    <!-- Fatura detayları -->
</Invoice>
```

---

## 💡 ÖNERİLEN ENTEGRASYON STRATEJİSİ

### Faz 1: Mevcut Sistem Sabitleme (1-2 Gün)
1. ✅ Mevcut PDF fatura sistemini düzelt
2. ✅ Test ortamında doğrula
3. ✅ Production'da sorunsuz çalıştığını onayla

### Faz 2: Hibrit Sistem (2-3 Hafta)
1. 📄 PDF fatura sistemi devam etsin
2. ➕ e.arşiv test entegrasyonu paralel olarak
3. ⚡ Geçiş sürecinde kesinti olmasın

### Faz 3: Tam e.arşiv Geçiş (1 Hafta)
1. 🔄 e.arşiv sistemi aktif et
2. 📄 PDF yedek olarak tut
3. 📊 Monitoring ve log sistemi

---

## 🛠️ ENTEGRASYON KOD ÖRNEĞİ

### E.Arşiv Service Iskelet Yapısı

```typescript
// lib/earsiv/earsivService.ts
export class EarsivService {
  private static config = {
    testUrl: 'https://efaturatest.gib.gov.tr',
    prodUrl: 'https://efatura.gib.gov.tr',
    timeout: 30000
  };

  // 1. GİB'e giriş yap
  static async authenticate(username: string, password: string) {
    // GİB kimlik doğrulama
  }

  // 2. Fatura oluştur
  static async createInvoice(invoiceData: InvoiceData) {
    // UBL-TR XML oluştur
    // GİB'e gönder
    // Fatura numarası al
  }

  // 3. Fatura durumu kontrol et
  static async checkInvoiceStatus(faturaUUID: string) {
    // GİB'den durum sorgula
  }

  // 4. Fatura iptal et
  static async cancelInvoice(faturaUUID: string, reason: string) {
    // GİB'de fatura iptal
  }
}
```

---

## 💰 MALİYET TAHMİNİ

| İşlem | Süre | Maliyet |
|-------|------|---------|
| GİB Başvuru | 1-2 hafta | Ücretsiz |
| Test Sertifikası | 1 hafta | ~500₺ |
| Geliştirme | 3-4 hafta | 15.000₺-25.000₺ |
| Prodüksiyon Sertifikası | 1 hafta | ~2.000₺ |
| **TOPLAM** | **6-8 hafta** | **17.500₺-27.500₺** |

---

## ⚠️ ÖNEMLİ NOTLAR

### 1. Canlı Sistem Güvenliği
- ❌ Mevcut sistemi durdurmayın
- ✅ Paralel test ortamı kurun
- ✅ Veri yedeklemelerini alın

### 2. Yasal Uyumluluk
- 📜 Faturas sermayenin %100 e.arşiv uyumlu olması gerekiyor
- 📜 Geçiş süreci planlanmalı
- 📜 Müşteri bilgilendirmesi yapılmalı

### 3. Teknik Riskler
- 🔧 GİB API değişiklikleri
- 🔧 Sertifika yenileme süreçleri
- 🔧 XML format güncellemeleri

---

## 🎯 TAVSİYE

**ÖNCE:** Mevcut PDF fatura sistemini çalışır hale getirin
**SONRA:** e.arşiv entegrasyonu için profesyonel destek alın

Bu entegrasyon karmaşık bir süreç ve canlı sisteminizi etkilememesi için dikkatli planlanmalı.

---

## 📞 DESTEK

Bu rehberi takip ederek adım adım ilerleyebilirsiniz. Her aşamada sorularınız olursa yardımcı olabilirim.

**ÖNEMLİ:** Canlı verilerde hiçbir değişiklik yapmadan önce mutlaka test edilmeli! 