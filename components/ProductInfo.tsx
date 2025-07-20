'use client'

import { Star, Shield, Truck, RefreshCw } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: {
    name: string
  }
  _count?: {
    reviews: number
  }
}

interface ProductInfoProps {
  product: Product
  averageRating: number
}

export default function ProductInfo({ product, averageRating }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Brand & Title */}
      <div>
        <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>
        <p className="text-gray-600">
          {product.description}
        </p>
      </div>

      {/* Rating & Reviews */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">{averageRating.toFixed(1)}</span>
        </div>
        <span className="text-sm text-gray-500">({product._count?.reviews || 0} değerlendirme)</span>
        <a href="#reviews" className="text-sm text-primary-600 hover:text-primary-700">
          Tüm değerlendirmeleri gör
        </a>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold text-gray-900">₺{product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-xl text-gray-500 line-through">₺{product.originalPrice.toFixed(2)}</span>
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Taksitli ödeme seçenekleri mevcuttur
        </p>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center space-x-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm text-gray-600">Güvenli Ödeme</span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Ücretsiz Kargo</span>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-orange-600" />
          <span className="text-sm text-gray-600">30 Gün İade</span>
        </div>
      </div>

      {/* Product Highlights */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Ürün Özellikleri</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
            %100 Pamuklu kumaş
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
            Rahat kesim tasarım
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
            Çiçekli desen baskı
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
            Makinede yıkama uygun
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
            Türkiye'de üretilmiştir
          </li>
        </ul>
      </div>

      {/* Stock Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Stokta mevcut
          </span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Hızlı teslimat için siparişinizi hemen verin
        </p>
      </div>
    </div>
  )
}
