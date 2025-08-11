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

// Template blog yazısı oluştur
function generateTemplateBlogPost(topic: string, category: string) {
  const templates: { [key: string]: any } = {
    'Kadın Giyimi': {
      title: `${topic} Rehberi: 2024 Trendleri ve Öneriler`,
      excerpt: `${topic} konusunda uzman önerileri ve güncel trendleri keşfedin. Kaliteli ürün seçimi ve stil önerileri.`,
      content: `
        <h2>${topic} Nedir?</h2>
        <p>${topic}, modern kadının gardırobunun vazgeçilmez parçalarından biridir. Hem şık hem de konforlu tasarımlarıyla her mevsim tercih edilen ürünler arasında yer alır.</p>
        
        <h3>2024 ${topic} Trendleri</h3>
        <ul>
          <li><strong>Sürdürülebilir Malzemeler:</strong> Çevre dostu kumaşlar ön planda</li>
          <li><strong>Minimalist Tasarımlar:</strong> Sade ve şık çizgiler</li>
          <li><strong>Pastel Tonlar:</strong> Yumuşak ve huzur veren renkler</li>
          <li><strong>Fonksiyonel Detaylar:</strong> Pratik kullanım öncelikli</li>
        </ul>
        
        <h3>${topic} Seçerken Dikkat Edilmesi Gerekenler</h3>
        <p>Kaliteli bir ${topic} seçerken malzeme kalitesi, dikiş işçiliği ve vücut tipinize uygunluk önemlidir. Ayrıca mevsim koşullarına uygun kumaş seçimi de dikkat edilmesi gereken noktalardan biridir.</p>
        
        <h3>${topic} Kombinleme Önerileri</h3>
        <p>${topic} ürünlerini farklı parçalarla kombinleyerek çok yönlü görünümler elde edebilirsiniz. Günlük kullanımdan özel günlere kadar her duruma uygun kombinler oluşturabilirsiniz.</p>
        
        <h2>Sonuç</h2>
        <p>${topic} seçiminde kalite, konfor ve stil dengesini kurarak uzun ömürlü ve şık parçalar elde edebilirsiniz. Doğru seçimlerle gardırobunuzu çeşitlendirebilir ve her duruma uygun kombinler oluşturabilirsiniz.</p>
      `,
      tags: [topic.toLowerCase(), 'kadın giyimi', 'moda trendleri', 'stil önerileri', 'gardırop'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
    },
    'Moda Trendleri': {
      title: `${topic}: 2024'ün En Popüler Trendleri`,
      excerpt: `${topic} konusunda güncel trendleri ve uzman önerilerini keşfedin. Stil rehberi ve pratik öneriler.`,
      content: `
        <h2>${topic} Trendleri</h2>
        <p>2024 yılında ${topic} konusunda birçok yeni trend öne çıkıyor. Bu trendler hem sürdürülebilirlik hem de stil odaklı yaklaşımları bir araya getiriyor.</p>
        
        <h3>Öne Çıkan Trendler</h3>
        <ul>
          <li><strong>Sürdürülebilir Moda:</strong> Çevre dostu üretim süreçleri</li>
          <li><strong>Teknoloji Entegrasyonu:</strong> Akıllı tekstil ürünleri</li>
          <li><strong>Vintage Dönüşü:</strong> Klasik tasarımların modern yorumları</li>
          <li><strong>Minimalizm:</strong> Sade ve etkili tasarımlar</li>
        </ul>
        
        <h3>Trendleri Nasıl Uygulayabilirsiniz?</h3>
        <p>Bu trendleri günlük hayatınıza entegre ederken, kişisel tarzınızı korumaya özen gösterin. Trendleri kendi stilinize uyarlayarak özgün kombinler oluşturabilirsiniz.</p>
        
        <h3>Sezonluk Öneriler</h3>
        <p>Her mevsimin kendine özgü trendleri vardır. Bu trendleri mevsim koşullarına uygun şekilde değerlendirerek, hem şık hem de pratik seçimler yapabilirsiniz.</p>
        
        <h2>Sonuç</h2>
        <p>${topic} konusunda güncel kalmak, kişisel tarzınızı geliştirmenize yardımcı olur. Doğru trendleri doğru şekilde uygulayarak, her zaman şık ve güncel görünebilirsiniz.</p>
      `,
      tags: [topic.toLowerCase(), 'moda trendleri', '2024', 'stil rehberi', 'fashion'],
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop'
    },
    'Ev Tekstili': {
      title: `${topic} Seçiminde Uzman Rehberi`,
      excerpt: `${topic} konusunda kalite ve konfor nasıl sağlanır? Uzman önerileri ve pratik ipuçları.`,
      content: `
        <h2>${topic} Nedir?</h2>
        <p>${topic}, evinizin konforunu ve estetiğini artıran önemli unsurlardan biridir. Doğru seçimlerle hem görsel hem de fonksiyonel fayda sağlar.</p>
        
        <h3>Kaliteli ${topic} Nasıl Seçilir?</h3>
        <ul>
          <li><strong>Malzeme Kalitesi:</strong> Doğal ve dayanıklı kumaşlar</li>
          <li><strong>Dikiş İşçiliği:</strong> Sağlam ve düzgün dikişler</li>
          <li><strong>Renk Uyumu:</strong> Ev dekorasyonuyla uyumlu renkler</li>
          <li><strong>Bakım Kolaylığı:</strong> Pratik temizlik ve bakım</li>
        </ul>
        
        <h3>${topic} Bakımı</h3>
        <p>Düzenli bakım ile ${topic} ürünlerinizin ömrünü uzatabilir ve görünümünü koruyabilirsiniz. Üretici talimatlarına uygun bakım yapmak önemlidir.</p>
        
        <h3>Dekorasyon İpuçları</h3>
        <p>${topic} ürünlerini evinizin genel dekorasyonuyla uyumlu şekilde yerleştirerek, hem fonksiyonel hem de estetik bir ortam yaratabilirsiniz.</p>
        
        <h2>Sonuç</h2>
        <p>Doğru ${topic} seçimi ve bakımı ile evinizin konforunu ve estetiğini artırabilir, uzun ömürlü kullanım elde edebilirsiniz.</p>
      `,
      tags: [topic.toLowerCase(), 'ev tekstili', 'dekorasyon', 'ev bakımı', 'konfor'],
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
    }
  }

  const template = templates[category] || templates['Moda Trendleri']
  
  return {
    title: template.title.replace('${topic}', topic),
    excerpt: template.excerpt.replace('${topic}', topic),
    content: template.content.replace(/\${topic}/g, topic),
    tags: template.tags,
    image: template.image,
    category: category
  }
}

// AI ile blog yazısı oluştur (Template kullanarak)
async function generateBlogPostWithAI(topic: string, category: string) {
  // Template kullanarak blog yazısı oluştur
  return generateTemplateBlogPost(topic, category)
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