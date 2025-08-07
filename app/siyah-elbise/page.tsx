import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Sparkles, Crown, Clock } from 'lucide-react'

// Professional SEO Metadata - Siyah Elbise (Conversion Strategy)
export const metadata: Metadata = {
  title: 'Siyah Elbise Modelleri 2024 - Şık Siyah Elbise Çeşitleri | ModaBase',
  description: 'Siyah elbise modelleri: kısa siyah elbise, uzun siyah elbise, siyah abiye elbise, siyah günlük elbise. 2024 en şık siyah elbise çeşitleri uygun fiyatlarla. Ücretsiz kargo!',
  keywords: 'siyah elbise, siyah elbise modelleri, kısa siyah elbise, uzun siyah elbise, siyah abiye elbise, siyah günlük elbise, little black dress, siyah gece elbise, klasik siyah elbise',
  openGraph: {
    title: 'Siyah Elbise Modelleri 2024 - Şık Siyah Elbise Çeşitleri',
    description: 'ModaBase\'de zarif siyah elbise koleksiyonu! Kısa, uzun, abiye ve günlük siyah elbise modelleri. Her gardırobun vazgeçilmezi siyah elbise çeşitleri.',
    images: ['/og-siyah-elbise.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siyah Elbise Modelleri 2024 - ModaBase',
    description: 'Zarif siyah elbise koleksiyonu. Kısa, uzun, abiye siyah elbise modelleri uygun fiyatlarla.',
    images: ['/twitter-siyah-elbise.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/siyah-elbise'
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

async function getSiyahElbiseProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'siyah elbise', mode: 'insensitive' } },
          { name: { contains: 'black dress', mode: 'insensitive' } },
          { 
            AND: [
              { name: { contains: 'siyah', mode: 'insensitive' } },
              { name: { contains: 'elbise', mode: 'insensitive' } }
            ]
          },
          { 
            AND: [
              { description: { contains: 'siyah', mode: 'insensitive' } },
              { description: { contains: 'elbise', mode: 'insensitive' } }
            ]
          },
          { 
            AND: [
              { name: { contains: 'black', mode: 'insensitive' } },
              { 
                category: {
                  name: { contains: 'elbise', mode: 'insensitive' }
                }
              }
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
    console.error('Siyah elbise products fetch error:', error)
    return []
  }
}

export default async function SiyahElbisePage() {
  const products = await getSiyahElbiseProducts()

  // Professional JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Siyah Elbise Modelleri 2024",
    "description": "Zarif siyah elbise koleksiyonu. Kısa, uzun, abiye ve günlük siyah elbise modelleri.",
    "url": "https://modabase.com.tr/siyah-elbise",
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
          "category": "Siyah Elbise",
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
              "ratingValue": product.rating || 4.7,
              "reviewCount": product.reviewCount || 22
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
          "name": "Kadın Elbise",
          "item": "https://modabase.com.tr/kadin-elbise"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Siyah Elbise",
          "item": "https://modabase.com.tr/siyah-elbise"
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
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-black">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                🖤 Siyah Elbise Modelleri
              </h1>
              <p className="text-2xl md:text-3xl mb-8 max-w-5xl mx-auto leading-relaxed">
                Zamanın ötesindeki klasik: <strong>Siyah elbise</strong>! 
                <strong>Kısa siyah elbise</strong>, <strong>uzun siyah elbise</strong>, <strong>siyah abiye elbise</strong> 
                ile her gardırobun vazgeçilmez parçası.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  👗 {products.length}+ Siyah Elbise
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  ⚫ Klasik Zarafet
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  ✨ Little Black Dress
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-black">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/kadin-elbise" className="hover:text-black">Kadın Elbise</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-black">Siyah Elbise</li>
          </ol>
        </nav>

        {/* Occasion Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-black to-gray-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-lg font-bold mb-2">İş Elbisesi</h3>
              <p className="text-sm text-gray-300">Profesyonel görünüm</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-black text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">🌙</div>
              <h3 className="text-lg font-bold mb-2">Gece Elbisesi</h3>
              <p className="text-sm text-gray-300">Şık akşam görünümü</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">💎</div>
              <h3 className="text-lg font-bold mb-2">Abiye Elbise</h3>
              <p className="text-sm text-gray-300">Özel günler</p>
            </div>
            <div className="bg-gradient-to-br from-gray-700 to-black text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">☕</div>
              <h3 className="text-lg font-bold mb-2">Günlük Elbise</h3>
              <p className="text-sm text-gray-300">Rahat şıklık</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="bg-gray-50 rounded-2xl p-10 mb-12 shadow-xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
              Siyah Elbise: Zamanın Ötesindeki Klasik
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-black flex items-center">
                  <Crown className="w-8 h-8 mr-3" />
                  Siyah Elbise Çeşitleri ve Modelleri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Siyah elbise</strong>, kadın gardırobunun en klasik ve vazgeçilmez parçasıdır. 
                  Coco Chanel'in "Little Black Dress" konseptinden günümüze, <strong>siyah elbise modelleri</strong> 
                  hem zamansız zarafeti hem de çok yönlülüğü temsil eder.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-black rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Kısa Siyah Elbise Modelleri</h4>
                      <p className="text-gray-600">Little black dress, kokteyl elbise, günlük kısa elbise</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gray-800 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Uzun Siyah Elbise Çeşitleri</h4>
                      <p className="text-gray-600">Maxi elbise, gece elbisesi, özel davet elbisesi</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gray-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Siyah Abiye Elbise</h4>
                      <p className="text-gray-600">Düğün, nişan, mezuniyet, gala elbisesi</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Siyah Günlük Elbise</h4>
                      <p className="text-gray-600">İş, okul, alışveriş için rahat elbise modelleri</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-black flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  Siyah Elbise Kombinleri ve Stil Rehberi
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Siyah elbise</strong> kombinleri sonsuz çeşitlilikte yapılabilir. 
                  Doğru aksesuar, ayakkabı ve dış giyim seçimi ile aynı elbiseyi farklı ortamlarda kullanabilirsiniz.
                </p>
                <div className="space-y-6">
                  <div className="bg-black text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">💼 İş Kombinleri</h4>
                    <p className="text-gray-200">
                      Siyah elbise + Blazer + Nude stiletto = Profesyonel şıklık
                    </p>
                  </div>
                  <div className="bg-gray-800 text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">🌟 Gece Kombinleri</h4>
                    <p className="text-gray-200">
                      Siyah elbise + Statement jewelry + Topuklu ayakkabı = Gece zarafeti
                    </p>
                  </div>
                  <div className="bg-gray-600 text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">☕ Günlük Kombinler</h4>
                    <p className="text-gray-200">
                      Siyah elbise + Denim ceket + Sneaker = Casual chic
                    </p>
                  </div>
                  <div className="bg-gray-400 text-black p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">💎 Özel Günler</h4>
                    <p className="text-gray-800">
                      Siyah abiye + Clutch çanta + Zarif ayakkabı = Sofistike görünüm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold text-gray-900">
              Klasik Siyah Elbise Koleksiyonu ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=siyah-elbise" 
              className="text-black hover:text-gray-700 font-medium flex items-center gap-2 text-lg"
            >
              Tümünü Görüntüle <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-gray-200">
                <Link href={`/product/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Siyah Elbise ${product.category?.name || ''}`}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                      SİYAH ELBİSE
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
                        <span className="text-2xl font-bold text-black">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-black text-white px-3 py-2 rounded-full font-medium">
                        {product.category?.name || 'Siyah Elbise'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Little Black Dress Heritage */}
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Little Black Dress: Bir Efsanenin Hikayesi
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">1926 - Başlangıç</h3>
                <p className="text-gray-300">Coco Chanel, ilk "Little Black Dress"i tasarladı ve moda tarihine geçti.</p>
              </div>
              <div className="text-center">
                <Crown className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Kraliçe Parça</h3>
                <p className="text-gray-300">Her kadının dolabında olması gereken vazgeçilmez klasik parça.</p>
              </div>
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Zamansız Zarafet</h3>
                <p className="text-gray-300">Trendler değişir ama siyah elbise her zaman şık ve güncel kalır.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Siyah Elbise Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-black">Hangi siyah elbise modeli evrensel?</h3>
                <p className="text-gray-700 leading-relaxed">
                  A-line kesim, diz boyu, kısa veya 3/4 kollu siyah elbise en evrensel modeldir. 
                  Bu model her vücut tipine uyar ve çok amaçlı kullanılabilir.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-black">Siyah elbise hangi renk ayakkabı ile giyilir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Siyah elbise ile nude, siyah, kırmızı, metalik veya beyaz ayakkabı giyilebilir. 
                  Nude tonlar bacakları uzun gösterir, renkli ayakkabılar ise çarpıcı kontrast yaratır.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-black">Siyah elbise nasıl aksesuarlanır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Siyah elbise her renk aksesuar ile uyumludur. Altın, gümüş, inci, renkli takılar 
                  ve çantalar ile farklı stiller yaratabilirsiniz. Az aksesuar zarif, çok aksesuar gösterişli görünüm sağlar.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-black">Little Black Dress ne demek?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Little Black Dress (LBD), Coco Chanel'in 1926'da yarattığı kavramdır. 
                  Her kadının dolabında olması gereken, çok amaçlı kullanılabilen, klasik siyah elbise anlamına gelir.
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