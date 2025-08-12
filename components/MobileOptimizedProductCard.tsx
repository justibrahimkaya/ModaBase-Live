'use client'

import { useState } from 'react'
import Link from 'next/link'
import OptimizedImage from './OptimizedImage'
import { Star, Heart } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  images: string[]
  discount?: number
  rating?: number
  reviewCount?: number
}

interface MobileOptimizedProductCardProps {
  product: Product
  priority?: boolean
}

export default function MobileOptimizedProductCard({ 
  product, 
  priority = false 
}: MobileOptimizedProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  
  const firstImage = product.images?.[0] || '/default-product.svg'
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0

  return (
    <Link 
      href={`/product/${product.slug || product.id}`}
      className="block group"
      prefetch={false}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image Container with fixed aspect ratio */}
        <div className="relative aspect-product bg-gray-100">
          <OptimizedImage
            src={firstImage}
            alt={product.name}
            width={400}
            height={533}
            priority={priority}
            className="w-full h-full"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="absolute top-2 right-2 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 z-10"
            aria-label={isLiked ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md">
                -%{discountPercentage}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ₺{product.price.toLocaleString('tr-TR')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ₺{product.originalPrice.toLocaleString('tr-TR')}
              </span>
            )}
          </div>

          {/* Rating */}
          {(product.rating || product.reviewCount) && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 4.5)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
