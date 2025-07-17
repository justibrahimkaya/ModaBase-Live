'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, Grid, List, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  discount?: number
  category: {
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // URL parametrelerini oku
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    
    setSelectedCategory(category)
    setSearchTerm(search)
    setCurrentPage(page)
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchTerm, sortBy, sortOrder, currentPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder
      })

      if (selectedCategory) params.append('category', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL()
  }

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    setCurrentPage(1)
    updateURL()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (selectedCategory) params.append('category', selectedCategory)
    if (searchTerm) params.append('search', searchTerm)
    if (currentPage > 1) params.append('page', currentPage.toString())
    
    router.push(`/products?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL()
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:bg-white/20">
      <a href={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {product.discount && product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              %{product.discount} İndirim
            </div>
          )}
          
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col space-y-2">
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-white/70 mb-3">{product.category.name}</p>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="ml-2 text-sm text-white/70">({product.reviews})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">{product.price.toFixed(2)} ₺</span>
              {product.originalPrice && (
                <span className="text-sm text-white/60 line-through">
                  {product.originalPrice.toFixed(2)} ₺
                </span>
              )}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </a>
    </div>
  )

  const ProductListItem = ({ product }: { product: Product }) => (
    <div className="group backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:bg-white/20">
      <a href={`/product/${product.id}`} className="flex">
        <div className="relative w-56 h-56 flex-shrink-0 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {product.discount && product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              %{product.discount} İndirim
            </div>
          )}
        </div>
        
        <div className="p-8 flex-1">
          <h3 className="font-semibold text-white mb-2 text-xl group-hover:text-yellow-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-white/70 mb-4">{product.category.name}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="ml-2 text-white/70">({product.reviews} değerlendirme)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-white">{product.price.toFixed(2)} ₺</span>
              {product.originalPrice && (
                <span className="text-white/60 line-through">
                  {product.originalPrice.toFixed(2)} ₺
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  )

  const Pagination = () => (
    <div className="flex justify-center items-center space-x-2 mt-12">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 text-white"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Önceki
      </button>
      
      <div className="flex space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full border border-white/20 transition-all duration-300 ${
              page === currentPage 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'backdrop-blur-sm bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-4 py-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 text-white"
      >
        Sonraki
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  )

  return (
    <div>
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-black">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzZCNzI4MCIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        
        {/* Floating Products Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 4 + 's',
                animationDuration: (4 + Math.random() * 3) + 's'
              }}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-sm"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-screen pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li><a href="/" className="hover:text-white transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li className="text-white">Ürünler</li>
            </ol>
          </nav>

          {/* Premium Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg mb-6">
              <Sparkles className="w-5 h-5 mr-2" />
              <span>Premium Ürün Koleksiyonu</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {selectedCategory ? 
                categories.find(c => c.slug === selectedCategory)?.name + ' Ürünleri' : 
                'Tüm Ürünler'
              }
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Kaliteli ve trendlerdeki ürünlerimizi keşfedin. Her bütçeye uygun seçenekler.
            </p>
          </div>

          {/* Filters Section */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-white/70" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ürün ara..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 text-white placeholder-white/50"
                  />
                </div>
              </form>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 text-white"
                >
                  <option value="" className="bg-gray-800">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug} className="bg-gray-800">
                      {category.name} ({category._count.products})
                    </option>
                  ))}
                </select>
                
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-')
                    setSortBy(sort || 'createdAt')
                    setSortOrder(order || 'desc')
                  }}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 text-white"
                >
                  <option value="createdAt-desc" className="bg-gray-800">En Yeni</option>
                  <option value="createdAt-asc" className="bg-gray-800">En Eski</option>
                  <option value="price-asc" className="bg-gray-800">Fiyat (Düşük → Yüksek)</option>
                  <option value="price-desc" className="bg-gray-800">Fiyat (Yüksek → Düşük)</option>
                  <option value="name-asc" className="bg-gray-800">İsim (A → Z)</option>
                  <option value="name-desc" className="bg-gray-800">İsim (Z → A)</option>
                </select>
                
                <div className="flex backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'text-white/70 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'text-white/70 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
                </div>
                <p className="mt-6 text-white/80 text-lg">Ürünler yükleniyor...</p>
                <p className="mt-2 text-white/60 text-sm">Lütfen bekleyiniz</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80 text-lg mb-2">Ürün bulunamadı</p>
                <p className="text-white/60 text-sm">Arama kriterlerinizi değiştirmeyi deneyin</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((product) => (
                    <ProductListItem key={product.id} product={product} />
                  ))}
                </div>
              )}
              
              <Pagination />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
      </div>
    </div>}>
      <ProductsPage />
    </Suspense>
  )
}
