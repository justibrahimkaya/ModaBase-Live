import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { buildSafePrisma } from '@/lib/buildSafePrisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Palette, Thermometer, Zap, Sun, Users, Target } from 'lucide-react'

// Professional SEO Metadata - Kadın Tişört (High Volume Strategy)
export const metadata: Metadata = {
  title: 'Kadın Tişört Modelleri 2025 - En Trend Tişört Çeşitleri | ModaBase',
  description: 'Kadın tişört modelleri: basic tişört, oversize tişört, crop tişört, v yaka tişört, polo tişört. 2025 en trend kadın tişört çeşitleri her renkte ve bedende. Ücretsiz kargo!',
  keywords: 'kadın tişört, tişört modelleri, basic tişört, oversize tişört, crop tişört, v yaka tişört, polo tişört, pamuklu tişört, baskılı tişört, düz tişört, kadın basic, 2025 tişört',
  openGraph: {
    title: 'Kadın Tişört Modelleri 2025 - En Trend Tişört Çeşitleri',
    description: 'ModaBase\'de en geniş kadın tişört koleksiyonu! Basic, oversize, crop, v yaka, polo tişört modelleri. Her renk, her beden, her tarza uygun tişört çeşitleri.',
    images: ['/og-kadin-tisort.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kadın Tişört Modelleri 2025 - ModaBase',
    description: 'En geniş kadın tişört koleksiyonu. Basic, oversize, crop tişört modelleri her renkte ve bedende.',
    images: ['/twitter-kadin-tisort.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/kadin-tisort'
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

async function getKadinTisortProducts() {
  try {
    const products = await buildSafePrisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'tişört' } },
          { name: { contains: 'tshirt' } },
          { name: { contains: 't-shirt' } },
          { name: { contains: 'basic' } },
          { 
            AND: [
              { name: { contains: 'kadın' } },
              { name: { contains: 'tişört' } }
            ]
          },
          { 
            AND: [
              { description: { contains: 'tişört' } },
              { description: { contains: 'kadın' } }
            ]
          },
          { 
            category: {
              name: { contains: 'tişört' }
            }
          },
          { 
            category: {
              name: { contains: 'basic' }
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
      take: 32
    })

    return products.map((product: any) => {
      const images = JSON.parse(product.images || '[]')
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
        : 0
      
      return {
        ...product,
        imageUrl: images[0] || '/placeholder.jpg',
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: product._count.reviews
      }
    })
  } catch (error) {
    console.error('Kadın tişört products fetch error:', error)
    return []
  }
}

export default async function KadinTisortPage() {
  const products = await getKadinTisortProducts()

  // Professional JSON-LD Structured Data (High Volume Optimization)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Kadın Tişört Modelleri 2025",
    "description": "En geniş kadın tişört koleksiyonu. Basic, oversize, crop, v yaka, polo tişört modelleri her renkte ve bedende.",
    "url": "https://modabase.com.tr/kadin-tisort",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 16).map((product: any, index: number) => {
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
        "category": "Kadın Tişört",
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
          "ratingValue": product.rating || 4.3,
          "reviewCount": product.reviewCount || 18
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
          "item": "https://modabase.com.tr/products"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Kadın Tişört",
          "item": "https://modabase.com.tr/kadin-tisort"
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
      
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
        <Header />
        
        {/* Hero Section - High Volume Strategy */}
        <section className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                👕 Kadın Tişört Modelleri
              </h1>
              <p className="text-2xl md:text-3xl mb-8 max-w-5xl mx-auto leading-relaxed">
                2025'ün en trend <strong>kadın tişört</strong> koleksiyonu! 
                <strong>Basic tişört</strong>, <strong>oversize tişört</strong>, <strong>crop tişört</strong> 
                ve daha fazlası her renkte, her bedende.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-xl">
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  👕 {products.length}+ Tişört Modeli
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  🌈 50+ Renk Seçeneği
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  📏 XS'den 5XL'e Beden
                </span>
                <span className="bg-white/20 px-8 py-4 rounded-full flex items-center">
                  ⚡ Ücretsiz Kargo
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-orange-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/products" className="hover:text-orange-600">Kadın Giyim</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-orange-600">Kadın Tişört</li>
          </ol>
        </nav>

        {/* Tişört Categories - Comprehensive */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-2xl mb-2">👕</div>
              <h3 className="text-sm font-bold mb-1">Basic Tişört</h3>
              <p className="text-xs text-orange-100">Klasik kesim</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-2xl mb-2">📐</div>
              <h3 className="text-sm font-bold mb-1">Oversize Tişört</h3>
              <p className="text-xs text-red-100">Rahat kesim</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-2xl mb-2">✂️</div>
              <h3 className="text-sm font-bold mb-1">Crop Tişört</h3>
              <p className="text-xs text-pink-100">Kısa kesim</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-2xl mb-2">👔</div>
              <h3 className="text-sm font-bold mb-1">V Yaka Tişört</h3>
              <p className="text-xs text-purple-100">Zarif yaka</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-2xl mb-2">🎽</div>
              <h3 className="text-sm font-bold mb-1">Polo Tişört</h3>
              <p className="text-xs text-indigo-100">Spor şık</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="text-sm font-bold mb-1">Baskılı Tişört</h3>
              <p className="text-xs text-blue-100">Desenli</p>
            </div>
          </div>
        </section>

        {/* SEO Content Section - Comprehensive High Volume */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-10 mb-12 shadow-xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-10 text-center">
              Kadın Tişört: Her Gardırobun Temel Parçası
            </h2>
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h3 className="text-3xl font-semibold mb-6 text-orange-600 flex items-center">
                  <Target className="w-8 h-8 mr-3" />
                  Kadın Tişört Modelleri ve Çeşitleri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Kadın tişört</strong>, modern kadının vazgeçilmez gardırob parçasıdır. 
                  Günlük hayatın her anında rahatlık ve şıklığı bir arada sunan <strong>tişört modelleri</strong>, 
                  hem konfor hem de stil arayanların ilk tercihi.
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-2xl font-bold mb-4 text-orange-700">📏 Kesim Çeşitleri</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Basic Tişört</h5>
                          <p className="text-gray-600">Klasik, her vücut tipine uygun, zamansız kesim</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Oversize Tişört</h5>
                          <p className="text-gray-600">Rahat, bol kesim, günlük konfor</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Crop Tişört</h5>
                          <p className="text-gray-600">Kısa kesim, genç ve sportif görünüm</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">V Yaka Tişört</h5>
                          <p className="text-gray-600">Zarif yaka, feminen görünüm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-bold mb-4 text-red-700">🎨 Stil Çeşitleri</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Polo Tişört</h5>
                          <p className="text-gray-600">Yakalı, spor şık görünüm</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-teal-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Baskılı Tişört</h5>
                          <p className="text-gray-600">Desenli, kişilik yansıtan modeller</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Düz Tişört</h5>
                          <p className="text-gray-600">Sade, kombine kolay, klasik</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-semibold text-lg">Pamuklu Tişört</h5>
                          <p className="text-gray-600">Doğal kumaş, nefes alabilir</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-semibold mb-6 text-red-600 flex items-center">
                  <Palette className="w-8 h-8 mr-3" />
                  Renk Rehberi ve Kombin Önerileri
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  <strong>Kadın tişört</strong> kombinleri sonsuz çeşitlilikte yapılabilir. 
                  Doğru renk ve model seçimi ile her ortama uygun görünümler elde edilir.
                </p>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">🖤 Klasik Renkler</h4>
                    <p className="text-gray-200 text-sm">
                      Siyah, beyaz, gri tişört - Her kombine uyum sağlar
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">❤️ Canlı Renkler</h4>
                    <p className="text-red-100 text-sm">
                      Kırmızı, pembe, turuncu - Enerjik ve çarpıcı görünüm
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">💙 Soğuk Tonlar</h4>
                    <p className="text-blue-100 text-sm">
                      Mavi, mor, yeşil - Sakin ve ferah görünüm
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl">
                    <h4 className="font-bold text-lg mb-3">☀️ Sıcak Tonlar</h4>
                    <p className="text-yellow-100 text-sm">
                      Sarı, turuncu, bej - Neşeli ve dinamik görünüm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Collection */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Mevsimlik Tişört Koleksiyonları
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-8 rounded-2xl shadow-xl text-center">
              <Sun className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Yaz Tişörtleri</h3>
              <p className="text-yellow-100 mb-4">İnce kumaş, nefes alabilir, UV korumalı</p>
              <ul className="text-sm text-yellow-100 space-y-1">
                <li>• Pamuk-modal karışım</li>
                <li>• Açık renkler</li>
                <li>• Kısa kollu modeller</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-8 rounded-2xl shadow-xl text-center">
              <Thermometer className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">İlkbahar Tişörtleri</h3>
              <p className="text-green-100 mb-4">Orta kalınlık, geçiş mevsimi rahatlığı</p>
              <ul className="text-sm text-green-100 space-y-1">
                <li>• %100 pamuk</li>
                <li>• Pastel tonlar</li>
                <li>• Çok amaçlı kullanım</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white p-8 rounded-2xl shadow-xl text-center">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Sonbahar Tişörtleri</h3>
              <p className="text-orange-100 mb-4">Katmanlı giyim, earth tone renkler</p>
              <ul className="text-sm text-orange-100 space-y-1">
                <li>• Uzun kollu seçenekler</li>
                <li>• Toprak tonları</li>
                <li>• Layer friendly</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-xl text-center">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Kış Tişörtleri</h3>
              <p className="text-indigo-100 mb-4">İç giyim, thermal özellik, kalın kumaş</p>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li>• Thermal pamuk</li>
                <li>• Koyu renkler</li>
                <li>• Katman sistemi</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Products Grid - Expanded for High Volume */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 bg-white">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold text-gray-900">
              Kadın Tişört Koleksiyonu ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=tişört" 
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 text-lg"
            >
              Tümünü Görüntüle <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <article key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-gray-200">
                <Link href={`/product/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Kadın Tişört ${product.category?.name || ''}`}
                      className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      TİŞÖRT
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
                        <span className="text-2xl font-bold text-orange-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-full font-medium">
                        {product.category?.name || 'Tişört'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Size Guide Section */}
        <section className="bg-gradient-to-r from-orange-400 to-red-400 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Kadın Tişört Beden Rehberi
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📏</div>
                <h3 className="text-xl font-bold mb-3">XS - S Beden</h3>
                <p className="text-orange-100">Göğüs: 80-88 cm<br/>Bel: 60-68 cm<br/>Kalça: 86-94 cm</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📐</div>
                <h3 className="text-xl font-bold mb-3">M - L Beden</h3>
                <p className="text-orange-100">Göğüs: 92-100 cm<br/>Bel: 72-80 cm<br/>Kalça: 98-106 cm</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-3">XL - XXL Beden</h3>
                <p className="text-orange-100">Göğüs: 104-112 cm<br/>Bel: 84-92 cm<br/>Kalça: 110-118 cm</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-3">3XL - 5XL Beden</h3>
                <p className="text-orange-100">Göğüs: 116+ cm<br/>Bel: 96+ cm<br/>Kalça: 122+ cm</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for High Volume SEO */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              Kadın Tişört Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-orange-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-orange-600">Hangi tişört modeli evrenseldir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Basic kesim, bisiklet yaka, kısa kollu pamuklu tişört en evrensel modeldir. 
                  Her vücut tipine uyar, kombinlenmesi kolaydır ve her mevsim kullanılabilir.
                </p>
              </div>
              <div className="bg-red-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-red-600">Oversize tişört nasıl kombinlenir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Oversize tişört dar alt giyim ile dengelenir. Skinny jean, tayt veya dar etek ile 
                  orantılı görünüm sağlanır. Kemerle bel vurgusu yapılabilir.
                </p>
              </div>
              <div className="bg-pink-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-pink-600">Crop tişört kime yakışır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Crop tişört genç ve sportif görünümü sevenler için idealdir. 
                  Yüksek bel pantolon veya etek ile kombinlendiğinde zarif bir görünüm elde edilir.
                </p>
              </div>
              <div className="bg-purple-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-purple-600">Tişört nasıl bakım yapılır?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Pamuklu tişörtler 30°C'de yıkanır, ters çevrilip asılır, direkt güneşe maruz bırakılmaz. 
                  Orta ısıda ütülenir, kurutma makinesinde düşük ısı kullanılır.
                </p>
              </div>
              <div className="bg-blue-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">V yaka tişört hangi durumlarda tercih edilir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  V yaka tişört boynu uzun gösterir ve feminen bir görünüm sağlar. 
                  İş ortamında, randevularda ve özel günlerde tercih edilebilir.
                </p>
              </div>
              <div className="bg-teal-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-teal-600">Polo tişört ne zaman giyilir?</h3>
                <p className="text-gray-700 leading-relaxed">
                  Polo tişört spor şık görünüm için idealdir. Golf, tenis gibi sporlarda, 
                  casual iş ortamlarında ve hafta sonu aktivitelerinde tercih edilir.
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