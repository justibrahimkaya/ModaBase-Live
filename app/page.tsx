import { Suspense } from 'react'
import Header from '@/components/Header'
import FeaturedProducts from '@/components/FeaturedProducts'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import MobileHeroOptimized from '@/components/MobileHeroOptimized'
import { prisma } from '@/lib/prisma'
import { 
  Star, 
  TruckIcon, 
  Shield, 
  CreditCard, 
  Clock, 
  Quote,
  ShoppingBag
} from 'lucide-react'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

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
    categories = await prisma.category.findMany({
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group block text-center"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 aspect-square mb-4 group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                )}
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
    discountedProducts = await prisma.product.findMany({
      where: {
        originalPrice: { not: null }
      },
      include: {
        category: true,
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 4
    })
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
                href={`/product/${product.id}`}
                className="group block"
              >
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={images[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
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
                        <div className="text-sm text-gray-500 line-through">₺{product.originalPrice}</div>
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
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Mehmet Yılmaz",
      role: "Müşteri",
      content: "Fiyat performans açısından çok memnunum. Sürekli kampanyalar var ve ürünler kaliteli.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Zeynep Kaya",
      role: "Tasarımcı",
      content: "Trend ürünleri herkesten önce burada buluyorum. Müşteri hizmetleri de çok ilgili.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
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
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="E-posta adresinizi girin"
            className="flex-1 px-6 py-4 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Abone Ol
          </button>
        </div>
        
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

  try {
    // En popüler/öne çıkan ürünleri getir
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        category: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } }
      }
    })

    // Ortalama rating hesapla
    featuredProducts = products.map((product: any) => {
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
        : 0
      const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
      const images = JSON.parse(product.images || '[]')
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: Math.round(averageRating * 10) / 10,
        reviews: product._count.reviews,
        image: images[0] || '',
        isNew: false,
        discount,
        category: product.category
      }
    })
  } catch (error) {
    console.error('Database error in Home page:', error)
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
      
      <MobileHeroOptimized />
      
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Öne Çıkan Ürünler</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              En popüler ve trend ürünlerimizi keşfedin
            </p>
          </div>
          
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
        phoneNumber="905555555555"
        variant="floating"
        size="lg"
        isBusinessAdmin={false}
        className="bottom-6 right-6"
      />
    </main>
  )
}
