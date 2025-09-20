import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { buildSafePrisma } from '@/lib/buildSafePrisma'
import Link from 'next/link'
import { Star, ShoppingBag, Heart } from 'lucide-react'

// SEO Metadata - ERKEK TRİKO İÇİN OPTİMİZE EDİLDİ
export const metadata: Metadata = {
  title: 'Erkek Triko Modelleri 2025 - Erkek Kazak, Süveter, Hırka | ModaBase',
  description: 'En şık erkek triko kazak, erkek süveter, erkek hırka ve erkek triko modelleri. 2025-2026 kış sezonu erkek triko giyim ürünleri uygun fiyatlarla. Ücretsiz kargo!',
  keywords: 'erkek triko, erkek kazak, erkek süveter, erkek hırka, erkek triko modelleri, erkek kışlık kazak, erkek boğazlı kazak, erkek yarım balıkçı, erkek v yaka kazak, erkek triko giyim, kalın erkek kazak, ince erkek kazak, erkek örgü kazak, 2025 erkek triko',
  openGraph: {
    title: 'Erkek Triko Kazak ve Süveter Modelleri - ModaBase',
    description: 'ModaBase\'de en kaliteli erkek triko kazak, süveter ve hırka modelleri! Premium erkek triko giyim ürünleri, ücretsiz kargo, hızlı teslimat.',
    images: ['/og-erkek-triko.jpg'],
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ModaBase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Erkek Triko Modelleri - Kazak, Süveter, Hırka | ModaBase',
    description: 'Premium kalite erkek triko kazak ve süveter modelleri. Kışlık erkek giyim ürünleri uygun fiyatlarla.',
    images: ['/twitter-erkek-triko.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/erkek-triko'
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

async function getErkekTrikoProducts() {
  try {
    const products = await buildSafePrisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'erkek' } },
          { name: { contains: 'kazak' } },
          { name: { contains: 'süveter' } },
          { name: { contains: 'hırka' } },
          { name: { contains: 'triko' } },
          { description: { contains: 'erkek' } },
          { 
            category: {
              OR: [
                { name: { contains: 'erkek' } },
                { name: { contains: 'triko' } },
                { name: { contains: 'kazak' } }
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
      take: 30
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
    console.error('Erkek triko products fetch error:', error)
    return []
  }
}

export default async function ErkekTrikoPage() {
  const products = await getErkekTrikoProducts()

  // JSON-LD Structured Data - Erkek Triko için özelleştirildi
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Erkek Triko Modelleri 2025",
    "description": "Premium kalite erkek triko kazak, süveter ve hırka modelleri. Kışlık erkek giyim ürünleri uygun fiyatlarla.",
    "url": "https://www.modabase.com.tr/erkek-triko",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 15).map((product: any, index: number) => {
        const getValidImageUrl = () => {
          if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (firstImage && !firstImage.startsWith('data:image/') && firstImage.startsWith('http')) {
              return firstImage;
            }
          }
          return 'https://www.modabase.com.tr/default-product.svg';
        };

        return {
          "@type": "Product",
          "position": index + 1,
          "name": product.name,
          "description": product.description,
          "image": getValidImageUrl(),
          "url": `https://www.modabase.com.tr/product/${product.slug || product.id}`,
          "brand": {
            "@type": "Brand",
            "name": "ModaBase"
          },
          "offers": {
            "@type": "Offer",
            "price": product.price || "0",
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock",
            "condition": "https://schema.org/NewCondition",
            "itemCondition": "https://schema.org/NewCondition",
            "url": `https://www.modabase.com.tr/product/${product.slug || product.id}`,
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
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "TR",
              "returnPolicyCategory": "https://schema.org/Refundable",
              "merchantReturnDays": 14,
              "returnMethod": "https://schema.org/ReturnByMail"
            }
          },
          ...(product.rating || product.reviewCount ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating || 4.8,
              "reviewCount": product.reviewCount || 35
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
          "item": "https://www.modabase.com.tr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Erkek Giyim",
          "item": "https://www.modabase.com.tr/erkek"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Erkek Triko",
          "item": "https://www.modabase.com.tr/erkek-triko"
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
        
        {/* Hero Section - Erkek Triko Odaklı */}
        <section className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Erkek Triko Modelleri
              </h1>
              <h2 className="text-2xl md:text-3xl mb-4">
                Premium Kalite Erkek Kazak ve Süveter
              </h2>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                En şık <strong>erkek triko kazak</strong>, <strong>erkek süveter</strong> ve <strong>erkek hırka</strong> modelleri. 
                Kış sezonunun en trend erkek triko giyim ürünleri burada!
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-lg">
                <span className="bg-white/20 px-4 py-2 rounded-full">🚚 2500₺+ Ücretsiz Kargo</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">⚡ Aynı Gün Kargo</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">✅ Premium Kalite</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">💯 Memnuniyet Garantisi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-blue-600">Ana Sayfa</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/erkek" className="hover:text-blue-600">Erkek</Link></li>
            <li className="text-gray-400">/</li>
            <li className="font-medium text-blue-600">Erkek Triko</li>
          </ol>
        </nav>

        {/* SEO Content Section - Erkek Triko Detaylı */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg p-10 mb-8 shadow-lg">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              2025-2026 Erkek Triko Trendleri
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-6 mb-4">
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">Erkek Kazak Modelleri</h3>
                  <ul className="text-left text-gray-700 space-y-2">
                    <li>✓ Boğazlı Erkek Kazak</li>
                    <li>✓ V Yaka Erkek Kazak</li>
                    <li>✓ Yarım Balıkçı Yaka</li>
                    <li>✓ Bisiklet Yaka Kazak</li>
                    <li>✓ Kapüşonlu Erkek Kazak</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-6 mb-4">
                  <h3 className="text-2xl font-bold text-green-800 mb-3">Erkek Süveter Çeşitleri</h3>
                  <ul className="text-left text-gray-700 space-y-2">
                    <li>✓ Slim Fit Erkek Süveter</li>
                    <li>✓ Regular Fit Süveter</li>
                    <li>✓ Oversize Erkek Süveter</li>
                    <li>✓ Desenli Erkek Süveter</li>
                    <li>✓ Düz Renk Süveter</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-6 mb-4">
                  <h3 className="text-2xl font-bold text-purple-800 mb-3">Erkek Hırka Modelleri</h3>
                  <ul className="text-left text-gray-700 space-y-2">
                    <li>✓ Fermuarlı Erkek Hırka</li>
                    <li>✓ Düğmeli Erkek Hırka</li>
                    <li>✓ Kapüşonlu Hırka</li>
                    <li>✓ Cep Detaylı Hırka</li>
                    <li>✓ Şal Yaka Hırka</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-3xl font-bold mb-6">Erkek Triko Kazak Seçerken Nelere Dikkat Edilmeli?</h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                <strong>Erkek triko kazak</strong> seçerken kaliteli kumaş, doğru beden ve tarz uyumu önemlidir. 
                ModaBase olarak premium kalite <strong>erkek kazak modelleri</strong> ile kış gardırobunuzu tamamlıyoruz. 
                %100 pamuk, yün karışımlı ve akrilik seçenekleriyle her bütçeye uygun erkek triko ürünleri sunuyoruz.
              </p>
              
              <h4 className="text-2xl font-semibold mt-8 mb-4">Popüler Erkek Triko Kombinleri</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-3 text-lg">
                <li><strong>İş Kombini:</strong> V yaka erkek kazak + gömlek + kumaş pantolon</li>
                <li><strong>Casual Kombin:</strong> Boğazlı erkek kazak + jean pantolon + sneaker</li>
                <li><strong>Smart Casual:</strong> Yarım balıkçı yaka + chino pantolon + loafer ayakkabı</li>
                <li><strong>Spor Kombin:</strong> Kapüşonlu süveter + eşofman altı + spor ayakkabı</li>
              </ul>

              <h4 className="text-2xl font-semibold mt-8 mb-4">Erkek Triko Bakım Önerileri</h4>
              <p className="text-lg text-gray-700 mb-4">
                Erkek triko ürünlerinizin uzun ömürlü olması için:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 text-lg">
                <li>30°C'de hassas yıkama programında yıkayın</li>
                <li>Ters yüz ederek yıkayın</li>
                <li>Askıda değil, düz yüzeyde kurutun</li>
                <li>Düşük ısıda ütüleyin veya buharlı ütü kullanın</li>
                <li>Mevsim sonunda temiz ve kuru şekilde saklayın</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Category Links - Erkek Kategorileri */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Erkek Triko Kategorileri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/erkek-kazak" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
                <span className="block font-semibold">Erkek Kazak</span>
                <span className="text-sm">250+ Ürün</span>
              </Link>
              <Link href="/erkek-suveter" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
                <span className="block font-semibold">Erkek Süveter</span>
                <span className="text-sm">180+ Ürün</span>
              </Link>
              <Link href="/erkek-hirka" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
                <span className="block font-semibold">Erkek Hırka</span>
                <span className="text-sm">120+ Ürün</span>
              </Link>
              <Link href="/erkek-yelek" className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition">
                <span className="block font-semibold">Erkek Yelek</span>
                <span className="text-sm">80+ Ürün</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              En Çok Satan Erkek Triko Modelleri ({products.length} ürün)
            </h2>
            <Link 
              href="/products?category=erkek-triko" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              Tümünü Görüntüle <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <article key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link href={`/product/${product.slug || product.id}`}>
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - Erkek Triko ${product.category?.name || 'Giyim'}`}
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
                        <span className="text-lg font-bold text-blue-600">
                          ₺{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₺{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.category?.name || 'Erkek Triko'}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ Section for SEO - Erkek Triko */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Erkek Triko Hakkında Sık Sorulan Sorular
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Erkek kazak bedeni nasıl seçilir?</h3>
                <p className="text-gray-700">
                  Göğüs ölçünüze göre beden seçimi yapın. Slim fit için tam beden, comfort fit için bir beden büyük tercih edebilirsiniz. 
                  Kol boyu ve beden uzunluğunu kontrol etmeyi unutmayın.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Hangi erkek kazak modeli daha şık?</h3>
                <p className="text-gray-700">
                  İş için V yaka kazak ve gömlek kombinasyonu, günlük kullanım için boğazlı kazak, 
                  spor tarzda kapüşonlu modeller tercih edilebilir. Vücut tipinize uygun model seçimi önemlidir.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Erkek triko ürünler çeker mi?</h3>
                <p className="text-gray-700">
                  Kaliteli erkek triko ürünler, doğru yıkama talimatlarına uyulduğunda çekmez. 
                  30 derece soğuk su ve hassas yıkama programı kullanın. Sıkmadan, düz kurutun.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Erkek kazak altına ne giyilir?</h3>
                <p className="text-gray-700">
                  V yaka kazak altına gömlek veya tişört, boğazlı kazak altına basic tişört, 
                  ince triko altına termal içlik giyilebilir. Mevsime ve ortama göre tercih yapın.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Yün kazak mı pamuk kazak mı?</h3>
                <p className="text-gray-700">
                  Yün kazaklar daha sıcak tutar, pamuk kazaklar nefes alır. Karışım kumaşlar 
                  her iki özelliği barındırır. Kullanım amacına göre tercih yapılmalıdır.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Erkek hırka nasıl kombinlenir?</h3>
                <p className="text-gray-700">
                  Fermuarlı hırka spor ve casual kombinler için, düğmeli hırka daha şık kombinler için uygundur. 
                  Jean, chino veya kumaş pantolon ile kombinlenebilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="bg-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">10.000+</div>
                <div className="text-gray-600">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Erkek Triko Modeli</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">4.8/5</div>
                <div className="text-gray-600">Müşteri Puanı</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24 Saat</div>
                <div className="text-gray-600">Hızlı Kargo</div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
