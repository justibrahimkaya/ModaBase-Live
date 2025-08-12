# Google Tag Manager (GTM) Kullanım Kılavuzu

## 🚨 Önemli: GTM Container Dosyası

GTM container JSON dosyası (`GTM-KLXBLCV6_v4.json`) **public klasörüne konmamalıdır!**

### ❌ Yanlış Kullanım:
```
public/
└── GTM-KLXBLCV6_v4.json  ❌ GÜVENLİK RİSKİ!
```

### ✅ Doğru Kullanım:
```
gtm-backups/
└── GTM-KLXBLCV6_v4.json  ✅ Güvenli
```

## 📁 Container Dosyası Nedir?

GTM container dosyası:
- Tüm tag'lerinizin, trigger'larınızın ve değişkenlerinizin yedeğidir
- İmport/export işlemleri için kullanılır
- Versiyon kontrolü için saklanabilir
- **Production'da kullanılmaz!**

## 🔧 GTM Entegrasyonu

GTM zaten `app/layout.tsx` dosyasında doğru şekilde entegre edilmiş:

```javascript
// GTM Container ID
GTM-KLXBLCV6

// Head tag'inde
<script src="https://www.googletagmanager.com/gtm.js?id=GTM-KLXBLCV6"></script>

// Body tag'inde (noscript)
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KLXBLCV6"></iframe>
</noscript>
```

## 🛡️ Güvenlik Nedenleri

Container dosyasını public'e koymamak için nedenler:

1. **Hassas Bilgiler**: Tag konfigürasyonları, API anahtarları olabilir
2. **İç Yapı Bilgisi**: Analitik ve pazarlama stratejiniz görünür olur
3. **Gereksiz Dosya**: GTM kendi sunucularından yüklenir
4. **Performans**: Gereksiz dosya boyutu

## 📝 Doğru Workflow

1. **GTM Yönetimi**: https://tagmanager.google.com adresinden yapılır
2. **Yedekleme**: Container'ı export edip `gtm-backups/` klasörüne kaydedin
3. **Versiyon Kontrolü**: `.gitignore`'da `gtm-backups/` klasörü hariç tutulmuştur
4. **Deployment**: Sadece GTM ID'si kodda olmalı, container dosyası değil

## 🚀 Best Practices

1. **Container Versiyonlama**: Her önemli değişiklikten sonra export alın
2. **İsimlendirme**: `GTM-{CONTAINER_ID}_v{VERSION}.json` formatını kullanın
3. **Dokümantasyon**: Önemli tag değişikliklerini belgeleyin
4. **Test**: Önce GTM Preview mode'da test edin

## 📌 Özet

- ✅ GTM ID'si kodda olmalı
- ✅ Container dosyası backup için saklanmalı
- ❌ Container dosyası public'e konmamalı
- ❌ Container dosyası production'a deploy edilmemeli
