'use client'

import { Heart, ShoppingCart, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string
  category: {
    name: string
  }
  _count?: {
    reviews: number
  }
}

interface SimilarProductsProps {
  products: Product[]
}

export default function SimilarProducts({ products }: SimilarProductsProps) {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return null
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bu ürünü beğendiyseniz
        </h2>
        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
          Tümünü Gör
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          // Ürün resimlerini parse et
          const images = JSON.parse(product.images || '[]')
          const mainImage = images[0] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'
          
          // İndirim hesapla
          const discount = product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0

          return (
            <div key={product.id} className="group">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    %{discount} İndirim
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors mb-2">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                  <button className="bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition-colors">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < 4 // Varsayılan rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product._count?.reviews || 0})</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">₺{product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₺{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <button className="btn-primary">
          Daha Fazla Benzer Ürün Gör
        </button>
      </div>
    </section>
  )
}
