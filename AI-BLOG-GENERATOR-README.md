# 🤖 AI Blog Yazısı Oluşturucu - Kullanım Kılavuzu

## 📋 Genel Bakış

ModaBase projesi için yapay zeka destekli blog yazısı oluşturucu sistemi. OpenAI GPT-4 kullanarak otomatik olarak kaliteli, SEO dostu blog yazıları üretir.

## 🚀 Özellikler

- **🤖 OpenAI GPT-4 Entegrasyonu**: En gelişmiş AI modeli ile içerik üretimi
- **📝 SEO Optimizasyonu**: Otomatik meta veriler, başlıklar ve etiketler
- **🎨 Görsel Seçimi**: Unsplash'ten uygun görseller otomatik seçimi
- **📊 İçerik Analizi**: Kelime sayısı ve okuma süresi hesaplama
- **🔗 URL Yönetimi**: Otomatik slug oluşturma (Türkçe karakter desteği)
- **📱 Admin Paneli**: Kullanıcı dostu arayüz

## ⚙️ Kurulum

### 1. OpenAI API Key Ekleme

`.env` dosyasına OpenAI API key'inizi ekleyin:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. API Key Alma

1. [OpenAI Platform](https://platform.openai.com/) adresine gidin
2. Hesabınıza giriş yapın
3. "API Keys" bölümünden yeni key oluşturun
4. Key'i güvenli bir yerde saklayın

## 🎯 Kullanım

### Admin Panelinden Kullanım

1. **Admin paneline giriş yapın**
2. **AI Blog Yazısı Oluşturucu** bölümünü bulun
3. **Blog konusu** girin (örn: "2024 Kış Moda Trendleri")
4. **Kategori** seçin
5. **"AI ile Blog Yazısı Oluştur"** butonuna tıklayın
6. **Oluşturulan yazıyı** kontrol edin ve gerekirse düzenleyin

### Komut Satırından Kullanım

#### Tek Blog Yazısı Oluşturma

```bash
node scripts/openai-blog-generator.js "Blog Konusu" "Kategori"
```

Örnek:
```bash
node scripts/openai-blog-generator.js "2024 Kış Moda Trendleri" "Moda Trendleri"
```

#### Toplu Blog Yazısı Oluşturma

```bash
node scripts/openai-blog-generator.js
```

Bu komut önceden tanımlanmış konuları otomatik olarak oluşturur.

### Örnek Konular

- 2024 Kış Moda Trendleri
- Sürdürülebilir Tekstil Üretimi
- Organik Kumaşların Faydaları
- Ev Tekstili Bakım Rehberi
- Spor Giyiminde Teknoloji
- Kadın Giyimde Kombinleme Sanatı
- Erkek Giyimde Profesyonel Görünüm
- Çocuk Giyiminde Konfor ve Güvenlik
- Aksesuar Seçiminde Altın Kurallar
- Kumaş Türleri ve Özellikleri

## 📊 AI İçerik Özellikleri

### İçerik Kalitesi
- **800-1200 kelime** arası detaylı yazılar
- **SEO dostu** başlıklar ve meta açıklamalar
- **Pratik öneriler** ve uygulanabilir bilgiler
- **Güncel trendler** ve moda bilgileri

### Otomatik Özellikler
- **Slug oluşturma**: Türkçe karakterleri İngilizce karakterlere dönüştürme
- **Meta veriler**: Başlık, özet, etiketler
- **Görsel seçimi**: Unsplash'ten uygun görseller
- **Okuma süresi**: Otomatik hesaplama (200 kelime/dakika)
- **Kategori atama**: İçeriğe uygun kategori seçimi

## 🔧 Teknik Detaylar

### API Endpoint

```
POST /api/admin/blog/generate
```

**Request Body:**
```json
{
  "topic": "Blog konusu",
  "category": "Kategori adı"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI blog yazısı başarıyla oluşturuldu",
  "post": {
    "id": "post-id",
    "title": "Blog başlığı",
    "slug": "blog-slug",
    "excerpt": "Blog özeti",
    "category": "Kategori",
    "readTime": 5,
    "url": "/blog/blog-slug"
  }
}
```

### Veritabanı Şeması

Blog yazıları `BlogPost` modelinde saklanır:

```prisma
model BlogPost {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String
  content     String
  author      String
  publishedAt DateTime?
  tags        String[]
  image       String
  readTime    Int
  category    String
  viewCount   Int      @default(0)
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🎨 Özelleştirme

### Prompt Özelleştirme

`app/api/admin/blog/generate/route.ts` dosyasındaki prompt'u özelleştirebilirsiniz:

```typescript
const prompt = `
Aşağıdaki konu hakkında SEO dostu, detaylı bir blog yazısı oluştur:

Konu: ${topic}
Kategori: ${category}

// Prompt içeriğini buradan özelleştirin
`
```

### Kategori Ekleme

`components/AIBlogGenerator.tsx` dosyasındaki kategorileri güncelleyin:

```typescript
const categories = [
  'Kadın Giyimi',
  'Erkek Giyimi', 
  'Çocuk Giyimi',
  'Aksesuar',
  'Spor Giyimi',
  'Ev Tekstili',
  'Moda Trendleri',
  'Sürdürülebilir Moda',
  'Kumaş Rehberi',
  // Yeni kategoriler buraya eklenebilir
]
```

## ⚠️ Önemli Notlar

### API Limitleri
- OpenAI API kullanım limitlerine dikkat edin
- Rate limiting için 3 saniye bekleme süresi eklenmiştir
- API key'inizi güvenli tutun

### İçerik Kalitesi
- AI tarafından oluşturulan içerikleri her zaman kontrol edin
- Gerekirse manuel düzenlemeler yapın
- Telif hakkı konularına dikkat edin

### Maliyet
- OpenAI API kullanımı ücretlidir
- GPT-4 modeli daha pahalıdır ama daha kaliteli içerik üretir
- Kullanım maliyetlerini takip edin

## 🐛 Sorun Giderme

### Yaygın Hatalar

1. **"OpenAI API key bulunamadı"**
   - `.env` dosyasında `OPENAI_API_KEY` tanımlı olduğundan emin olun

2. **"AI yanıtı JSON formatında değil"**
   - Prompt'u kontrol edin ve JSON formatını zorunlu kılın

3. **"Blog yazısı oluşturulamadı"**
   - API key'inizin geçerli olduğunu kontrol edin
   - OpenAI hesabınızda kredi olduğundan emin olun

### Debug Modu

Hata ayıklama için console logları ekleyin:

```typescript
console.log('API Response:', data)
console.log('Generated Content:', content)
```

## 📈 Performans Optimizasyonu

### Öneriler
- **Batch işlemler**: Toplu blog yazısı oluşturma için script kullanın
- **Cache**: Sık kullanılan prompt'ları cache'leyin
- **Rate limiting**: API çağrılarını sınırlayın
- **Error handling**: Hata durumlarını düzgün şekilde yönetin

## 🔮 Gelecek Özellikler

- [ ] Çoklu dil desteği
- [ ] Görsel AI entegrasyonu
- [ ] İçerik analizi ve raporlama
- [ ] Otomatik sosyal medya paylaşımı
- [ ] A/B test desteği
- [ ] İçerik kalite skorlaması

## 📞 Destek

Sorunlarınız için:
1. GitHub Issues kullanın
2. Console loglarını kontrol edin
3. OpenAI API dokümantasyonunu inceleyin

---

**Not**: Bu sistem OpenAI API kullanır ve ücretlidir. Kullanım maliyetlerini takip etmeyi unutmayın. 