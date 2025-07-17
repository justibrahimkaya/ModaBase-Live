'use client'

import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import ProductOptions from './ProductOptions'
import AddToCart from './AddToCart'
import ProductDetails from './ProductDetails'
import DeliveryInfo from './DeliveryInfo'
import ModernReviews from './ModernReviews'
import SimilarProducts from './SimilarProducts'
import SocialShare from './SocialShare'
import StockNotification from './StockNotification'

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
  averageRating: number
  similarProducts: Product[]
}

export default function ProductDetail({ product, averageRating, similarProducts }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Ürün resimlerini parse et
  const images = JSON.parse(product.images || '[]')

  return (
    <>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-primary-600">Ana Sayfa</a></li>
            <li>/</li>
            <li><a href={`/category/${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</a></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Gallery */}
          <ProductGallery images={images} />
          
          {/* Product Info */}
          <div className="space-y-8">
            <ProductInfo 
              product={product}
              averageRating={averageRating}
            />
            <ProductOptions 
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              quantity={quantity}
              setQuantity={setQuantity}
            />
            <AddToCart 
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
            />
            <StockNotification 
              productId={product.id}
              productName={product.name}
              currentStock={product.stock}
            />
            <SocialShare />
          </div>
        </div>

        {/* Additional Sections */}
        <div className="space-y-16">
          <ProductDetails product={product} />
          <DeliveryInfo />
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
            totalReviews: product.reviews.length,
            ratingDistribution: {
              5: product.reviews.filter(r => r.rating === 5).length,
              4: product.reviews.filter(r => r.rating === 4).length,
              3: product.reviews.filter(r => r.rating === 3).length,
              2: product.reviews.filter(r => r.rating === 2).length,
              1: product.reviews.filter(r => r.rating === 1).length
            }
          }}
        />
          <SimilarProducts products={similarProducts} />
        </div>
      </div>

      <Footer />
    </>
  )
}
