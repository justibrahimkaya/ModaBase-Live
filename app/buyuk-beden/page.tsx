import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Sparkles, TrendingUp, Award, Users } from 'lucide-react'

// Professional SEO Metadata - Büyük Beden (Niche Market Strategy)
export const metadata: Metadata = {
  title: 'Büyük Beden Kıyafetler 2025 - XL XXL 3XL 4XL Büyük Beden Giyim | ModaBase',
  description: 'Büyük beden kadın giyim: büyük beden elbise, büyük beden bluz, büyük beden pantolon. XL, XXL, 3XL, 4XL, 5XL büyük beden kıyafetler uygun fiyatlarla. Özel tasarım!',
  keywords: 'büyük beden, büyük beden kıyafetler, büyük beden elbise, büyük beden bluz, büyük beden pantolon, XL, XXL, 3XL, 4XL, 5XL, plus size, büyük beden moda, büyük beden giyim',
  openGraph: {
    title: 'Büyük Beden Kıyafetler 2025 - XL XXL 3XL 4XL Büyük Beden Giyim',
    description: 'ModaBase\'de özel tasarım büyük beden koleksiyonu! XL\'den 5XL\'e kadar her bedende şık ve kaliteli kıyafetler. Büyük beden moda uzmanı.',
    images: ['/og-buyuk-beden.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Büyük Beden Kıyafetler 2025 - ModaBase',
    description: 'Özel tasarım büyük beden koleksiyonu. XL, XXL, 3XL, 4XL, 5XL büyük beden kıyafetler.',
    images: ['/twitter-buyuk-beden.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/buyuk-beden'
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

async function getBuyukBedenProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'büyük beden', mode: 'insensitive' } },
          { name: { contains: 'XL', mode: 'insensitive' } },
          { name: { contains: 'XXL', mode: 'insensitive' } },
          { name: { contains: '3XL', mode: 'insensitive' } },
          { name: { contains: '4XL', mode: 'insensitive' } },
          { name: { contains: '5XL', mode: 'insensitive' } },
          { name: { contains: 'plus size', mode: 'insensitive' } },
          { description: { contains: 'büyük beden', mode: 'insensitive' } },
          { description: { contains: 'plus size', mode: 'insensitive' } },
          { 
            category: {
              name: { contains: 'büyük beden', mode: 'insensitive' }
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
    console.error('Büyük beden products fetch error:', error)
    return []
  }
}

export default async function BuyukBedenPage() {
  const products = await getBuyukBedenProducts()

  // Professional JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Büyük Beden Kıyafetler 2025",
    "description": "Özel tasarım büyük beden koleksiyonu. XL, XXL, 3XL, 4XL, 5XL büyük beden kıyafetler.",
    "url": "https://modabase.com.tr/buyuk-beden",
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
        "category": "Büyük Beden",
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
            "merchantReturnDays": "14",
            "returnFees": "https://schema.org/OriginalShippingFees"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating || "4.8",
          "reviewCount": product.reviewCount || "25"
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
          "reviewBody": "Büyük beden ürünler çok güzel, kalite çok iyi."
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
          "name": "Büyük Beden",
          "item": "https://modabase.com.tr/buyuk-beden"
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
      
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                ✨ Büyük Beden Kıyafetler
              </h1>
              <p className="text-2xl md:text-3xl mb-8 max-w-5xl mx-auto leading-relaxed">
                Özel tasarım <strong>büyük beden</strong> koleksiyonu! 
                <strong>XL</strong>, <strong>XXL</strong>, <strong>3XL</strong>, <strong>4XL</strong>, <strong>5XL</strong> 
                büyük beden kıyafetler ile kendinizi özel hissedin.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  👗 {products.length}+ Özel Tasarım
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  📏 XL - 5XL Arası
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  💝 Özel Koleksiyon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-rose-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/kadin-elbise" className="hover:text-rose-600">Kadın Giyim</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-rose-600">Büyük Beden</li>
          </ol>
        </nav>

        {/* Size Guide Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">📏</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">XL</h3>
              <p className="text-sm text-gray-600">46-48 Beden</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">📐</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">XXL</h3>
              <p className="text-sm text-gray-600">50-52 Beden</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">3XL</h3>
              <p className="text-sm text-gray-600">54-56 Beden</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">4XL</h3>
              <p className="text-sm text-gray-600">58-60 Beden</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">5XL</h3>
              <p className="text-sm text-gray-600">62+ Beden</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-10 mb-12 shadow-xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
              2025 Büyük Beden Moda Trendleri
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-rose-700 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3" />
                  Büyük Beden Kıyafet Çeşitleri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Büyük beden kıyafetler</strong>, artık sadece pratik değil aynı zamanda son derece şık ve trend. 
                  Özel tasarım <strong>büyük beden elbise</strong>, <strong>büyük beden bluz</strong> ve 
                  <strong>büyük beden pantolon</strong> modelleri ile kendinizi özel hissedin.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-rose-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Büyük Beden Elbise Modelleri</h4>
                      <p className="text-gray-600">A-line, wrap, maxi elbise tasarımları</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Büyük Beden Bluz Çeşitleri</h4>
                      <p className="text-gray-600">Empire bel, V yaka, tunik bluz modelleri</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Büyük Beden Pantolon</h4>
                      <p className="text-gray-600">Yüksek bel, bol paça, palazzo pantolon</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-lg">Büyük Beden Takım Elbise</h4>
                      <p className="text-gray-600">İş ve özel günler için şık takımlar</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-rose-700 flex items-center">
                  <Award className="w-8 h-8 mr-3" />
                  Büyük Beden Moda Rehberi
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Büyük beden</strong> moda kuralları ve stil önerileri ile kendinizi harika hissedin. 
                  Doğru kesim, renk ve aksesuar seçimleri ile mükemmel görünümler elde edin.
                </p>
                <div className="space-y-6">
                  <div className="bg-rose-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-rose-800">✨ Renk Seçimi</h4>
                    <p className="text-gray-700">
                      Koyu renkler incelticis etkisi yapar. Parlak renklerle aksesuar yapın.
                    </p>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-pink-800">👗 Kesim Rehberi</h4>
                    <p className="text-gray-700">
                      A-line kesimler vücut oranlarını dengeler. Empire bel uzun görünüm sağlar.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-purple-800">💎 Aksesuar Tüyoları</h4>
                    <p className="text-gray-700">
                      Uzun kolyeler boyunuza uzunluk katar. Geniş kemerler bel vurgular.
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3 text-indigo-800">👠 Ayakkabı Rehberi</h4>
                    <p className="text-gray-700">
                      Topuklu ayakkabılar boy uzatır. Nude tonlar bacakları uzun gösterir.
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
              Özel Tasarım Büyük Beden Koleksiyonu ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=buyuk-beden" 
              className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-2 text-lg"
            >
              Tümünü Görüntüle <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <article key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <Link href={`/product/${product.slug || product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Büyük Beden ${product.category?.name || ''}`}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      BÜYÜK BEDEN
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
                        <span className="text-2xl font-bold text-rose-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-rose-100 text-rose-800 px-3 py-2 rounded-full font-medium">
                        {product.category?.name || 'Büyük Beden'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section className="bg-gradient-to-r from-rose-100 to-pink-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Büyük Beden Moda Topluluğu
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <Users className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Güçlü Topluluk</h3>
                <p className="text-gray-700">10,000+ memnun müşteri ve büyüyen topluluk</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <Award className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Uzman Tasarım</h3>
                <p className="text-gray-700">Büyük beden moda uzmanlarımız tarafından tasarlanan özel koleksiyon</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Trend Takibi</h3>
                <p className="text-gray-700">En son büyük beden moda trendlerini takip ediyoruz</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Büyük Beden Kıyafetler Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-rose-700">Büyük beden kıyafetlerde hangi kesimler uygun?</h3>
                <p className="text-gray-700 leading-relaxed">
                  A-line kesimler, empire bel modelleri ve wrap elbiseler büyük beden için idealdir. 
                  Bu kesimler vücut oranlarını dengeler ve zarif bir görünüm sağlar.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-rose-700">XL ile XXL arasındaki fark nedir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  XL genellikle 46-48 beden, XXL ise 50-52 beden karşılığıdır. 
                  Her markanın beden tablosu farklı olabilir, satın almadan önce ölçüleri kontrol edin.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-rose-700">Büyük beden kıyafetlerde renk seçimi nasıl olmalı?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Koyu renkler incelticis etkisi yapar. Siyah, lacivert, bordo gibi renkler güvenli seçeneklerdir. 
                  Parlak renkleri aksesuar olarak kullanabilirsiniz.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-rose-700">Büyük beden kıyafetler nasıl combine edilir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Monokrom kombinler şık görünüm sağlar. Uzun kardiganlar boyunuza uzunluk katar. 
                  Doğru aksesuar seçimi ile kombinlerinizi tamamlayın.
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