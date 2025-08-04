import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp, Filter } from 'lucide-react'

// Professional SEO Metadata - Kadın Pantolon
export const metadata: Metadata = {
  title: 'Kadın Pantolon Modelleri 2024 - En Şık Pantolon Çeşitleri | ModaBase',
  description: 'Kadın pantolon modelleri: kumaş pantolon, jean pantolon, kalem pantolon, bol pantolon. 2024 trend kadın pantolon çeşitleri uygun fiyatlarla. Ücretsiz kargo!',
  keywords: 'kadın pantolon, pantolon modelleri, kumaş pantolon, jean pantolon, kalem pantolon, bol pantolon, iş pantolonu, günlük pantolon, yüksek bel pantolon, 2024 pantolon trend',
  openGraph: {
    title: 'Kadın Pantolon Modelleri 2024 - En Şık Pantolon Çeşitleri',
    description: 'ModaBase\'de binlerce kadın pantolon modeli! Kumaş, jean, kalem ve bol pantolon çeşitleri. Her vücut tipine uygun pantolon modelleri.',
    images: ['/og-kadin-pantolon.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kadın Pantolon Modelleri 2024 - ModaBase',
    description: 'En şık kadın pantolon modelleri. Kumaş, jean, kalem pantolon çeşitleri uygun fiyatlarla.',
    images: ['/twitter-kadin-pantolon.jpg']
  },
  alternates: {
    canonical: 'https://modabase.com.tr/kadin-pantolon'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

async function getKadinPantolonProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'pantolon', mode: 'insensitive' } },
          { name: { contains: 'jean', mode: 'insensitive' } },
          { name: { contains: 'eşofman', mode: 'insensitive' } },
          { name: { contains: 'tayt', mode: 'insensitive' } },
          { description: { contains: 'pantolon', mode: 'insensitive' } },
          { 
            category: {
              OR: [
                { name: { contains: 'pantolon', mode: 'insensitive' } },
                { name: { contains: 'alt', mode: 'insensitive' } }
              ]
            }
          }
        ]
      },
      include: {
        category: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 24
    })

    return products.map(product => {
      const images = JSON.parse(product.images || '[]')
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0
      
      return {
        ...product,
        imageUrl: images[0] || '/placeholder.jpg',
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: product._count.reviews
      }
    })
  } catch (error) {
    console.error('Kadın pantolon products fetch error:', error)
    return []
  }
}

export default async function KadinPantolonPage() {
  const products = await getKadinPantolonProducts()

  // Professional JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Kadın Pantolon Modelleri 2024",
    "description": "En şık kadın pantolon modelleri. Kumaş pantolon, jean pantolon, kalem pantolon çeşitleri.",
    "url": "https://modabase.com.tr/kadin-pantolon",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 12).map((product, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": product.name,
        "description": product.description,
        "image": product.imageUrl,
        "url": `https://modabase.com.tr/product/${product.id}`,
        "category": "Kadın Pantolon",
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "ModaBase"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating || 4.4,
          "reviewCount": product.reviewCount || 12
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana Sayfa",
          "item": "https://modabase.com.tr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Kadın Giyim",
          "item": "https://modabase.com.tr/kadin-elbise"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Kadın Pantolon",
          "item": "https://modabase.com.tr/kadin-pantolon"
        }
      ]
    }
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                👖 Kadın Pantolon Modelleri
              </h1>
              <p className="text-2xl md:text-3xl mb-8 max-w-5xl mx-auto leading-relaxed">
                Her tarza uygun <strong>kadın pantolon</strong> modelleri! 
                <strong>Kumaş pantolon</strong>, <strong>jean pantolon</strong>, <strong>kalem pantolon</strong> ve 
                <strong>bol pantolon</strong> çeşitleri ile stilinizi tamamlayın.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  🎯 {products.length}+ Pantolon Modeli
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  📏 Her Bedene Uygun
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  🚚 Ücretsiz Kargo
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-indigo-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/kadin-elbise" className="hover:text-indigo-600">Kadın Giyim</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-indigo-600">Kadın Pantolon</li>
          </ol>
        </nav>

        {/* Pantolon Types Quick Access */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Kumaş Pantolon</h3>
              <p className="text-sm text-gray-600">Şık ve klasik</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">👖</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Jean Pantolon</h3>
              <p className="text-sm text-gray-600">Rahat ve günlük</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">✏️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Kalem Pantolon</h3>
              <p className="text-sm text-gray-600">İş ve ofis</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">🌊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bol Pantolon</h3>
              <p className="text-sm text-gray-600">Trend ve konforlu</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-10 mb-12 shadow-xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
              2024 Kadın Pantolon Trendleri ve Çeşitleri
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-indigo-700 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  Pantolon Modelleri ve Kesimler
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Kadın pantolon</strong> modelleri, modern kadının vazgeçilmez gardırop parçalarıdır. 
                  <strong>Kumaş pantolon</strong> zarafeti, <strong>jean pantolon</strong> rahatlığı, 
                  <strong>kalem pantolon</strong> profesyonelliği ve <strong>bol pantolon</strong> trendi 
                  ile her ortama uygun seçenekler sunar.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Kumaş Pantolon Modelleri</h4>
                      <p className="text-gray-600">Klasik, şık ve işe uygun kesimler</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Jean Pantolon Çeşitleri</h4>
                      <p className="text-gray-600">Skinny, boyfriend, mom jean modelleri</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Kalem Pantolon</h4>
                      <p className="text-gray-600">Dar kesim, profesyonel görünüm</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Bol Pantolon Trendleri</h4>
                      <p className="text-gray-600">Wide leg, palazzo, culotte modelleri</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-indigo-700 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3" />
                  Vücut Tipine Göre Pantolon Seçimi
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Kadın pantolon</strong> seçimi yaparken vücut tipinizi göz önünde bulundurmak önemlidir. 
                  Doğru kesim ve model seçimi ile vücut oranlarınızı mükemmel gösterebilirsiniz.
                </p>
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-indigo-800">🍐 Armut Vücut Tipi</h4>
                    <p className="text-gray-700">
                      Yüksek bel jean + Bol kesim üst = Orantılı görünüm
                    </p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-blue-800">🍎 Elma Vücut Tipi</h4>
                    <p className="text-gray-700">
                      Kalem pantolon + Uzun bluz = Bel vurgusu
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-purple-800">⌛ Kum Saati Vücut Tipi</h4>
                    <p className="text-gray-700">
                      Yüksek bel kumaş pantolon + Fitilli bluz = Zarif uyum
                    </p>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-pink-800">📏 Dikdörtgen Vücut Tipi</h4>
                    <p className="text-gray-700">
                      Bol pantolon + Kemerli bluz = Hacim ve form
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold text-gray-900">
              Trend Kadın Pantolon Modelleri ({products.length} ürün)
            </h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filtrele
              </button>
              <Link 
                href="/products?category=pantolon" 
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 text-lg"
              >
                Tümünü Görüntüle <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <Link href={`/product/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Kadın Pantolon ${product.category?.name || ''}`}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PANTOLON
                    </div>
                    <button className="absolute bottom-4 right-4 p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg">
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      {product.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1 font-medium">
                            {product.rating} ({product.reviewCount} değerlendirme)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-indigo-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-2 rounded-full font-medium">
                        {product.category?.name || 'Pantolon'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Size Guide Section */}
        <section className="bg-gradient-to-r from-indigo-100 to-blue-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Kadın Pantolon Beden Rehberi
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">📏</div>
                <h3 className="text-xl font-bold mb-3">Bel Ölçüsü</h3>
                <p className="text-gray-700">En dar bel kısmınızdan ölçüm alın. Kasınızı çekmeyin, doğal duruşunuzda ölçün.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">📐</div>
                <h3 className="text-xl font-bold mb-3">Kalça Ölçüsü</h3>
                <p className="text-gray-700">En geniş kalça noktasından, kalçalarınızın etrafından ölçüm alın.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-3">Boy Ölçüsü</h3>
                <p className="text-gray-700">Bacak içi uzunluğunu, kasık noktasından ayak bileğine kadar ölçün.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Kadın Pantolon Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Hangi pantolon modeli vücut tipime uyar?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Vücut tipinize göre pantolon seçimi yapmalısınız. Armut tip için yüksek bel jean, 
                  elma tip için kalem pantolon, kum saati tip için her model uygun. Beden rehberimizi kontrol edin.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Jean pantolon nasıl yıkanır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Jean pantolon 30 derece soğuk suda, tersine çevirip yıkanmalıdır. Ağartıcı kullanmayın, 
                  renk koruyucu kullanın. Güneşte kurutmaktan kaçının.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Kumaş pantolon nasıl ütülenir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Kumaş pantolon orta ısıda, nemli bezle ütülenir. Ütü yaprağı kullanabilirsiniz. 
                  Parlak kumaşlar için düşük ısı tercih edin.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Yüksek bel pantolon kime uyar?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yüksek bel pantolon kısa boylu kadınları uzun gösterir, bel oranını vurgular. 
                  Geniş kalçalı kadınlarda orantıyı dengeler. Çoğu vücut tipine uygun modeldir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
} 