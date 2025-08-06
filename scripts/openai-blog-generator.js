const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient()

// OpenAI API için gerekli
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

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
async function generateBlogPostWithOpenAI(topic, category) {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable bulunamadı!')
    console.log('Lütfen .env dosyasına OPENAI_API_KEY=your-api-key ekleyin')
    return null
  }

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

Sadece JSON formatında döndür, başka açıklama ekleme:
{
  "title": "Başlık",
  "excerpt": "Özet",
  "content": "HTML içerik",
  "tags": ["etiket1", "etiket2"],
  "category": "${category}"
}
`

    console.log('🤖 OpenAI API ile blog yazısı oluşturuluyor...')
    console.log('Konu:', topic)
    console.log('Kategori:', category)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Sen bir moda ve tekstil uzmanı blog yazarısın. SEO dostu, kaliteli içerik üretirsin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API hatası: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // JSON parse et
    try {
      const blogData = JSON.parse(content)
      return blogData
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError)
      console.log('API yanıtı:', content)
      return null
    }

  } catch (error) {
    console.error('OpenAI API hatası:', error)
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
    console.log('🚀 OpenAI AI Blog Yazısı Oluşturucu Başlatılıyor...\n')
    
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
      
      // OpenAI ile blog yazısı oluştur
      const blogData = await generateBlogPostWithOpenAI(topic, category)
      
      if (blogData) {
        // Veritabanına kaydet
        await saveBlogPost(blogData)
      } else {
        console.log(`❌ "${topic}" oluşturulamadı\n`)
      }
      
      // API rate limit için bekle
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    console.log('🎉 OpenAI AI blog yazısı oluşturma tamamlandı!')
    
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
  
  generateBlogPostWithOpenAI(topic, category)
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