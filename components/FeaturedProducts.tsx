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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <div key={product.id} className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
          <a href={`/product/${product.id}`} className="block">
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Floating Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-8 group-hover:translate-x-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    // Add to wishlist functionality
                  }}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                >
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    // Quick view functionality
                  }}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                >
                  <Eye className="w-5 h-5 text-gray-600 hover:text-blue-500" />
                </button>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount && product.discount > 0 && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    <Flame className="w-4 h-4" />
                    -{product.discount}%
                  </div>
                )}
                {product.isNew && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    <Zap className="w-4 h-4" />
                    Yeni
                  </div>
                )}
              </div>

              {/* Quick Add to Cart Button */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    // Add to cart functionality
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Sepete Ekle
                </button>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              {/* Category */}
              {product.category && (
                <div className="mb-2">
                  <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({product.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    ₺{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ₺{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Savings Amount */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ₺{(product.originalPrice - product.price).toFixed(2)} tasarruf
                    </div>
                  </div>
                )}
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}
