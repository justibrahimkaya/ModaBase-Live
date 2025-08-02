# WhatsApp Entegrasyonu - ModaBase

Bu dokümantasyon, ModaBase projesine eklenen WhatsApp entegrasyonunun nasıl kullanılacağını açıklar.

## 🎯 Amaç

WhatsApp entegrasyonu iki ana amaç için tasarlanmıştır:

1. **İşletme Paneli**: İşletme sahiplerinin ModaBase süper admin ile iletişim kurması
2. **Ana Sayfa**: Normal kullanıcıların işletme sahipleri ile iletişim kurması

## 📁 Dosya Yapısı

```
components/
├── WhatsAppButton.tsx          # Ana WhatsApp buton bileşeni
└── ...

app/
├── api/
│   └── whatsapp/
│       └── route.ts            # WhatsApp numaraları API endpoint'i
├── admin/
│   └── layout.tsx              # Admin paneli layout'u (WhatsApp butonu eklendi)
├── page.tsx                    # Ana sayfa (WhatsApp butonu eklendi)
├── product/[id]/
│   └── page.tsx                # Ürün detay sayfası (WhatsApp butonu eklendi)
└── test-whatsapp/
    └── page.tsx                # Test sayfası
```

## 🚀 Kurulum

### 1. Environment Variables

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# WhatsApp Numaraları
WHATSAPP_SUPPORT_NUMBER=905555555555
WHATSAPP_BUSINESS_NUMBER=905555555555
WHATSAPP_ADMIN_NUMBER=905555555555
```

### 2. Numaraları Ayarlama

- **WHATSAPP_SUPPORT_NUMBER**: Müşteri desteği için (ana sayfa, ürün sayfaları)
- **WHATSAPP_BUSINESS_NUMBER**: İşletme desteği için (gelecekte kullanılabilir)
- **WHATSAPP_ADMIN_NUMBER**: İşletme sahiplerinin ModaBase admin ile iletişimi için

## 🎨 Kullanım

### WhatsAppButton Bileşeni

```tsx
import WhatsAppButton from '@/components/WhatsAppButton'

// Temel kullanım
<WhatsAppButton
  phoneNumber="905555555555"
  variant="floating"
  size="md"
  isBusinessAdmin={false}
/>

// Gelişmiş kullanım
<WhatsAppButton
  phoneNumber="905555555555"
  message="Özel mesaj"
  variant="inline"
  size="lg"
  isBusinessAdmin={true}
  businessName="ModaBase"
  className="custom-class"
/>
```

### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `phoneNumber` | string | - | WhatsApp numarası (zorunlu) |
| `message` | string | '' | Özel mesaj |
| `variant` | 'floating' \| 'inline' | 'floating' | Buton stili |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Buton boyutu |
| `className` | string | '' | Ek CSS sınıfları |
| `businessName` | string | '' | İşletme adı |
| `isBusinessAdmin` | boolean | false | İşletme admin'i mi? |

## 📱 Özellikler

### 1. Dinamik Numaralar
- API endpoint'ten numaralar otomatik yüklenir
- Environment variables ile yönetilir
- Fallback numaralar mevcuttur

### 2. Akıllı Mesajlar
- İşletme admin'leri için özel mesaj
- Müşteriler için işletme adı ile özelleştirilmiş mesaj
- Özel mesaj desteği

### 3. Responsive Tasarım
- Mobil uyumlu
- Farklı boyut seçenekleri
- Floating ve inline varyantlar

### 4. Hover Efektleri
- Tooltip gösterimi
- Animasyonlar
- Modern UI tasarımı

## 🧪 Test

Test sayfasına erişmek için: `http://localhost:3000/test-whatsapp`

Bu sayfada:
- Farklı varyantları test edebilirsiniz
- Numaraları değiştirebilirsiniz
- Mesajları özelleştirebilirsiniz
- Boyutları deneyebilirsiniz

## 🔧 Özelleştirme

### Renk Değiştirme

```css
/* WhatsApp butonunun rengini değiştirmek için */
.whatsapp-button {
  background-color: #your-color !important;
}
```

### Pozisyon Değiştirme

```tsx
// Floating buton pozisyonunu değiştirmek için
<WhatsAppButton
  className="bottom-4 left-4" // Sağ alt yerine sol alt
  variant="floating"
/>
```

### Mesaj Şablonları

```tsx
// Özel mesaj şablonları
const customMessage = `Merhaba, ${productName} ürünü hakkında bilgi almak istiyorum. 
Fiyat: ${price}₺
Stok: ${stock} adet`

<WhatsAppButton
  message={customMessage}
  phoneNumber="905555555555"
/>
```

## 🚨 Güvenlik

- Numaralar environment variables'da saklanır
- API endpoint güvenli şekilde yapılandırılmıştır
- XSS koruması mevcuttur

## 🔄 Güncellemeler

### v1.0.0 (İlk Sürüm)
- ✅ Temel WhatsApp entegrasyonu
- ✅ Floating ve inline butonlar
- ✅ Dinamik numara yönetimi
- ✅ Test sayfası
- ✅ Responsive tasarım

### Gelecek Özellikler
- [ ] WhatsApp Business API entegrasyonu
- [ ] Mesaj şablonları yönetimi
- [ ] İstatistikler ve raporlama
- [ ] Çoklu dil desteği
- [ ] Otomatik mesaj yanıtları

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Test sayfasını kontrol edin
2. Environment variables'ları doğrulayın
3. Console hatalarını kontrol edin
4. WhatsApp numaralarının doğru formatta olduğundan emin olun

## 📝 Notlar

- WhatsApp numaraları ülke kodu ile başlamalı (Türkiye: 90)
- Boşluk, tire veya parantez kullanmayın
- Test için gerçek WhatsApp numaraları kullanın
- Production'da environment variables'ları mutlaka ayarlayın 