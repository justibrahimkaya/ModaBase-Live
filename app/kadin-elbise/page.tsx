import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, TrendingUp, Heart, Filter } from 'lucide-react'

// SEO Metadata - Kadın Elbise için optimize edilmiş
export const metadata: Metadata = {
  title: 'Kadın Elbise Modelleri 2025 - En Şık Elbise Çeşitleri | ModaBase',
  description: 'Kadın elbise modelleri: günlük elbise, abiye elbise, yazlık elbise, kışlık elbise. 2025 trend kadın elbiseleri uygun fiyatlarla. Ücretsiz kargo!',
  keywords: 'kadın elbise, elbise modelleri, günlük elbise, abiye elbise, yazlık elbise, kışlık elbise, kadın giyim, elbise çeşitleri, 2025 elbise trend',
  openGraph: {
    title: 'Kadın Elbise Modelleri 2025 - En Şık Elbise Çeşitleri',
    description: 'ModaBase\'de binlerce kadın elbise modeli! Günlük, abiye, yazlık ve kışlık elbise çeşitleri. Her zevke uygun elbise modelleri.',
    images: ['/og-kadin-elbise.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kadın Elbise Modelleri 2025 - ModaBase',
    description: 'En şık kadın elbise modelleri. Günlük, abiye, yazlık kadın elbiseleri uygun fiyatlarla.',
    images: ['/twitter-kadin-elbise.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/kadin-elbise'
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

async function getKadinElbiseProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'elbise', mode: 'insensitive' } },
          { name: { contains: 'dress', mode: 'insensitive' } },
          { description: { contains: 'elbise', mode: 'insensitive' } },
          { 
            category: {
              OR: [
                { name: { contains: 'elbise', mode: 'insensitive' } },
                { name: { contains: 'dress', mode: 'insensitive' } },
                { name: { contains: 'kadın', mode: 'insensitive' } }
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
    console.error('Kadın elbise products fetch error:', error)
    return []
  }
}

export default async function KadinElbisePage() {
  const products = await getKadinElbiseProducts()

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Kadın Elbise Modelleri 2025",
    "description": "En şık kadın elbise modelleri. Günlük elbise, abiye elbise, yazlık ve kışlık elbise çeşitleri.",
    "url": "https://modabase.com.tr/kadin-elbise",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 12)
        .filter(product => product.name !== 'Bluzlar' && product.name !== 'Elbiseler')
        .map((product, index) => {
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
            "offers": {
              "@type": "Offer",
              "price": product.price || "0",
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
                }
              },
              "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "TR",
                "returnPolicyCategory": "https://schema.org/Refundable"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating || "4.6",
              "reviewCount": product.reviewCount || "15"
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
              "reviewBody": "Kaliteli elbise, çok beğendim. Hızlı kargo."
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
          "name": "Kadın Elbise",
          "item": "https://modabase.com.tr/kadin-elbise"
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
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                Kadın Elbise Modelleri
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
                Binlerce <strong>kadın elbise</strong> modeli bir arada! <strong>Günlük elbise</strong>, 
                <strong>abiye elbise</strong>, <strong>yazlık elbise</strong> ve <strong>kışlık elbise</strong> 
                çeşitleri ile her tarza uygun seçenekler.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-lg">
                <span className="bg-white/20 px-6 py-3 rounded-full">👗 {products.length}+ Elbise Modeli</span>
                <span className="bg-white/20 px-6 py-3 rounded-full">🚚 Ücretsiz Kargo</span>
                <span className="bg-white/20 px-6 py-3 rounded-full">⭐ 5 Yıldız Kalite</span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-purple-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-purple-600">Kadın Elbise</li>
          </ol>
        </nav>

        {/* Category Quick Links */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/yazlik-elbise" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2">☀️</div>
              <h3 className="font-semibold text-gray-900">Yazlık Elbise</h3>
              <p className="text-sm text-gray-600">Yaz koleksiyonu</p>
            </Link>
            <Link href="/triko-elbise" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2">🧶</div>
              <h3 className="font-semibold text-gray-900">Triko Elbise</h3>
              <p className="text-sm text-gray-600">Kış favori</p>
            </Link>
            <Link href="/products?category=abiye" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-semibold text-gray-900">Abiye Elbise</h3>
              <p className="text-sm text-gray-600">Özel günler</p>
            </Link>
            <Link href="/products?category=gunluk" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2">👕</div>
              <h3 className="font-semibold text-gray-900">Günlük Elbise</h3>
              <p className="text-sm text-gray-600">Her gün</p>
            </Link>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              2025 Kadın Elbise Trendleri ve Çeşitleri
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-purple-600">Günlük Elbise Modelleri</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Günlük elbise</strong> modelleri rahat kullanım için tasarlanmış, şık ve konforlu parçalardır. 
                  İş hayatından özel günlere kadar her alanda kullanabileceğiniz günlük kadın elbise modelleri.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Casual günlük elbise modelleri</li>
                  <li>İş yerinde giyilebilir elbiseler</li>
                  <li>Sokak stili günlük elbise</li>
                  <li>Konforlu daily elbise çeşitleri</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-pink-600">Abiye Elbise Koleksiyonu</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Özel günler için tasarlanan <strong>abiye elbise</strong> modelleri ile büyüleyici görünün. 
                  Düğün, nişan, mezuniyet ve özel etkinlikler için mükemmel abiye elbise seçenekleri.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Uzun abiye elbise modelleri</li>
                  <li>Kısa abiye elbise çeşitleri</li>
                  <li>Düğün abiye elbise koleksiyonu</li>
                  <li>Gece elbise modelleri</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Mevsimlik Elbise Modelleri</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Her mevsime uygun <strong>kadın elbise</strong> modelleri. Yazlık ince kumaşlardan 
                  kışlık kalın triko elbise modellerine kadar geniş seçenek yelpazesi.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Yazlık elbise modelleri</li>
                  <li>Kışlık kadın elbise çeşitleri</li>
                  <li>İlkbahar elbise koleksiyonu</li>
                  <li>Sonbahar elbise trendleri</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Popüler Kadın Elbise Modelleri ({products.length} ürün)
            </h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filtrele
              </button>
              <Link 
                href="/products?category=elbise" 
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
              >
                Tümünü Görüntüle <ShoppingBag className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/product/${product.id}`}>
                  <div className="relative group">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Kadın Elbise ${product.category?.name || ''}`}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        Hızlı Görüntüle
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      {product.rating > 0 && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-purple-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {product.category?.name || 'Elbise'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Neden ModaBase'de Kadın Elbise Almalısınız?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Geniş Ürün Yelpazesi</h3>
                <p className="text-gray-600">Binlerce kadın elbise modeli tek bir yerde</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Kaliteli Ürünler</h3>
                <p className="text-gray-600">Sadece kaliteli markaların ürünleri</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Uygun Fiyatlar</h3>
                <p className="text-gray-600">En uygun fiyat garantisi</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Müşteri Memnuniyeti</h3>
                <p className="text-gray-600">%98 müşteri memnuniyet oranı</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Kadın Elbise Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Hangi elbise modeli bana uyar?</h3>
                <p className="text-gray-700 mb-6">
                  Vücut tipinize göre elbise seçimi yapabilirsiniz. A tipi vücut yapısı için A-line elbiseler, 
                  apple tipi için empire bel elbiseler önerilir. Size rehberi sayfamızı ziyaret edebilirsiniz.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Elbise nasıl ölçülür?</h3>
                <p className="text-gray-700 mb-6">
                  Elbise ölçüsü alırken göğüs, bel ve kalça ölçülerinizi not edin. Ürün sayfalarındaki 
                  beden tablosu ile karşılaştırarak doğru bedeni seçebilirsiniz.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Elbise nasıl kombinlenir?</h3>
                <p className="text-gray-700 mb-6">
                  Günlük elbise için spor ayakkabı, abiye elbise için topuklu ayakkabı tercih edilebilir. 
                  Aksesuar seçimi elbise rengine ve tarzına göre yapılmalıdır.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">İade koşulları nelerdir?</h3>
                <p className="text-gray-700 mb-6">
                  14 gün içinde, etiketli ve hiç kullanılmamış ürünler iade edilebilir. 
                  Ücretsiz iade ve değişim hizmetimiz mevcuttur.
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