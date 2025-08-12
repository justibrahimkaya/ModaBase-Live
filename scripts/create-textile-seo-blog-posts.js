const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const textileBlogPosts = [
  {
    title: "Kadın Giyiminde 2024 Trendleri: Sezonun En Popüler Parçaları",
    excerpt: "2024 kadın giyim trendlerini keşfedin. Bu sezonun en popüler renkleri, desenleri ve stil önerileri ile gardırobunuzu yenileyin.",
    content: `
      <h2>2024 Kadın Giyim Trendleri</h2>
      <p>2024 yılında kadın giyiminde öne çıkan trendler, hem konfor hem de stil odaklı tasarımları bir araya getiriyor. İşte bu sezonun en popüler parçaları:</p>
      
      <h3>1. Oversize Blazer Ceketler</h3>
      <p>Oversize kesim blazer ceketler, hem iş hem de günlük hayatta şık bir görünüm sağlıyor. Nötr renklerde tercih edebileceğiniz bu parçalar, her türlü kombinle uyum sağlar.</p>
      
      <h3>2. Yüksek Bel Pantolonlar</h3>
      <p>Yüksek bel pantolonlar, hem uzun boylu hem de kısa boylu kadınlar için ideal seçeneklerdir. Bacakları uzun gösterir ve şık bir siluet yaratır.</p>
      
      <h3>3. Pastel Renkler</h3>
      <p>2024'te pastel renkler öne çıkıyor. Lavanta, pudra pembesi ve mint yeşili gibi renkler, hem günlük hem de özel günlerde tercih edilebilir.</p>
      
      <h3>4. Çiçekli Desenler</h3>
      <p>Çiçekli desenler her zaman popülerdir. Bu sezon daha büyük ve canlı çiçek desenleri tercih ediliyor.</p>
      
      <h2>Kombinleme Önerileri</h2>
      <p>Trend parçaları bir araya getirirken dikkat edilmesi gerekenler:</p>
      <ul>
        <li>Renk uyumuna dikkat edin</li>
        <li>Tek bir trend parça kullanın</li>
        <li>Nötr renklerle dengeleyin</li>
        <li>Kendi tarzınızı koruyun</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["kadın giyim", "2024 trendleri", "moda", "stil önerileri", "kombinleme"],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    category: "Kadın Giyimi",
    isPublished: true
  },
  {
    title: "Erkek Giyimde Profesyonel Görünüm: İş Hayatında Stil Rehberi",
    excerpt: "İş hayatında profesyonel ve şık görünmenin sırları. Erkek giyimde iş kıyafetleri ve kombinleme önerileri ile kariyerinizde fark yaratın.",
    content: `
      <h2>İş Hayatında Profesyonel Görünüm</h2>
      <p>İş hayatında başarılı olmanın en önemli faktörlerinden biri, profesyonel bir görünüme sahip olmaktır. İşte erkek giyimde dikkat edilmesi gerekenler:</p>
      
      <h3>1. Kaliteli Takım Elbiseler</h3>
      <p>Kaliteli bir takım elbise, iş hayatının vazgeçilmezidir. Koyu renkler (siyah, lacivert, gri) tercih edin ve vücudunuza uygun kesim seçin.</p>
      
      <h3>2. Gömlek Seçimi</h3>
      <p>Beyaz, açık mavi ve açık gri gömlekler her zaman güvenilir seçeneklerdir. Kumaş kalitesine dikkat edin ve ütülü olmasına özen gösterin.</p>
      
      <h3>3. Kravat ve Aksesuarlar</h3>
      <p>Kravat seçerken gömlek ve takım elbise rengiyle uyumlu olmasına dikkat edin. Saat, kemer ve ayakkabı seçiminde de kaliteyi ön planda tutun.</p>
      
      <h3>4. Casual Friday Stili</h3>
      <p>Casual Friday günlerinde chino pantolon, polo yaka gömlek ve blazer ceket kombinasyonu ideal seçenektir.</p>
      
      <h2>Renk Kombinasyonları</h2>
      <p>Profesyonel görünüm için renk kombinasyonları:</p>
      <ul>
        <li>Lacivert takım + beyaz gömlek + kırmızı kravat</li>
        <li>Gri takım + mavi gömlek + gri kravat</li>
        <li>Siyah takım + beyaz gömlek + siyah kravat</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["erkek giyim", "profesyonel", "iş kıyafeti", "takım elbise", "stil rehberi"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    category: "Erkek Giyimi",
    isPublished: true
  },
  {
    title: "Çocuk Giyiminde Konfor ve Güvenlik: Ebeveynler İçin Rehber",
    excerpt: "Çocuk giyiminde konfor ve güvenlik nasıl bir arada olur? Çocuklarınız için doğru kıyafet seçimi ve bakım önerileri.",
    content: `
      <h2>Çocuk Giyiminde Konfor ve Güvenlik</h2>
      <p>Çocuk giyiminde en önemli faktörler konfor ve güvenliktir. İşte çocuklarınız için doğru kıyafet seçimi rehberi:</p>
      
      <h3>1. Kumaş Seçimi</h3>
      <p>Çocuk kıyafetlerinde %100 pamuk, organik pamuk veya bambu kumaşları tercih edin. Bu kumaşlar nefes alabilir ve cildi tahriş etmez.</p>
      
      <h3>2. Boyut Seçimi</h3>
      <p>Çocuklar hızlı büyür, bu yüzden kıyafet seçerken bir boy büyük almayı düşünebilirsiniz. Ancak çok büyük kıyafetler hareketi kısıtlayabilir.</p>
      
      <h3>3. Güvenlik Detayları</h3>
      <p>Küçük çocuklar için düğme yerine çıtçıt tercih edin. Kordon ve ip gibi detaylardan kaçının.</p>
      
      <h3>4. Mevsimsel Uygunluk</h3>
      <p>Yaz aylarında açık renkli, nefes alabilir kumaşlar tercih edin. Kış aylarında ise katmanlı giyim önemlidir.</p>
      
      <h2>Yaş Gruplarına Göre Öneriler</h2>
      <h3>0-2 Yaş</h3>
      <ul>
        <li>Yumuşak kumaşlar</li>
        <li>Kolay giyip çıkarılabilir parçalar</li>
        <li>Çıtçıtlı veya fermuarlı tasarımlar</li>
      </ul>
      
      <h3>3-6 Yaş</h3>
      <ul>
        <li>Dayanıklı kumaşlar</li>
        <li>Hareket kolaylığı sağlayan kesimler</li>
        <li>Çocukların sevdiği renkler ve desenler</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["çocuk giyimi", "konfor", "güvenlik", "kumaş seçimi", "ebeveyn rehberi"],
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop",
    category: "Çocuk Giyimi",
    isPublished: true
  },
  {
    title: "Aksesuar Seçiminde Altın Kurallar: Tamamlayıcı Parçalar",
    excerpt: "Aksesuar seçiminde dikkat edilmesi gerekenler. Çanta, takı ve ayakkabı seçiminde stil rehberi ile mükemmel kombinler yaratın.",
    content: `
      <h2>Aksesuar Seçiminde Altın Kurallar</h2>
      <p>Aksesuarlar, bir kombinasyonu tamamlayan en önemli parçalardır. İşte doğru aksesuar seçimi için rehber:</p>
      
      <h3>1. Çanta Seçimi</h3>
      <p>Çanta seçerken kullanım amacını belirleyin. Günlük kullanım için büyük, özel günler için küçük çantalar tercih edin.</p>
      
      <h3>2. Takı Kombinasyonu</h3>
      <p>Takı seçerken "az çoktur" kuralını unutmayın. Bir kombinasyonda maksimum 3 farklı takı kullanın.</p>
      
      <h3>3. Ayakkabı Seçimi</h3>
      <p>Ayakkabı seçerken hem konfor hem de stil dengesini kurun. Günlük kullanım için düz topuklu, özel günler için yüksek topuklu tercih edin.</p>
      
      <h3>4. Renk Uyumu</h3>
      <p>Aksesuarlarınızın ana kıyafet rengiyle uyumlu olmasına dikkat edin. Nötr renkler her zaman güvenilir seçeneklerdir.</p>
      
      <h2>Mevsimsel Aksesuar Önerileri</h2>
      <h3>Yaz</h3>
      <ul>
        <li>Bambu çantalar</li>
        <li>Renkli takılar</li>
        <li>Sandaletler</li>
      </ul>
      
      <h3>Kış</h3>
      <ul>
        <li>Deri çantalar</li>
        <li>Altın takılar</li>
        <li>Botlar</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["aksesuar", "çanta", "takı", "ayakkabı", "stil rehberi"],
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop",
    category: "Aksesuar",
    isPublished: true
  },
  {
    title: "Sürdürülebilir Moda: Çevre Dostu Tekstil Ürünleri",
    excerpt: "Sürdürülebilir moda nedir? Çevre dostu tekstil ürünleri ve etik alışveriş rehberi ile doğaya saygılı moda seçimleri yapın.",
    content: `
      <h2>Sürdürülebilir Moda Nedir?</h2>
      <p>Sürdürülebilir moda, çevreye ve insanlara zarar vermeden üretilen, kullanılan ve atılan moda ürünlerini ifade eder.</p>
      
      <h3>1. Organik Kumaşlar</h3>
      <p>Organik pamuk, bambu, kenevir gibi doğal kumaşlar tercih edin. Bu kumaşlar hem çevre dostu hem de sağlıklıdır.</p>
      
      <h3>2. Geri Dönüştürülmüş Malzemeler</h3>
      <p>Geri dönüştürülmüş polyester, plastik şişelerden üretilen kumaşlar gibi malzemeler tercih edin.</p>
      
      <h3>3. Yerel Üretim</h3>
      <p>Yerel üretim yapan markaları tercih edin. Bu hem karbon ayak izini azaltır hem de yerel ekonomiyi destekler.</p>
      
      <h3>4. Kaliteli Ürünler</h3>
      <p>Kaliteli ve dayanıklı ürünler alın. Bu, sık sık alışveriş yapmanızı engeller ve atık miktarını azaltır.</p>
      
      <h2>Etik Alışveriş İpuçları</h2>
      <ul>
        <li>Markaların üretim süreçlerini araştırın</li>
        <li>Sertifikalı organik ürünleri tercih edin</li>
        <li>İkinci el alışveriş yapın</li>
        <li>Kıyafetlerinizi tamir edin</li>
        <li>Kullanmadığınız kıyafetleri bağışlayın</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["sürdürülebilir moda", "çevre dostu", "organik kumaş", "etik alışveriş", "geri dönüşüm"],
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    category: "Sürdürülebilir Moda",
    isPublished: true
  },
  {
    title: "Kumaş Türleri ve Özellikleri: Doğru Seçim Rehberi",
    excerpt: "Farklı kumaş türlerinin özellikleri ve kullanım alanları. Pamuk, ipek, yün, polyester gibi kumaşların avantajları ve dezavantajları.",
    content: `
      <h2>Kumaş Türleri ve Özellikleri</h2>
      <p>Doğru kumaş seçimi, konfor ve dayanıklılık açısından çok önemlidir. İşte en yaygın kumaş türleri ve özellikleri:</p>
      
      <h3>1. Pamuk</h3>
      <p><strong>Özellikler:</strong> Nefes alabilir, yumuşak, emici<br>
      <strong>Kullanım:</strong> Günlük giyim, iç çamaşırı<br>
      <strong>Avantajlar:</strong> Doğal, hipoalerjenik<br>
      <strong>Dezavantajlar:</strong> Çabuk buruşur, çeker</p>
      
      <h3>2. İpek</h3>
      <p><strong>Özellikler:</strong> Parlak, yumuşak, hafif<br>
      <strong>Kullanım:</strong> Özel günler, bluz, gömlek<br>
      <strong>Avantajlar:</strong> Lüks görünüm, doğal<br>
      <strong>Dezavantajlar:</strong> Pahalı, bakımı zor</p>
      
      <h3>3. Yün</h3>
      <p><strong>Özellikler:</strong> Isıtıcı, dayanıklı, nem emici<br>
      <strong>Kullanım:</strong> Kış giyimi, kazak, mont<br>
      <strong>Avantajlar:</strong> Doğal, ısıtıcı<br>
      <strong>Dezavantajlar:</strong> Kaşıntı yapabilir, özel bakım gerektirir</p>
      
      <h3>4. Polyester</h3>
      <p><strong>Özellikler:</strong> Dayanıklı, çabuk kurur, buruşmaz<br>
      <strong>Kullanım:</strong> Spor giyimi, dış giyim<br>
      <strong>Avantajlar:</strong> Ucuz, kolay bakım<br>
      <strong>Dezavantajlar:</strong> Nefes almaz, çevre dostu değil</p>
      
      <h2>Kumaş Seçim İpuçları</h2>
      <ul>
        <li>Kullanım amacına göre seçim yapın</li>
        <li>Mevsimsel uygunluğu göz önünde bulundurun</li>
        <li>Bakım gereksinimlerini değerlendirin</li>
        <li>Bütçenize uygun seçenekleri tercih edin</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["kumaş türleri", "pamuk", "ipek", "yün", "polyester", "kumaş özellikleri"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    category: "Kumaş Rehberi",
    isPublished: true
  },
  {
    title: "Ev Tekstili Seçiminde Dikkat Edilmesi Gerekenler",
    excerpt: "Ev tekstili ürünlerinde kalite ve konfor nasıl sağlanır? Yatak takımları, havlu, perde seçiminde uzman önerileri.",
    content: `
      <h2>Ev Tekstili Seçiminde Kalite ve Konfor</h2>
      <p>Ev tekstili ürünleri, yaşam alanlarımızın konforunu ve estetiğini doğrudan etkiler. İşte doğru seçim rehberi:</p>
      
      <h3>1. Yatak Takımları</h3>
      <p><strong>Kumaş Seçimi:</strong> %100 pamuk veya pamuk karışımlı kumaşlar tercih edin.<br>
      <strong>İplik Sayısı:</strong> 200-400 iplik arası ideal seçenektir.<br>
      <strong>Renk Seçimi:</strong> Yatak odası dekorasyonuyla uyumlu renkler seçin.</p>
      
      <h3>2. Havlular</h3>
      <p><strong>Kumaş:</strong> %100 pamuk havlu tercih edin.<br>
      <strong>Gramaj:</strong> 400-600 gr/m² arası ideal.<br>
      <strong>Boyut:</strong> Kullanım amacına göre boyut seçin.</p>
      
      <h3>3. Perdeler</h3>
      <p><strong>Kumaş:</strong> Güneş ışığını filtreleyen kumaşlar.<br>
      <strong>Renk:</strong> Oda rengiyle uyumlu seçimler.<br>
      <strong>Fonksiyon:</strong> Karartma, ses yalıtımı gibi özellikler.</p>
      
      <h3>4. Masa Örtüleri</h3>
      <p><strong>Kumaş:</strong> Kolay temizlenebilir kumaşlar.<br>
      <strong>Boyut:</strong> Masa boyutuna uygun seçim.<br>
      <strong>Desen:</strong> Dekorasyonla uyumlu desenler.</p>
      
      <h2>Bakım Önerileri</h2>
      <ul>
        <li>Ürün etiketlerindeki bakım talimatlarını okuyun</li>
        <li>Uygun sıcaklıkta yıkayın</li>
        <li>Çamaşır suyu kullanmaktan kaçının</li>
        <li>Düzenli olarak değiştirin</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["ev tekstili", "yatak takımı", "havlu", "perde", "ev dekorasyonu"],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    category: "Ev Tekstili",
    isPublished: true
  },
  {
    title: "Spor Giyiminde Teknoloji ve Konfor: Performans Odaklı Seçimler",
    excerpt: "Spor giyiminde teknoloji ve konfor nasıl bir arada olur? Nefes alabilir kumaşlar, nem emici teknolojiler ve performans odaklı seçimler.",
    content: `
      <h2>Spor Giyiminde Teknoloji ve Konfor</h2>
      <p>Modern spor giyimi, teknoloji ve konforu bir araya getiriyor. İşte performans odaklı seçimler için rehber:</p>
      
      <h3>1. Nefes Alabilir Kumaşlar</h3>
      <p><strong>Teknoloji:</strong> Gore-Tex, Dri-FIT, Climacool gibi teknolojiler.<br>
      <strong>Avantajlar:</strong> Ter emme, hızlı kuruma, nefes alabilirlik.<br>
      <strong>Kullanım:</strong> Koşu, fitness, outdoor sporlar.</p>
      
      <h3>2. Kompresyon Giyim</h3>
      <p><strong>Faydalar:</strong> Kas desteği, kan dolaşımını artırma.<br>
      <strong>Kullanım:</strong> Yoğun antrenmanlar, yarışlar.<br>
      <strong>Seçim:</strong> Vücut ölçülerinize uygun boyut.</p>
      
      <h3>3. UV Korumalı Kumaşlar</h3>
      <p><strong>Özellik:</strong> Güneş ışınlarından koruma.<br>
      <strong>Kullanım:</strong> Outdoor sporlar, yaz aktiviteleri.<br>
      <strong>Faktör:</strong> UPF 30+ koruma faktörü.</p>
      
      <h3>4. Çok Katmanlı Sistem</h3>
      <p><strong>Katman 1:</strong> Nem emici iç katman.<br>
      <strong>Katman 2:</strong> Isı yalıtımı sağlayan orta katman.<br>
      <strong>Katman 3:</strong> Dış etkenlerden koruyan dış katman.</p>
      
      <h2>Spor Türüne Göre Seçim</h2>
      <h3>Koşu</h3>
      <ul>
        <li>Hafif ve nefes alabilir kumaşlar</li>
        <li>Reflektörlü detaylar</li>
        <li>Çok cepli tasarımlar</li>
      </ul>
      
      <h3>Fitness</h3>
      <ul>
        <li>Esnek ve hareket kolaylığı sağlayan kumaşlar</li>
        <li>Nem emici teknolojiler</li>
        <li>Vücut sıcaklığını dengeleyen özellikler</li>
      </ul>
    `,
    author: "ModaBase Editör",
    tags: ["spor giyimi", "nefes alabilir kumaş", "kompresyon", "UV koruma", "performans"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    category: "Spor Giyimi",
    isPublished: true
  }
]

async function createTextileBlogPosts() {
  try {
    console.log('Tekstil ürünleri için SEO blog yazıları oluşturuluyor...')
    
    for (const post of textileBlogPosts) {
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
      
      // Mevcut blog yazısını kontrol et
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug }
      })
      
      if (existingPost) {
        console.log(`⏭️ "${post.title}" zaten mevcut, atlanıyor`)
        continue
      }
      
      const wordCount = post.content.split(/\s+/).length
      const readTime = Math.ceil(wordCount / 200)
      
      await prisma.blogPost.create({
        data: {
          ...post,
          slug,
          readTime,
          publishedAt: new Date(),
          viewCount: Math.floor(Math.random() * 100) + 10
        }
      })
      
      console.log(`✅ "${post.title}" oluşturuldu`)
    }
    
    console.log('🎉 Tüm tekstil SEO blog yazıları başarıyla oluşturuldu!')
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTextileBlogPosts() 