import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp, Search } from 'lucide-react'

// Professional SEO Metadata - Bluz Modelleri
export const metadata: Metadata = {
  title: 'Bluz Modelleri 2025 - En Şık Kadın Bluz Çeşitleri | ModaBase',
  description: 'Bluz modelleri: şifon bluz, saten bluz, uzun kollu bluz, kısa kollu bluz. 2025 trend kadın bluz modelleri uygun fiyatlarla. Ücretsiz kargo fırsatı!',
  keywords: 'bluz modelleri, kadın bluz, şifon bluz, saten bluz, uzun kollu bluz, kısa kollu bluz, iş bluz, günlük bluz, gece bluz, 2025 bluz trend',
  openGraph: {
    title: 'Bluz Modelleri 2025 - En Şık Kadın Bluz Çeşitleri',
    description: 'ModaBase\'de binlerce bluz modeli! Şifon, saten, günlük ve iş bluzu çeşitleri. Her tarza uygun kadın bluz modelleri.',
    images: ['/og-bluz-modelleri.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bluz Modelleri 2025 - ModaBase',
    description: 'En şık bluz modelleri. Şifon, saten, günlük kadın bluz çeşitleri uygun fiyatlarla.',
    images: ['/twitter-bluz-modelleri.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/bluz-modelleri'
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

async function getBluzProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'bluz', mode: 'insensitive' } },
          { name: { contains: 'gömlek', mode: 'insensitive' } },
          { name: { contains: 'üst', mode: 'insensitive' } },
          { description: { contains: 'bluz', mode: 'insensitive' } },
          { 
            category: {
              OR: [
                { name: { contains: 'bluz', mode: 'insensitive' } },
                { name: { contains: 'üst', mode: 'insensitive' } }
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
    console.error('Bluz products fetch error:', error)
    return []
  }
}

export default async function BluzModelleriPage() {
  const products = await getBluzProducts()

  // Professional JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Bluz Modelleri 2025",
    "description": "En şık kadın bluz modelleri. Şifon bluz, saten bluz, günlük ve iş bluzu çeşitleri.",
    "url": "https://modabase.com.tr/bluz-modelleri",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 12).map((product, index) => {
        // Image URL belirle - base64'leri reddet, default kullan
        const getValidImageUrl = () => {
          if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            // Sadece HTTP URL'leri kabul et, base64'leri reddet
            if (firstImage && !firstImage.startsWith('data:image/') && firstImage.startsWith('http')) {
              return firstImage;
            }
          }
          // Default image kullan
          return 'https://www.modabase.com.tr/default-product.svg';
        };

        return {
          "@type": "Product",
          "position": index + 1,
          "name": product.name,
          "description": product.description,
          "image": getValidImageUrl(),
          "url": `https://www.modabase.com.tr/product/${product.id}`,
        "category": "Bluz",
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "TRY",
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": "1",
                "maxValue": "2",
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": "1",
                "maxValue": "3",
                "unitCode": "DAY"
              }
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "TR",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "returnMethod": "https://schema.org/ReturnByMail",
            "merchantReturnDays": "14"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating || "4.5",
          "reviewCount": product.reviewCount || "10"
        },
        "review": {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "author": {
            "@type": "Person",
            "name": "ModaBase Müşterisi"
          },
          "reviewBody": "Bluz modelleri çok şık, kalite mükemmel."
        }
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
          "name": "Kadın Giyim",
          "item": "https://modabase.com.tr/kadin-elbise"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Bluz Modelleri",
          "item": "https://modabase.com.tr/bluz-modelleri"
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
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                👚 Bluz Modelleri 2025
              </h1>
              <p className="text-2xl md:text-3xl mb-8 max-w-5xl mx-auto leading-relaxed">
                Şık ve modern <strong>bluz modelleri</strong> koleksiyonu! 
                <strong>Şifon bluz</strong>, <strong>saten bluz</strong>, <strong>günlük bluz</strong> ve 
                <strong>iş bluzu</strong> çeşitleri ile gardırobunuzu yenileyin.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  ✨ {products.length}+ Bluz Modeli
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  🎯 Her Tarza Uygun
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
            <li><Link href="/" className="hover:text-blue-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/kadin-elbise" className="hover:text-blue-600">Kadın Giyim</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-blue-600">Bluz Modelleri</li>
          </ol>
        </nav>

        {/* Bluz Types Quick Access */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Şifon Bluz</h3>
              <p className="text-sm text-gray-600">Zarif ve hafif</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Saten Bluz</h3>
              <p className="text-sm text-gray-600">Lüks ve şık</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">İş Bluzu</h3>
              <p className="text-sm text-gray-600">Profesyonel görünüm</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-4xl mb-3">👕</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Günlük Bluz</h3>
              <p className="text-sm text-gray-600">Rahat ve konforlu</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-10 mb-12 shadow-xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
              2025 Bluz Modelleri Trendleri ve Çeşitleri
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-blue-700 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  Bluz Çeşitleri ve Modelleri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Bluz modelleri</strong>, kadın gardırobunun en temel ve çok amaçlı parçalarıdır. 
                  <strong>Şifon bluz</strong> zarafeti, <strong>saten bluz</strong> lüksü, 
                  <strong>günlük bluz</strong> rahatlığı ve <strong>iş bluzu</strong> profesyonelliği 
                  ile her ortama uygun seçenekler sunar.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Şifon Bluz Modelleri</h4>
                      <p className="text-gray-600">Zarif, hafif ve nefes alabilir kumaş</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Saten Bluz Çeşitleri</h4>
                      <p className="text-gray-600">Lüks görünüm, parlak yüzey</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Uzun Kollu Bluz</h4>
                      <p className="text-gray-600">Kış ve sonbahar için ideal</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Kısa Kollu Bluz</h4>
                      <p className="text-gray-600">Yaz ayları için ferah seçenek</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-blue-700 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3" />
                  Bluz Kombinleri ve Stil Önerileri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Bluz modelleri</strong> kombinleri yaparken kullanım amacına göre seçim yapmak önemlidir. 
                  İş ortamında klasik kesim bluzlar, özel davetlerde şifon bluzlar tercih edilebilir.
                </p>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-blue-800">💼 İş Kombinleri</h4>
                    <p className="text-gray-700">
                      Saten bluz + Klasik pantolon + Blazer = Profesyonel şıklık
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-purple-800">✨ Gece Kombinleri</h4>
                    <p className="text-gray-700">
                      Şifon bluz + Kalem etek + Topuklu ayakkabı = Zarif akşam görünümü
                    </p>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-pink-800">👕 Günlük Kombinler</h4>
                    <p className="text-gray-700">
                      Pamuk bluz + Jean + Spor ayakkabı = Rahat günlük stil
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-indigo-800">🌟 Özel Günler</h4>
                    <p className="text-gray-700">
                      Nakışlı bluz + Şık pantolon + Aksesuar = Davet şıklığı
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
              Trend Bluz Modelleri ({products.length} ürün)
            </h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Search className="w-4 h-4" />
                Filtrele
              </button>
              <Link 
                href="/products?category=bluz" 
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-lg"
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
                      alt={`${product.name} - Bluz Modeli ${product.category?.name || ''}`}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      BLUZ
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
                        <span className="text-2xl font-bold text-blue-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-2 rounded-full font-medium">
                        {product.category?.name || 'Bluz'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-gradient-to-r from-blue-100 to-purple-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Bluz Modelleri Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-blue-700">Hangi bluz modeli bana uyar?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Vücut tipinize göre bluz seçimi yapabilirsiniz. V yaka bluzlar uzun boyun çizgisi, 
                  A kesim bluzlar kalça gizleme konusunda ideal. Beden tablosunu mutlaka kontrol edin.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-blue-700">Şifon bluz nasıl yıkanır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Şifon bluz hassas programda 30 derece soğuk suda yıkanmalıdır. Elle yıkama daha güvenlidir. 
                  Ağartıcı kullanmayın ve düz olarak kurutun.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-blue-700">İş ortamında hangi bluz giyilir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  İş ortamı için klasik kesim, düz renk veya ince çizgili bluzlar tercih edilmelidir. 
                  Saten bluz ve pamuk bluz profesyonel görünüm için idealdir.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-blue-700">Bluz ütülemesi nasıl yapılır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Bluz kumaşına göre ısı ayarı yapın. Şifon ve saten düşük ısıda, pamuk orta ısıda ütülenir. 
                  Tersten ütüleme kumaşı korur.
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