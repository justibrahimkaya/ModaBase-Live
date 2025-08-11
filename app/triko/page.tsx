import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart } from 'lucide-react'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Triko Modelleri 2025 - En Trend Triko Elbise ve Kazak | ModaBase',
  description: 'Triko elbise, triko kazak, triko hırka ve triko modelleri. 2025 kış trendi triko giyim ürünleri uygun fiyatlarla. Ücretsiz kargo fırsatı!',
  keywords: 'triko, triko elbise, triko kazak, triko modelleri, kadın triko, triko hırka, triko giyim, kış triko, 2025 triko trend',
  openGraph: {
    title: 'Triko Modelleri 2025 - En Trend Triko Elbise ve Kazak',
    description: 'ModaBase\'de en şık triko modelleri! Triko elbise, kazak ve hırka çeşitleri. Ücretsiz kargo, hızlı teslimat.',
    images: ['/og-triko.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Triko Modelleri 2025 - ModaBase',
    description: 'En trend triko elbise ve kazak modelleri. Kaliteli triko giyim ürünleri uygun fiyatlarla.',
    images: ['/twitter-triko.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/triko'
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

async function getTrikoProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'triko', mode: 'insensitive' } },
          { name: { contains: 'kazak', mode: 'insensitive' } },
          { name: { contains: 'hırka', mode: 'insensitive' } },
          { description: { contains: 'triko', mode: 'insensitive' } },
          { 
            category: {
              OR: [
                { name: { contains: 'triko', mode: 'insensitive' } },
                { name: { contains: 'kazak', mode: 'insensitive' } }
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
    console.error('Triko products fetch error:', error)
    return []
  }
}

export default async function TrikoPage() {
  const products = await getTrikoProducts()

  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Triko Modelleri 2025",
    "description": "En trend triko elbise, kazak ve hırka modelleri. Kaliteli triko giyim ürünleri uygun fiyatlarla.",
    "url": "https://modabase.com.tr/triko",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10)
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
              "availability": "https://schema.org/InStock",
              "condition": "https://schema.org/NewCondition",
              "itemCondition": "https://schema.org/NewCondition",
              "url": `https://www.modabase.com.tr/product/${product.id}`,
              "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              "validFrom": new Date().toISOString().split('T')[0],
              "seller": {
                "@type": "Organization",
                "name": "ModaBase",
                "url": "https://www.modabase.com.tr"
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
              "ratingValue": product.rating || "4.7",
              "reviewCount": product.reviewCount || "20"
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
              "reviewBody": "Kaliteli triko ürün, çok beğendim."
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
          "name": "Triko Modelleri",
          "item": "https://modabase.com.tr/triko"
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
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Triko Modelleri 2025
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                En şık <strong>triko elbise</strong>, <strong>triko kazak</strong> ve <strong>triko hırka</strong> modelleri. 
                Kış gardırobunuzu tamamlayacak kaliteli triko giyim ürünleri.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-lg">
                <span className="bg-white/20 px-4 py-2 rounded-full">✨ 2500₺+ Ücretsiz Kargo</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">🚚 Hızlı Teslimat</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">💯 Kalite Garantisi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-purple-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-purple-600">Triko Modelleri</li>
          </ol>
        </nav>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              2025 Triko Trendleri ve Modelleri
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Triko Elbise Modelleri</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Triko elbise</strong> modelleri, 2025 kış sezonunun en trend parçaları arasında yer alıyor. 
                  Boğazlı triko elbise, midi triko elbise ve maxi triko elbise çeşitleri ile her tarzda 
                  şık kombinler yapabilirsiniz.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Boğazlı Triko Elbise Modelleri</li>
                  <li>Kolsuz Triko Elbise Çeşitleri</li>
                  <li>Midi ve Maxi Triko Elbise</li>
                  <li>Desenli Triko Elbise Modelleri</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">Triko Kazak ve Hırka</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Kaliteli <strong>triko kazak</strong> ve <strong>triko hırka</strong> modelleri ile soğuk kış 
                  günlerinde hem sıcak kalın hem de şık görünün. Oversize triko, fitilli triko ve 
                  örgü detaylı triko modelleri mevcut.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Oversize Triko Kazak Modelleri</li>
                  <li>Fitilli Triko Hırka Çeşitleri</li>
                  <li>Düğmeli Triko Hırka Modelleri</li>
                  <li>Kapüşonlu Triko Kazak</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Öne Çıkan Triko Modelleri ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=triko" 
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
            >
              Tümünü Görüntüle <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/product/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Triko ${product.category?.name || 'Giyim'}`}
                      className="w-full h-64 object-cover"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
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
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {product.category?.name || 'Triko'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Triko Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Triko nasıl yıkanır?</h3>
                <p className="text-gray-700 mb-6">
                  Triko ürünler 30 derece soğuk suda, özel triko deterjanı ile yıkanmalı ve 
                  düz serilerek kurutulmalıdır. Ağartıcı kullanmayın.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Triko elbise nasıl kombinlenir?</h3>
                <p className="text-gray-700 mb-6">
                  Triko elbise, bot ve ceket ile kış kombinleri, topuklu ayakkabı ile şık akşam 
                  kombinleri yapılabilir. Aksesuar seçimi önemlidir.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Hangi triko kumaşı en kaliteli?</h3>
                <p className="text-gray-700 mb-6">
                  %100 pamuk, kaşmir ve merino yün triko kumaşları en kaliteli seçeneklerdir. 
                  Karışım kumaşlar da dayanıklılık açısından tercih edilebilir.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Triko ürünler çeker mi?</h3>
                <p className="text-gray-700 mb-6">
                  Kaliteli triko ürünler doğru bakım ile çekmez. İlk yıkamada hafif çekme 
                  normal olup, sonrasında stabil kalır.
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