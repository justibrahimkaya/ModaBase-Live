import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp } from 'lucide-react'

// Ultra SEO Metadata - Triko Elbise için özel optimize edilmiş
export const metadata: Metadata = {
  title: 'Triko Elbise Modelleri 2024 - En Şık Triko Elbise Çeşitleri | ModaBase',
  description: 'Triko elbise modelleri: boğazlı triko elbise, midi triko elbise, uzun triko elbise. 2024 kış trendi kadın triko elbise çeşitleri uygun fiyatlarla. Ücretsiz kargo!',
  keywords: 'triko elbise, triko elbise modelleri, boğazlı triko elbise, midi triko elbise, uzun triko elbise, kışlık triko elbise, kadın triko elbise, 2024 triko elbise trend',
  openGraph: {
    title: 'Triko Elbise Modelleri 2024 - En Şık Triko Elbise Çeşitleri',
    description: 'ModaBase\'de en trend triko elbise modelleri! Boğazlı, midi, uzun triko elbise çeşitleri. Kış gardırobunuzun vazgeçilmezi triko elbise modelleri.',
    images: ['/og-triko-elbise.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Triko Elbise Modelleri 2024 - ModaBase',
    description: 'En şık triko elbise modelleri. Boğazlı, midi, uzun triko elbise çeşitleri uygun fiyatlarla.',
    images: ['/twitter-triko-elbise.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/triko-elbise'
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

async function getTrikoElbiseProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: 'triko', mode: 'insensitive' } },
              { description: { contains: 'triko', mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { name: { contains: 'elbise', mode: 'insensitive' } },
              { description: { contains: 'elbise', mode: 'insensitive' } }
            ]
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
    console.error('Triko elbise products fetch error:', error)
    return []
  }
}

export default async function TrikoElbisePage() {
  const products = await getTrikoElbiseProducts()

  // Detailed JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Triko Elbise Modelleri 2024",
    "description": "En şık triko elbise modelleri. Boğazlı triko elbise, midi triko elbise ve uzun triko elbise çeşitleri.",
    "url": "https://modabase.com.tr/triko-elbise",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 12).map((product, index) => {
        return {
          "@type": "Product",
          "position": index + 1,
          "name": product.name,
          "description": product.description,

          "url": `https://modabase.com.tr/product/${product.id}`,
          "category": "Triko Elbise",
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "ModaBase"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "TRY"
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "TR"
              }
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "TR",
              "returnPolicyCategory": "https://schema.org/Refundable"
            }
          },
          ...(product.rating || product.reviewCount ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating || 4.5,
              "reviewCount": product.reviewCount || 14
            }
          } : {})
        };
      })
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
          "name": "Triko",
          "item": "https://modabase.com.tr/triko"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Triko Elbise",
          "item": "https://modabase.com.tr/triko-elbise"
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
      
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                🧶 Triko Elbise Modelleri
              </h1>
              <p className="text-2xl md:text-3xl mb-8 max-w-5xl mx-auto leading-relaxed">
                Kış gardırobunuzun vazgeçilmezi <strong>triko elbise</strong> modelleri! 
                <strong>Boğazlı triko elbise</strong>, <strong>midi triko elbise</strong> ve 
                <strong>uzun triko elbise</strong> çeşitleri ile hem sıcak kalın hem de şık görünün.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  🔥 {products.length}+ Triko Elbise
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  ❄️ Kış Koleksiyonu
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
            <li><Link href="/" className="hover:text-purple-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/triko" className="hover:text-purple-600">Triko</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-purple-600">Triko Elbise</li>
          </ol>
        </nav>

        {/* Triko Elbise Types */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-5xl mb-4">👗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Boğazlı Triko Elbise</h3>
              <p className="text-gray-600 mb-4">Klasik ve şık boğazlı triko elbise modelleri. Kış aylarının vazgeçilmezi.</p>
              <Link href="/products?category=bogازli-triko" className="text-purple-600 font-semibold hover:text-purple-700">
                Koleksiyonu Gör →
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-5xl mb-4">👘</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Midi Triko Elbise</h3>
              <p className="text-gray-600 mb-4">Orta boy midi triko elbise modelleri. Her vücut tipine uygun kesimler.</p>
              <Link href="/products?category=midi-triko" className="text-purple-600 font-semibold hover:text-purple-700">
                Koleksiyonu Gör →
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-5xl mb-4">👗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Uzun Triko Elbise</h3>
              <p className="text-gray-600 mb-4">Maxi boy uzun triko elbise modelleri. Zarif ve gösterişli tasarımlar.</p>
              <Link href="/products?category=uzun-triko" className="text-purple-600 font-semibold hover:text-purple-700">
                Koleksiyonu Gör →
              </Link>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-10 mb-12 shadow-xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
              2024 Triko Elbise Trendleri ve Modelleri
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-purple-700 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  Triko Elbise Çeşitleri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Triko elbise</strong> modelleri, soğuk kış aylarının en trend ve konforlu parçalarıdır. 
                  <strong>Boğazlı triko elbise</strong> klasik şıklığı, <strong>midi triko elbise</strong> 
                  modern zarafeti, <strong>uzun triko elbise</strong> ise gösterişli duruşu ile gardırobunuzda 
                  yer alması gereken özel parçalardır.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Boğazlı Triko Elbise Modelleri</h4>
                      <p className="text-gray-600">Klasik kesim, sıcak tutan boğazlı yaka</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Midi Boy Triko Elbise</h4>
                      <p className="text-gray-600">Diz altı uzunluk, her vücut tipine uygun</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Uzun Triko Elbise Çeşitleri</h4>
                      <p className="text-gray-600">Maxi boy, zarif ve gösterişli tasarım</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Kolsuz Triko Elbise Modelleri</h4>
                      <p className="text-gray-600">Kombin yapılabilir, çok amaçlı kullanım</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-purple-700 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3" />
                  Triko Elbise Kombin Önerileri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Triko elbise</strong> kombinleri yaparken sezona uygun aksesuarlar seçmek önemlidir. 
                  Kış aylarında bot ve ceket ile, geçiş dönemlerinde hafif hırka ve spor ayakkabı ile 
                  kombinleyebilirsiniz.
                </p>
                <div className="space-y-6">
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-purple-800">🥾 Kış Kombinleri</h4>
                    <p className="text-gray-700">
                      Triko elbise + Bot + Kaban + Atkı = Mükemmel kış kombinı
                    </p>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-pink-800">👢 Şık Kombinler</h4>
                    <p className="text-gray-700">
                      Midi triko elbise + Diz üstü çizme + Ceket = Ofis şıklığı
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-indigo-800">👟 Casual Kombinler</h4>
                    <p className="text-gray-700">
                      Boğazlı triko elbise + Sneaker + Denim ceket = Günlük şıklık
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
              Popüler Triko Elbise Modelleri ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=triko-elbise" 
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 text-lg"
            >
              Tümünü Görüntüle <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <Link href={`/product/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Triko Elbise ${product.category?.name || ''}`}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      TRİKO ELBİSE
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
                        <span className="text-2xl font-bold text-purple-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-3 py-2 rounded-full font-medium">
                        {product.category?.name || 'Triko Elbise'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-gradient-to-r from-purple-100 to-pink-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Triko Elbise Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-purple-700">Triko elbise nasıl yıkanır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Triko elbise 30 derece soğuk suda, özel triko deterjanı ile yıkanmalıdır. 
                  Çamaşır makinesinde hassas programda yıkayın ve düz olarak serin yerde kurutun. 
                  Ağartıcı kullanmaktan kaçının.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-purple-700">Hangi beden triko elbise almalıyım?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Triko elbise genellikle vücuda oturan kesimde tasarlanır. Normal beden ölçünüzü 
                  tercih edebilirsiniz. Oversize görünüm istiyorsanız bir beden büyük alabilirsiniz. 
                  Ürün sayfasındaki beden tablosunu mutlaka kontrol edin.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-purple-700">Triko elbise hangi mevsimde giyilir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Triko elbise öncelikle sonbahar ve kış aylarında giyilir. İnce triko elbise 
                  modelleri ilkbahar geçiş döneminde de tercih edilebilir. Kalın triko elbiseler 
                  soğuk kış günleri için idealdir.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-purple-700">Triko elbise çeker mi?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Kaliteli triko elbise modelleri doğru bakım ile çekmez. İlk yıkamada minimal 
                  çekme olabilir bu normaldir. Sonrasında stabil kalır. Düşük kalite triko 
                  elbiseler daha fazla çekebilir, bu yüzden kaliteli marka tercih edin.
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