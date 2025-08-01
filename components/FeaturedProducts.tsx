'use client'

import { Heart, ShoppingCart, Star, Zap, Flame, Eye } from 'lucide-react'

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  isNew?: boolean;
  discount?: number;
  category?: {
    name: string;
    slug: string;
  };
}

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {products.map((product) => (
        <div key={product.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 touch-manipulation">
          <a href={`/product/${product.id}`} className="block">
            {/* Image Container - Mobile Optimized */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              
              {/* Floating Action Buttons - Mobile Touch Friendly */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-8 sm:group-hover:translate-x-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Add to wishlist functionality
                  }}
                  className="p-2.5 sm:p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 touch-manipulation"
                  aria-label="Favorilere ekle"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-red-500" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Quick view functionality
                  }}
                  className="p-2.5 sm:p-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 touch-manipulation"
                  aria-label="Hızlı görüntüle"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-blue-500" />
                </button>
              </div>

              {/* Badges - Mobile Optimized */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                {product.discount && product.discount > 0 && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>-{product.discount}%</span>
                  </div>
                )}
                {product.isNew && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Yeni</span>
                  </div>
                )}
              </div>

              {/* Quick Add to Cart Button - Mobile Always Visible */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-4 sm:group-hover:translate-y-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Add to cart functionality
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
                  aria-label="Sepete ekle"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Sepete Ekle</span>
                </button>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Product Info - Mobile Optimized */}
            <div className="p-4 sm:p-6">
              {/* Category */}
              {product.category && (
                <div className="mb-2">
                  <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Product Name - Mobile Friendly */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
                {product.name}
              </h3>

              {/* Rating - Mobile Compact */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  ({product.reviews})
                </span>
              </div>

              {/* Price - Mobile Optimized */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold text-purple-600">
                    ₺{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₺{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Quick Buy - Mobile Only */}
                <div className="sm:hidden">
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Quick buy functionality
                    }}
                    className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 touch-manipulation"
                    aria-label="Hızlı satın al"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}
