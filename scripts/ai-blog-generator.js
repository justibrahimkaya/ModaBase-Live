const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// OpenAI API için gerekli (gerçek API key ile değiştirilmeli)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here'

// Türkçe karakterleri İngilizce karakterlere dönüştür
function createSlug(text) {
  const turkishToEnglish = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  }
  
  let result = text
  for (const [turkish, english] of Object.entries(turkishToEnglish)) {
    result = result.replace(new RegExp(turkish, 'g'), english)
  }
  
  return result.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// OpenAI API ile blog yazısı oluştur
async function generateBlogPostWithAI(topic, category) {
  try {
    const prompt = `
Aşağıdaki konu hakkında SEO dostu, detaylı bir blog yazısı oluştur:

Konu: ${topic}
Kategori: ${category}

Yazı şu formatta olmalı:
- Başlık: Çekici ve SEO dostu
- Özet: 2-3 cümlelik kısa açıklama
- İçerik: HTML formatında, başlıklar (h2, h3), paragraflar, listeler içeren
- Etiketler: 5-7 adet ilgili anahtar kelime
- Görsel: Unsplash'ten uygun bir görsel URL'si

Yazı Türkçe olmalı ve şu özelliklere sahip olmalı:
- 800-1200 kelime
- Pratik öneriler içermeli
- Güncel trendleri yansıtmalı
- Okuyucu dostu olmalı
- SEO optimizasyonu yapılmış olmalı

JSON formatında döndür:
{
  "title": "Başlık",
  "excerpt": "Özet",
  "content": "HTML içerik",
  "tags": ["etiket1", "etiket2"],
  "category": "${category}"
}
`

    // OpenAI API çağrısı (gerçek implementasyon için OpenAI SDK kullanılmalı)
    console.log('🤖 AI blog yazısı oluşturuluyor...')
    console.log('Konu:', topic)
    console.log('Kategori:', category)
    
    // Şimdilik örnek veri döndürüyoruz
    // Gerçek uygulamada OpenAI API kullanılacak
    return {
      title: `${topic} - Kapsamlı Rehber`,
      excerpt: `${topic} hakkında detaylı bilgi ve pratik öneriler. ${category} kategorisinde uzman tavsiyeleri.`,
      content: `
        <h2>${topic} Hakkında</h2>
        <p>Bu yazımızda ${topic.toLowerCase()} konusunu detaylı olarak ele alacağız. ${category} kategorisinde önemli bilgiler ve pratik öneriler sunacağız.</p>
        
        <h3>Neden ${topic} Önemli?</h3>
        <p>${topic} konusu günümüzde büyük önem taşımaktadır. Bu konuda bilgi sahibi olmak, doğru kararlar almanızı sağlar.</p>
        
        <h3>Pratik Öneriler</h3>
        <ul>
          <li>İlk öneri</li>
          <li>İkinci öneri</li>
          <li>Üçüncü öneri</li>
        </ul>
        
        <h2>Sonuç</h2>
        <p>${topic} konusunda bilgi sahibi olmak, ${category.toLowerCase()} alanında başarılı olmanızı sağlayacaktır.</p>
      `,
      tags: [topic.toLowerCase(), category.toLowerCase(), 'rehber', 'öneriler', 'bilgi'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      category: category
    }
  } catch (error) {
    console.error('AI blog yazısı oluşturma hatası:', error)
    return null
  }
}

// Blog yazısını veritabanına kaydet
async function saveBlogPost(blogData) {
  try {
    const slug = createSlug(blogData.title)
    const wordCount = blogData.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)
    
    const post = await prisma.blogPost.create({
      data: {
        title: blogData.title,
        slug: slug,
        excerpt: blogData.excerpt,
        content: blogData.content,
        author: 'ModaBase AI Editör',
        tags: blogData.tags,
        image: blogData.image,
        category: blogData.category,
        readTime: readTime,
        isPublished: true,
        publishedAt: new Date(),
        viewCount: 0
      }
    })
    
    console.log(`✅ "${blogData.title}" başarıyla oluşturuldu`)
    console.log(`   Slug: ${slug}`)
    console.log(`   URL: /blog/${slug}`)
    console.log(`   Kelime sayısı: ${wordCount}`)
    console.log(`   Okuma süresi: ${readTime} dakika\n`)
    
    return post
  } catch (error) {
    console.error('Blog yazısı kaydetme hatası:', error)
    return null
  }
}

// Ana fonksiyon
async function generateAIBlogPosts() {
  try {
    console.log('🚀 AI Blog Yazısı Oluşturucu Başlatılıyor...\n')
    
    // Örnek konular ve kategoriler
    const topics = [
      {
        topic: '2024 Kış Moda Trendleri',
        category: 'Moda Trendleri'
      },
      {
        topic: 'Sürdürülebilir Tekstil Üretimi',
        category: 'Sürdürülebilir Moda'
      },
      {
        topic: 'Organik Kumaşların Faydaları',
        category: 'Kumaş Rehberi'
      },
      {
        topic: 'Ev Tekstili Bakım Rehberi',
        category: 'Ev Tekstili'
      },
      {
        topic: 'Spor Giyiminde Teknoloji',
        category: 'Spor Giyimi'
      }
    ]
    
    for (const { topic, category } of topics) {
      console.log(`📝 "${topic}" konusu işleniyor...`)
      
      // AI ile blog yazısı oluştur
      const blogData = await generateBlogPostWithAI(topic, category)
      
      if (blogData) {
        // Veritabanına kaydet
        await saveBlogPost(blogData)
      } else {
        console.log(`❌ "${topic}" oluşturulamadı\n`)
      }
      
      // API rate limit için bekle
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('🎉 AI blog yazısı oluşturma tamamlandı!')
    
  } catch (error) {
    console.error('❌ Genel hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Komut satırı argümanları
const args = process.argv.slice(2)
if (args.length >= 2) {
  const topic = args[0]
  const category = args[1]
  
  generateBlogPostWithAI(topic, category)
    .then(blogData => {
      if (blogData) {
        saveBlogPost(blogData)
      }
    })
    .catch(console.error)
    .finally(() => prisma.$disconnect())
} else {
  // Varsayılan olarak örnek konuları oluştur
  generateAIBlogPosts()
} 