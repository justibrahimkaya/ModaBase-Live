const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const samplePosts = [
  {
    title: "2024 Yaz Moda Trendleri: Bu Sezonun En Popüler Parçaları",
    excerpt: "2024 yaz sezonunda öne çıkan moda trendlerini keşfedin. Renkli kombinler, doğal kumaşlar ve sürdürülebilir moda hakkında her şey.",
    content: `
      <h2>2024 Yaz Moda Trendleri</h2>
      <p>Bu yaz sezonunda moda dünyası sürdürülebilirlik ve konfor odaklı tasarımlarla öne çıkıyor. İşte bu sezonun en popüler trendleri:</p>
      
      <h3>1. Doğal Kumaşlar</h3>
      <p>Pamuk, keten ve bambu gibi doğal kumaşlar bu sezon çok popüler. Hem çevre dostu hem de cildiniz için sağlıklı.</p>
      
      <h3>2. Pastel Renkler</h3>
      <p>Lavanta, mint yeşili ve şeftali tonları bu yazın favori renkleri. Soft ve rahatlatıcı görünümler için ideal.</p>
      
      <h3>3. Oversize Siluetler</h3>
      <p>Rahat ve konforlu kesimler öne çıkıyor. Oversize blazer ceketler ve geniş pantolonlar bu sezonun vazgeçilmezleri.</p>
      
      <h3>4. Sürdürülebilir Moda</h3>
      <p>Çevre dostu moda markaları ve geri dönüştürülmüş kumaşlar giderek daha popüler hale geliyor.</p>
    `,
    author: "ModaBase Editör",
    tags: ["moda", "trend", "yaz", "2024", "sürdürülebilir"],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    category: "Moda Trendleri",
    isPublished: true
  },
  {
    title: "Kadın Giyimde Kombinleme Sanatı: Temel Parçalarla Şık Görünümler",
    excerpt: "Temel parçalarınızı nasıl kombinleyeceğinizi öğrenin. Minimal gardırop ile maksimum stil yaratmanın püf noktaları.",
    content: `
      <h2>Kombinleme Sanatı</h2>
      <p>Az parça ile çok kombin yaratmak mümkün! İşte temel parçalarınızı nasıl değerlendireceğiniz:</p>
      
      <h3>1. Beyaz Gömlek</h3>
      <p>Beyaz gömlek her gardırobun vazgeçilmezi. Kot pantolon, etek veya şort ile kombinleyebilirsiniz.</p>
      
      <h3>2. Kot Pantolon</h3>
      <p>Klasik kot pantolon her yaşta şık durur. Üst kısmı değiştirerek farklı görünümler yaratabilirsiniz.</p>
      
      <h3>3. Blazer Ceket</h3>
      <p>Blazer ceket hem günlük hem de resmi ortamlar için ideal. Gömlek veya t-shirt ile kombinleyebilirsiniz.</p>
      
      <h3>4. Aksesuar Kullanımı</h3>
      <p>Küpe, kolye ve çanta gibi aksesuarlar kombinlerinizi tamamlar. Minimal aksesuarlar her zaman şık durur.</p>
    `,
    author: "ModaBase Editör",
    tags: ["kombinleme", "kadın giyim", "stil", "aksesuar"],
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800",
    category: "Stil Rehberi",
    isPublished: true
  },
  {
    title: "Erkek Giyimde Profesyonel Görünüm: İş Hayatında Stil",
    excerpt: "İş hayatında profesyonel ve şık görünmenin yolları. Erkek giyimde iş kıyafetleri ve kombinleme önerileri.",
    content: `
      <h2>Profesyonel Erkek Giyimi</h2>
      <p>İş hayatında başarılı görünmek için giyim çok önemli. İşte profesyonel görünüm için öneriler:</p>
      
      <h3>1. Klasik Takım Elbise</h3>
      <p>Lacivert veya gri takım elbise her zaman şık durur. Kaliteli kumaş seçimi önemli.</p>
      
      <h3>2. Gömlek Seçimi</h3>
      <p>Beyaz, açık mavi veya açık gri gömlekler profesyonel görünüm için ideal.</p>
      
      <h3>3. Ayakkabı</h3>
      <p>Deri ayakkabılar her zaman tercih edilmeli. Oxford veya Derby modelleri şık durur.</p>
      
      <h3>4. Aksesuarlar</h3>
      <p>Klasik saat, deri kemer ve minimal takılar profesyonel görünümü tamamlar.</p>
    `,
    author: "ModaBase Editör",
    tags: ["erkek giyim", "profesyonel", "iş kıyafeti", "stil"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    category: "Erkek Giyimi",
    isPublished: true
  },
  {
    title: "Çocuk Giyiminde Konfor ve Stil: Çocuklarınız İçin Doğru Seçimler",
    excerpt: "Çocuk giyiminde konfor ve stil nasıl bir arada olur? Çocuklarınız için doğru kıyafet seçimi rehberi.",
    content: `
      <h2>Çocuk Giyimi Rehberi</h2>
      <p>Çocukların hem konforlu hem de şık görünmesi için dikkat edilmesi gerekenler:</p>
      
      <h3>1. Kumaş Seçimi</h3>
      <p>Pamuk, keten gibi doğal kumaşlar çocuklar için en sağlıklı seçeneklerdir.</p>
      
      <h3>2. Rahat Kesimler</h3>
      <p>Çocukların hareket etmesini engellemeyecek rahat kesimler tercih edilmeli.</p>
      
      <h3>3. Dayanıklılık</h3>
      <p>Çocuk kıyafetleri sık yıkandığı için dayanıklı kumaşlar seçilmeli.</p>
      
      <h3>4. Güvenlik</h3>
      <p>Küçük parçalar ve süslemeler güvenlik riski oluşturabilir, dikkatli seçim yapılmalı.</p>
    `,
    author: "ModaBase Editör",
    tags: ["çocuk giyimi", "konfor", "güvenlik", "kumaş"],
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
    category: "Çocuk Giyimi",
    isPublished: true
  },
  {
    title: "Aksesuar Seçiminde Altın Kurallar: Tamamlayıcı Parçalar",
    excerpt: "Aksesuar seçiminde dikkat edilmesi gerekenler. Çanta, takı ve ayakkabı seçiminde stil rehberi.",
    content: `
      <h2>Aksesuar Seçimi Rehberi</h2>
      <p>Aksesuarlar kombinlerinizi tamamlayan en önemli parçalardır. İşte doğru seçim için öneriler:</p>
      
      <h3>1. Çanta Seçimi</h3>
      <p>Günlük kullanım için pratik, özel günler için şık çantalar tercih edin.</p>
      
      <h3>2. Takı Kombinleme</h3>
      <p>Minimal takılar her zaman şık durur. Büyük takıları tek tek kullanın.</p>
      
      <h3>3. Ayakkabı Seçimi</h3>
      <p>Konforlu ve şık ayakkabılar tercih edin. Günlük kullanım için pratik modeller seçin.</p>
      
      <h3>4. Renk Uyumu</h3>
      <p>Aksesuarlarınızın kıyafetlerinizle uyumlu olmasına dikkat edin.</p>
    `,
    author: "ModaBase Editör",
    tags: ["aksesuar", "çanta", "takı", "ayakkabı", "kombinleme"],
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
    category: "Aksesuar",
    isPublished: true
  }
]

async function createSamplePosts() {
  try {
    console.log('Örnek blog yazıları oluşturuluyor...')
    
    for (const post of samplePosts) {
      // Slug oluştur - Türkçe karakterleri dönüştür
      const turkishToEnglish = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g', 
        'ı': 'i', 'I': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
      }
      
      let result = post.title
      for (const [turkish, english] of Object.entries(turkishToEnglish)) {
        result = result.replace(new RegExp(turkish, 'g'), english)
      }
      
      const slug = result.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Okuma süresini hesapla
      const wordCount = post.content.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)
      
      await prisma.blogPost.create({
        data: {
          ...post,
          slug,
          readTime,
          publishedAt: new Date()
        }
      })
      
      console.log(`✅ "${post.title}" oluşturuldu`)
    }
    
    console.log('🎉 Tüm örnek blog yazıları başarıyla oluşturuldu!')
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSamplePosts() 