import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamicImport from 'next/dynamic'
import Header from '@/components/Header'
import WhatsAppButton from '@/components/WhatsAppButton'
import { buildSafePrisma } from '@/lib/buildSafePrisma'

// Lazy load heavy components
const FeaturedProducts = dynamicImport(() => import('@/components/FeaturedProducts'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
})
const Footer = dynamicImport(() => import('@/components/Footer'))
const NewsletterForm = dynamicImport(() => import('@/components/NewsletterForm'))
import { 
  Star, 
  TruckIcon, 
  Shield, 
  CreditCard, 
  Clock, 
  Quote
} from 'lucide-react'
import CategoryImage from '@/components/CategoryImage'
import SpecialOfferImage from '@/components/SpecialOfferImage'

// Ana Sayfa SEO Metadata
export const metadata: Metadata = {
      title: 'ModaBase - Türkiye\'nin En Büyük Moda E-Ticaret Platformu | 2025 Moda Trendleri',
  description: 'ModaBase\'de 500+ marka, 50K+ ürün, %100 güvenli alışveriş! Kadın giyim, erkek giyim, çocuk giyim, ayakkabı, çanta, aksesuar. Ücretsiz kargo, 30 gün iade garantisi. En yeni moda trendleri burada!',
  keywords: [
    'modabase', 'moda', 'e-ticaret', 'alışveriş', 'kadın giyim', 'erkek giyim', 
    'elbise', 'bluz', 'pantolon', 'ayakkabı', 'çanta', 'aksesuar',
    'moda trendleri', 'online alışveriş', 'ücretsiz kargo', 'güvenli ödeme',
    'indirim', 'kampanya', 'marka', 'kaliteli giyim', 'uygun fiyat'
  ],
  openGraph: {
    title: 'ModaBase - Türkiye\'nin En Büyük Moda E-Ticaret Platformu',
    description: '500+ marka, 50K+ ürün, %100 güvenli alışveriş! En yeni moda trendleri ve kampanyalar.',
    images: ['/og-homepage.jpg'],
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModaBase - Türkiye\'nin En Büyük Moda Platformu',
    description: '500+ marka, 50K+ ürün, ücretsiz kargo! En yeni moda trendleri burada.',
    images: ['/twitter-homepage.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr'
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

// Performance optimizations - Aggressive caching for mobile
export const dynamic = 'force-static'
export const revalidate = 600 // Cache for 10 minutes (600 seconds)
export const fetchCache = 'force-cache'

// Loading komponenti
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

// Categories Loading
function CategoriesLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-24 rounded-xl mb-2"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

// Features bileşeni
function Features() {
  const features = [
    {
      icon: TruckIcon,
      title: "Ücretsiz Kargo",
      description: "500₺ üzeri alışverişlerde ücretsiz ve hızlı teslimat",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Güvenli Alışveriş",
      description: "256-bit SSL şifreleme ile %100 güvenli ödeme",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: CreditCard,
      title: "Esnek Ödeme",
      description: "Kredi kartı, havale, kapıda ödeme seçenekleri",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Hızlı Teslimat",
      description: "Aynı gün kargo, 1-3 iş günü teslimat",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} p-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Categories showcase
async function CategoriesShowcase() {
  let categories: any[] = []
  
  try {
    categories = await buildSafePrisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' },
      take: 6
    })
  } catch (error) {
    console.error('Database error in CategoriesShowcase:', error)
    // Hata durumunda boş array döner
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Kategoriler</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Her zevke uygun geniş ürün yelpazesi ile stilinizi yansıtın
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" suppressHydrationWarning>
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group block text-center"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 aspect-square mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl" style={{ minHeight: '180px', height: '180px' }}>
                <CategoryImage image={category.image} name={category.name} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-xs text-gray-600">{category._count.products} ürün</div>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {category.name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// Special Offers
async function SpecialOffers() {
  let discountedProducts: any[] = []
  
  try {
    // Build sırasında veritabanı bağlantısını devre dışı bırak
    if (process.env.DATABASE_URL) {
      discountedProducts = await buildSafePrisma.product.findMany({
      where: {
        originalPrice: { not: null }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    })
    }
  } catch (error) {
    console.error('Database error in SpecialOffers:', error)
    // Hata durumunda boş array döner
  }

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Özel Fırsatlar</h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Sınırlı süreyle geçerli özel indirimler ve kampanyalar
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {discountedProducts.map((product) => {
            const images = JSON.parse(product.images || '[]')
            const discount = product.originalPrice 
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0

            return (
              <a
                key={product.id}
                href={`/product/${product.slug || product.id}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <SpecialOfferImage images={images} productName={product.name} />
                    <div className="absolute top-2 left-2 bg-red-700 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
                      %{discount} İndirim
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900">₺{product.price}</div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-700 line-through font-medium">₺{product.originalPrice}</div>
                      )}
                    </div>
                    <div className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {product.category.name}
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Testimonials
function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Ayşe Demir",
      role: "Moda Bloggeri",
      content: "ModaBase'de alışveriş yapmak gerçekten keyifli. Ürün kalitesi harika ve teslimat çok hızlı!",
      rating: 5,
      avatar: "data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23e0e7ff'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='24' fill='%234f46e5'%3EAD%3C/text%3E%3C/svg%3E"
    },
    {
      id: 2,
      name: "Mehmet Yılmaz",
      role: "Müşteri",
      content: "Fiyat performans açısından çok memnunum. Sürekli kampanyalar var ve ürünler kaliteli.",
      rating: 5,
      avatar: "data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23dbeafe'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='24' fill='%232563eb'%3EMY%3C/text%3E%3C/svg%3E"
    },
    {
      id: 3,
      name: "Zeynep Kaya",
      role: "Tasarımcı",
      content: "Trend ürünleri herkesten önce burada buluyorum. Müşteri hizmetleri de çok ilgili.",
      rating: 5,
      avatar: "data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23fce7f3'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-size='24' fill='%23ec4899'%3EZK%3C/text%3E%3C/svg%3E"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Müşteri Yorumları</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Binlerce memnun müşterimizin deneyimlerini keşfedin
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-purple-500 mb-4" />
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Admin Portal Section


// Newsletter
function Newsletter() {
  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Fırsatları Kaçırmayın</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Özel indirimler, yeni koleksiyonlar ve trend haberler için bültenimize abone olun
          </p>
        </div>
        
                    <NewsletterForm />
        
        <p className="text-sm text-gray-400 mt-4">
          Dilediğiniz zaman abonelikten çıkabilirsiniz. Gizlilik politikamızı okuyun.
        </p>
      </div>
    </section>
  )
}

export default async function Home() {
  let featuredProducts: any[] = []
  let hasError = false

  // GEÇİCİ değişken kaldırıldı (lint için)
  
  try {
    // Build sırasında veritabanı bağlantısını devre dışı bırak
    let products: any[] = []
    if (process.env.DATABASE_URL) {
      // ⚡ FAST: En popüler/öne çıkan ürünleri getir - OPTIMIZED
      products = await buildSafePrisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        images: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: { 
          select: { reviews: true } 
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    })

    // Ortalama rating hesapla - Modern JS optimized
    featuredProducts = products.map((product) => {
      const reviews = product.reviews
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0
      
      const { originalPrice, price } = product
      const discount = originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0
      
      const images = JSON.parse(product.images || '[]')
      const imageUrl = images[0] || ''

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        originalPrice,
        rating: Math.round(averageRating * 10) / 10,
        reviews: product._count.reviews,
        image: imageUrl,
        isNew: false,
        discount,
        category: product.category
      }
    })
    }
  } catch (error: any) {
    console.error('Database error in Home page:', {
      message: error?.message || 'Unknown error',
      code: error?.code,
      name: error?.name,
      cause: error?.cause,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    })
    hasError = true
  }

  // Database hatası varsa fallback UI göster
  if (hasError) {
    return (
      <main className="min-h-screen">
        <Header />
        
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Site Kurulum Aşamasında</h2>
            <p className="text-gray-600 mb-4">
              ModaBase şu anda kurulum aşamasında. Database bağlantısı yapılandırılıyor.
            </p>
            <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
              <strong>Geliştirici Notu:</strong> Database bağlantısı kuruluyor. 
              Vercel environment variables kontrol edilmeli.
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen mobile-safe-top">
      <Header />
      
      {/* Spacer for fixed header - Mobile optimized */}
      <div className="h-16 sm:h-20 mobile-safe-top"></div>
      
      {/* Ücretsiz Kargo Banner - Denivy Style */}
      <div className="bg-gray-900 text-white text-center py-3 text-sm font-medium relative overflow-hidden">
        <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative flex items-center justify-center gap-2">
          <span>🚚</span>
          <span className="font-semibold">ÜCRETSİZ KARGO 2500₺ ÜZERİ SİPARİŞLERDE</span>
        </div>
      </div>
      
      {/* Ana Ürün Grid - Hero olmadan direkt ürünler */}
      <section className="py-6 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<ProductsLoading />}>
            <FeaturedProducts products={featuredProducts} />
          </Suspense>
        </div>
      </section>
      
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesShowcase />
      </Suspense>
      
      <Suspense fallback={<div className="py-12 sm:py-20 text-center">Özel fırsatlar yükleniyor...</div>}>
        <SpecialOffers />
      </Suspense>
      
      <Features />
      
      <Testimonials />
      
      <Newsletter />
      
      <Footer />

      {/* WhatsApp Support Button for Customers */}
      <WhatsAppButton
        phoneNumber="905362971255"
        variant="floating"
        size="lg"
        isBusinessAdmin={false}
        className="bottom-6 right-6"
      />
    </main>
  )
}
