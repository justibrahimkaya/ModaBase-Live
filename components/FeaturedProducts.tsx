'use client'

import { Heart, Star } from 'lucide-react'

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <div key={product.id} className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 touch-manipulation">
          <a href={`/product/${product.id}`} className="block">
            {/* Image Container - Fixed for display */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-gray-500 text-sm">Resim Yüklenemedi</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500 text-sm">Resim Yok</span>
                </div>
              )}
              
              {/* Simple heart button only */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Add to wishlist functionality
                }}
                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-all duration-200"
                aria-label="Favorilere ekle"
              >
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>

              {/* Simple Discount Badge */}
              {product.discount && product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  -{product.discount}%
                </div>
              )}
            </div>

            {/* Product Info - Compact */}
            <div className="p-3">
              {/* Product Name */}
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-gray-900">
                  ₺{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₺{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Rating - Compact */}
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}
