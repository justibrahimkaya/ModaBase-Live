const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient()

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

// Hugging Face API ile blog yazısı oluştur
async function generateBlogPostWithHuggingFace(topic, category) {
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

    console.log('🤖 Hugging Face API ile blog yazısı oluşturuluyor...')
    console.log('Konu:', topic)
    console.log('Kategori:', category)

    // Hugging Face Inference API kullan
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer hf_xxx' // Ücretsiz kullanım için gerekli değil
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true
        }
      })
    })

    if (!response.ok) {
      // Hugging Face API çalışmazsa, basit bir template kullan
      console.log('⚠️ Hugging Face API çalışmıyor, template kullanılıyor...')
      return generateTemplateBlogPost(topic, category)
    }

    const data = await response.json()
    const content = data[0]?.generated_text || data.generated_text

    // JSON parse et
    try {
      const blogData = JSON.parse(content)
      return blogData
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError)
      console.log('API yanıtı:', content)
      // Template kullan
      return generateTemplateBlogPost(topic, category)
    }

  } catch (error) {
    console.error('Hugging Face API hatası:', error)
    // Template kullan
    return generateTemplateBlogPost(topic, category)
  }
}

// Template blog yazısı oluştur (API çalışmazsa)
function generateTemplateBlogPost(topic, category) {
  const templates = {
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
    console.log('🚀 Hugging Face AI Blog Yazısı Oluşturucu Başlatılıyor...\n')
    
    // Örnek konular ve kategoriler
    const topics = [
      {
        topic: '2024 Kış Moda Trendleri',
        category: 'Moda Trendleri'
      },
      {
        topic: 'Sürdürülebilir Tekstil Üretimi',
        category: 'Moda Trendleri'
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
      const blogData = await generateBlogPostWithHuggingFace(topic, category)
      
      if (blogData) {
        // Veritabanına kaydet
        await saveBlogPost(blogData)
      } else {
        console.log(`❌ "${topic}" oluşturulamadı\n`)
      }
      
      // Rate limit için bekle
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('🎉 Hugging Face AI blog yazısı oluşturma tamamlandı!')
    
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
  
  generateBlogPostWithHuggingFace(topic, category)
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