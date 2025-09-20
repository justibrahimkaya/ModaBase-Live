import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

// Products Page Metadata - SEO Optimized
export const metadata: Metadata = {
  title: 'Ürünler - Binlerce Moda Ürünü | ModaBase',
  description: 'ModaBase\'de binlerce moda ürünü. Kadın giyim, erkek giyim, ayakkabı, çanta, aksesuar kategorilerinde en kaliteli ürünler. Ücretsiz kargo, güvenli ödeme.',
  keywords: [
    'ürünler', 'moda ürünleri', 'online alışveriş', 'kadın giyim', 'erkek giyim',
    'ayakkabı', 'çanta', 'aksesuar', 'moda', 'trend', 'modabase',
    'güvenli alışveriş', 'ücretsiz kargo', 'kaliteli ürün'
  ],
  openGraph: {
    title: 'Ürünler - Binlerce Moda Ürünü | ModaBase',
    description: 'Binlerce moda ürünü, güvenli alışveriş, ücretsiz kargo. En trend ürünler ModaBase\'de!',
    images: ['/og-products.jpg'],
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModaBase Ürünler - Binlerce Moda Seçeneği',
    description: 'Binlerce moda ürünü, güvenli alışveriş, ücretsiz kargo!',
    images: ['/twitter-products.jpg']
  },
  alternates: {
    canonical: 'https://www.modabase.com.tr/products'
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

async function getProducts(searchParams: ProductsPageProps['searchParams']) {
  try {
    const page = parseInt(searchParams.page || '1')
    const pageSize = 20
    const skip = (page - 1) * pageSize

    const where: any = {
      stock: { gt: 0 } // Sadece stokta olan ürünler
    }

    // Kategori filtresi
    if (searchParams.category) {
      where.category = {
        slug: searchParams.category
      }
    }

    // Arama filtresi
    if (searchParams.search) {
      where.OR = [
        { name: { contains: searchParams.search, mode: 'insensitive' } },
        { description: { contains: searchParams.search, mode: 'insensitive' } }
      ]
    }

    // Sıralama
    let orderBy: any = { createdAt: 'desc' }
    switch (searchParams.sort) {
      case 'price-asc':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'name-asc':
        orderBy = { name: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy,
        take: pageSize,
        skip
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error('Products fetch error:', error)
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return categories
  } catch (error) {
    console.error('Categories fetch error:', error)
    return []
  }
}



export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [productsData, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories()
  ])

  const { products, pagination } = productsData

  // JSON-LD Structured Data for Products
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "ModaBase Ürünler",
    "description": "Binlerce moda ürünü, güvenli alışveriş deneyimi",
    "url": "https://modabase.com.tr/products",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": pagination.totalCount,
      "itemListElement": products.slice(0, 12).map((product, index) => {
        // Image URL belirle - base64'leri reddet, default kullan
        const getValidImageUrl = () => {
          if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (firstImage && firstImage.startsWith('http') && !firstImage.startsWith('data:image/')) {
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
          "url": `https://www.modabase.com.tr/product/${product.slug}`,
          "category": product.category.name,
          "image": getValidImageUrl(),
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "TRY",
            "availability": "https://schema.org/InStock",
            "condition": "https://schema.org/NewCondition",
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "url": `https://www.modabase.com.tr/product/${product.slug}`,
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
              "@type": "Organization",
              "name": "ModaBase",
              "url": "https://www.modabase.com.tr"
            }
          }
        }
      })
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
      
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Binlerce Moda Ürünü
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                En trend moda ürünleri, güvenli alışveriş ve ücretsiz kargo ile
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategoriler</h2>
                <div className="space-y-2">
                  <Link
                    href="/products"
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      !searchParams.category 
                        ? 'bg-blue-100 text-blue-800 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tüm Ürünler ({pagination.totalCount})
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                        searchParams.category === category.slug
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({category._count.products})
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Filters and Sort */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="text-gray-600">
                    {pagination.totalCount} ürün bulundu
                    {searchParams.category && categories.find(c => c.slug === searchParams.category) && (
                      <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {categories.find(c => c.slug === searchParams.category)?.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Sort Dropdown - Bu client component olarak ayrı yapılabilir */}
                  <div className="text-sm text-gray-600">
                    Sıralama: {
                      searchParams.sort === 'price-asc' ? 'Fiyat (Düşük → Yüksek)' :
                      searchParams.sort === 'price-desc' ? 'Fiyat (Yüksek → Düşük)' :
                      searchParams.sort === 'name-asc' ? 'İsim (A → Z)' :
                      'En Yeni'
                    }
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
                  <p className="text-gray-600">Arama kriterlerinize uygun ürün bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const images = JSON.parse(product.images || '[]')
                    const mainImage = images[0] || '/default-product.jpg'
                    
                    return (
                      <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                        {/* Image */}
                        <div className="aspect-square bg-gray-200 relative overflow-hidden">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.originalPrice && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                              <Heart className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="text-xs text-gray-500 mb-1">{product.category.name}</div>
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-gray-900">
                                ₺{product.price.toLocaleString('tr-TR')}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ₺{product.originalPrice.toLocaleString('tr-TR')}
                                </span>
                              )}
                            </div>
                            
                            <Link
                              href={`/product/${product.slug}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Detay
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    {pagination.hasPrev && (
                      <Link
                        href={`/products?${new URLSearchParams({
                          ...searchParams,
                          page: (pagination.currentPage - 1).toString()
                        }).toString()}`}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )}
                    
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Sayfa {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    
                    {pagination.hasNext && (
                      <Link
                        href={`/products?${new URLSearchParams({
                          ...searchParams,
                          page: (pagination.currentPage + 1).toString()
                        }).toString()}`}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  )
}