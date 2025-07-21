import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Türkçe karakterleri İngilizce karakterlere dönüştür
function createSlug(text: string) {
  const turkishToEnglish: { [key: string]: string } = {
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
async function generateBlogPostWithAI(topic: string, category: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key bulunamadı')
  }

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
  "image": "https://images.unsplash.com/...",
  "category": "${category}"
}
`

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

  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error('AI yanıtı JSON formatında değil')
  }
}

// AI blog yazısı oluştur
export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrol et
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { topic, category } = body

    if (!topic || !category) {
      return NextResponse.json(
        { error: 'Konu ve kategori gerekli' },
        { status: 400 }
      )
    }

    // AI ile blog yazısı oluştur
    const blogData = await generateBlogPostWithAI(topic, category)

    // Slug oluştur
    const slug = createSlug(blogData.title)
    const wordCount = blogData.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    // Veritabanına kaydet
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

    return NextResponse.json({
      success: true,
      message: 'AI blog yazısı başarıyla oluşturuldu',
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        readTime: post.readTime,
        url: `/blog/${post.slug}`
      }
    })

  } catch (error) {
    console.error('AI blog yazısı oluşturma hatası:', error)
    return NextResponse.json(
      { 
        error: 'Blog yazısı oluşturulurken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
} 