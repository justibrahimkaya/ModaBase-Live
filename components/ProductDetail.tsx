'use client'

import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import ProductGallery from './ProductGallery'
import ProductOptions from './ProductOptions'
import AddToCart from './AddToCart'
import ProductDetails from './ProductDetails'
import DeliveryInfo from './DeliveryInfo'
import ModernReviews from './ModernReviews'
import SimilarProducts from './SimilarProducts'
import SocialShare from './SocialShare'
import StockNotification from './StockNotification'
import WhatsAppButton from './WhatsAppButton'

interface ProductVariant {
  id: string
  productId: string
  size: string | null
  color: string | null
  colorCode: string | null
  stock: number
  price: number | null
  sku: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: string
  stock: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    user: {
      name: string | null
      surname: string | null
    }
  }>
  _count?: {
    reviews: number
  }
}

interface ProductDetailProps {
  product: Product
  variants: ProductVariant[]
  averageRating: number
  similarProducts: Product[]
}

export default function ProductDetail({ product, variants, averageRating, similarProducts }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Ürün resimlerini parse et
  const images = JSON.parse(product.images || '[]')

  return (
    <>
      <Header />
      
      {/* ✅ Mobile-First Product Detail Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb - Mobile Optimized */}
        <nav className="mb-4 sm:mb-6 lg:mb-8">
          <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto">
            <li><a href="/" className="hover:text-purple-600 transition-colors whitespace-nowrap">Ana Sayfa</a></li>
            <li className="text-gray-300">/</li>
            <li><a href={`/category/${product.category.slug}`} className="hover:text-purple-600 transition-colors whitespace-nowrap truncate max-w-20 sm:max-w-none">{product.category.name}</a></li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium truncate max-w-32 sm:max-w-none">{product.name}</li>
          </ol>
        </nav>

        {/* ✅ Mobile-First Product Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          {/* Product Gallery - Mobile Full Width */}
          <div className="order-1">
            <ProductGallery images={images} />
          </div>
          
          {/* Product Info - Mobile Stack Below Gallery */}
          <div className="order-2 space-y-6">
            {/* Product Header - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col space-y-2 sm:space-y-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                {/* Mobile Price and Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl sm:text-3xl font-bold text-purple-600">
                      ₺{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ₺{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product._count?.reviews || 0} değerlendirme)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Options - Mobile Friendly */}
            <div className="space-y-4 sm:space-y-6">
              <ProductOptions 
                variants={variants}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                quantity={quantity}
                setQuantity={setQuantity}
              />
              
              {/* Mobile-Optimized Add to Cart */}
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:border-0 sm:bg-transparent sm:p-0 z-30 lg:z-auto">
                <AddToCart
                  product={product}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  quantity={quantity}
                />
              </div>
            </div>

            {/* Product Features - Mobile Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <div className="text-green-600 font-semibold text-sm">Ücretsiz Kargo</div>
                <div className="text-xs text-green-700">150₺ üzeri</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <div className="text-blue-600 font-semibold text-sm">Hızlı Teslimat</div>
                <div className="text-xs text-blue-700">1-3 iş günü</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                <div className="text-purple-600 font-semibold text-sm">Güvenli Ödeme</div>
                <div className="text-xs text-purple-700">SSL korumalı</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <div className="text-orange-600 font-semibold text-sm">Kolay İade</div>
                <div className="text-xs text-orange-700">14 gün</div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Mobile-Optimized Content Tabs */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Product Details - Mobile Accordion Style */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <ProductDetails product={product} />
          </div>

          {/* Delivery Info - Mobile Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-2xl overflow-hidden">
            <DeliveryInfo />
          </div>

          {/* Reviews - Mobile Optimized */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <ModernReviews
              productId={product.id}
              initialReviews={product.reviews.map(r => ({
                ...r,
                userId: 'user-id',
                images: [],
                isVerifiedPurchase: false,
                isApproved: true,
                helpfulCount: 0,
                unhelpfulCount: 0,
                adminReply: null,
                adminReplyDate: null,
                title: null,
                updatedAt: r.createdAt.toISOString(),
                createdAt: r.createdAt.toISOString(),
                user: {
                  id: 'user-id',
                  name: r.user.name,
                  surname: r.user.surname,
                  image: null
                }
              }))}
              initialStats={{
                averageRating: averageRating,
                totalReviews: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.length : 0,
                ratingDistribution: {
                  5: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.filter(r => r.rating === 5).length : 0,
                  4: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.filter(r => r.rating === 4).length : 0,
                  3: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.filter(r => r.rating === 3).length : 0,
                  2: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.filter(r => r.rating === 2).length : 0,
                  1: (product.reviews && Array.isArray(product.reviews)) ? product.reviews.filter(r => r.rating === 1).length : 0
                }
              }}
            />
          </div>

          {/* Similar Products - Mobile Carousel */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
            <SimilarProducts products={similarProducts} />
          </div>
        </div>

        {/* Social Share - Mobile Fixed Bottom */}
        <div className="fixed bottom-20 right-4 z-50 lg:hidden">
          <SocialShare />
        </div>

        {/* Desktop Social Share */}
        <div className="hidden lg:block mt-8">
          <SocialShare />
        </div>

        {/* Stock Notification - Mobile Modal */}
        <StockNotification 
          productId={product.id}
          productName={product.name}
          currentStock={product.stock}
        />
      </div>

      {/* WhatsApp Button - Mobile Optimized */}
      <WhatsAppButton
        phoneNumber="905362971255"
        message={`Merhaba! ${product.name} ürünü hakkında bilgi almak istiyorum.`}
        variant="floating"
        size="md"
        className="whatsapp-button-mobile whatsapp-floating-mobile"
      />
      
      <Footer />
    </>
  )
}
