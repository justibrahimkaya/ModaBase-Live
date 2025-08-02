import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Sun, Heart, Thermometer } from 'lucide-react'

// SEO Metadata - Yazlık Elbise için optimize edilmiş
export const metadata: Metadata = {
  title: 'Yazlık Elbise Modelleri 2024 - En Şık Yaz Elbiseleri | ModaBase',
  description: 'Yazlık elbise modelleri: günlük yazlık elbise, plaj elbise, yaz abiye. 2024 yazlık kadın elbiseleri, ince kumaş elbiseler uygun fiyatlarla. Ücretsiz kargo!',
  keywords: 'yazlık elbise, yaz elbise, yazlık kadın elbise, plaj elbise, ince elbise, günlük yazlık elbise, yaz abiye, yazlık giyim, 2024 yazlık elbise',
  openGraph: {
    title: 'Yazlık Elbise Modelleri 2024 - En Şık Yaz Elbiseleri',
    description: 'ModaBase\'de en şık yazlık elbise modelleri! Günlük yazlık elbise, plaj elbise ve yaz abiye çeşitleri. Serin ve rahat yaz elbiseleri.',
    images: ['/og-yazlik-elbise.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yazlık Elbise Modelleri 2024 - ModaBase',
    description: 'En trend yazlık elbise modelleri. Serin ve şık yaz elbiseleri uygun fiyatlarla.',
    images: ['/twitter-yazlik-elbise.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/yazlik-elbise'
  }
}

async function getYazlikElbiseProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'yazlık', mode: 'insensitive' } },
          { name: { contains: 'yaz', mode: 'insensitive' } },
          { name: { contains: 'plaj', mode: 'insensitive' } },
          { description: { contains: 'yazlık', mode: 'insensitive' } },
          { description: { contains: 'yaz', mode: 'insensitive' } },
          { 
            category: {
              name: { contains: 'yazlık', mode: 'insensitive' }
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
      take: 20
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
    console.error('Yazlik elbise products fetch error:', error)
    return []
  }
}

export default async function YazlikElbisePage() {
  const products = await getYazlikElbiseProducts()

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Yazlık Elbise Modelleri 2024",
    "description": "En şık yazlık elbise modelleri. Serin ve rahat yaz elbiseleri, plaj elbise çeşitleri.",
    "url": "https://www.modabase.com.tr/yazlik-elbise",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": product.name,
        "description": product.description,
        "image": product.imageUrl,
        "url": `https://www.modabase.com.tr/product/${product.id}`,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock"
        }
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                ☀️ Yazlık Elbise Modelleri
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
                Sıcak yaz günleri için özel tasarlanmış <strong>yazlık elbise</strong> modelleri. 
                <strong>Plaj elbise</strong>, <strong>günlük yazlık elbise</strong> ve serinletici 
                yaz koleksiyonu ile stilinizi tamamlayın.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-lg">
                <span className="bg-white/20 px-6 py-3 rounded-full">🌴 Plaj & Tatil</span>
                <span className="bg-white/20 px-6 py-3 rounded-full">❄️ Serinletici Kumaş</span>
                <span className="bg-white/20 px-6 py-3 rounded-full">🚚 Hızlı Teslimat</span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-orange-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/kadin-elbise" className="hover:text-orange-600">Kadın Elbise</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-orange-600">Yazlık Elbise</li>
          </ol>
        </nav>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              2024 Yazlık Elbise Trendleri
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Sun className="w-8 h-8 text-yellow-500 mr-3" />
                  <h3 className="text-2xl font-semibold text-gray-900">Günlük Yazlık Elbise</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Günlük yazlık elbise</strong> modelleri ile sıcak yaz günlerinde hem rahat hem de şık görünün. 
                  Pamuk ve viskon karışımı ince kumaşlar ile üretilen serinletici yazlık elbise çeşitleri.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Rahat kesim günlük yazlık elbise</li>
                  <li>Kısa kollu yaz elbise modelleri</li>
                  <li>Midi boy yazlık elbise</li>
                  <li>Desenli günlük yazlık elbise</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 text-blue-500 mr-3 text-2xl">🌊</div>
                  <h3 className="text-2xl font-semibold text-gray-900">Plaj Elbise Modelleri</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tatil ve plaj için özel tasarlanmış <strong>plaj elbise</strong> modelleri. 
                  Deniz kenarında ve tatilde rahatlıkla giyebileceğiniz şık plaj elbise çeşitleri mevcut.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Uzun plaj elbise modelleri</li>
                  <li>Kısa plaj elbise çeşitleri</li>
                  <li>Bikini üstü plaj elbise</li>
                  <li>Transparan plaj elbise</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center mb-4">
                  <Thermometer className="w-8 h-8 text-red-500 mr-3" />
                  <h3 className="text-2xl font-semibold text-gray-900">Serinletici Kumaşlar</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Özel serinletici kumaşlar ile üretilen <strong>yazlık elbise</strong> modelleri. 
                  Nefes alabilir, ter emici ve hızlı kuruyan özellikler ile yaz konforu sağlar.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>%100 pamuk yazlık elbise</li>
                  <li>Viskon karışım yaz elbise</li>
                  <li>Keten yazlık elbise modelleri</li>
                  <li>Modal kumaş yaz elbise</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Trend Yazlık Elbise Modelleri ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=yazlik" 
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2"
            >
              Tümünü Görüntüle <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/product/${product.id}`}>
                  <div className="relative group">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Yazlık Elbise ${product.category?.name || ''}`}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                      YAZ 2024
                    </div>
                    <button className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
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
                        <span className="text-lg font-bold text-orange-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        {product.category?.name || 'Yazlık'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Summer Care Tips */}
        <section className="bg-gradient-to-r from-blue-50 to-cyan-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Yazlık Elbise Bakım İpuçları
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">🧺 Yıkama</h3>
                <p className="text-gray-700">
                  Yazlık elbiseler 30 derece soğuk suda yıkanmalı, ağartıcı kullanılmamalı. 
                  Renkli ve beyaz elbiseleri ayrı yıkayın.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-green-600">🌞 Kurutma</h3>
                <p className="text-gray-700">
                  Direkt güneş ışığından kaçının. Gölgede, düz olarak kurutun. 
                  Kurutma makinesinde düşük ısıda kurutabilirsiniz.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-purple-600">👗 Saklama</h3>
                <p className="text-gray-700">
                  Nemli olmayan, havadar dolapta askıda saklayın. Lavanta kesesi ile güve koruması sağlayın.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-orange-600">🔥 Ütüleme</h3>
                <p className="text-gray-700">
                  Düşük ısıda, tersten ütüleyin. Buharlı ütü kullanımında dikkatli olun.
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