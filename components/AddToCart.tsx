'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Heart, CreditCard, Check, Clock } from 'lucide-react'
import { useCart } from './CartContext'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string
}

interface AddToCartProps {
  product: Product
  selectedSize: string
  selectedColor: string
  quantity: number
}

export default function AddToCart({ product, selectedSize, selectedColor, quantity }: AddToCartProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isUpdatingFavorites, setIsUpdatingFavorites] = useState(false)
  const [isUpdatingWishlist, setIsUpdatingWishlist] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const { addItem } = useCart()

  // Ürün resimlerini parse et
  const images = JSON.parse(product.images || '[]')
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'

  // Sayfa yüklendiğinde favori ve wishlist durumunu kontrol et
  useEffect(() => {
    checkFavoriteStatus()
    checkWishlistStatus()
  }, [product.id])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const favorites = await response.json()
        const isFavorite = favorites.some((fav: any) => fav.productId === product.id)
        setIsInFavorites(isFavorite)
      }
    } catch (error) {
      console.error('Favori durumu kontrol edilemedi:', error)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const wishlist = await response.json()
        const isInWishlist = wishlist.some((item: any) => item.productId === product.id)
        setIsInWishlist(isInWishlist)
      }
    } catch (error) {
      console.error('Wishlist durumu kontrol edilemedi:', error)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Lütfen beden ve renk seçiniz')
      return
    }

    setIsAddingToCart(true)
    
    // Add to cart
    const cartItem = {
      id: product.id,
      product: {
        id: product.id,
        name: product.name,
        image: mainImage,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        stock: 10 // Mock stok - gerçek uygulamada API'den gelecek
      },
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    }
    
    try {
      const result = await addItem(cartItem)
      if (result.success) {
        setIsAddedToCart(true)
        setShowToast(true)
        
        // Reset after 3 seconds
        setTimeout(() => {
          setIsAddedToCart(false)
          setShowToast(false)
        }, 3000)
      } else {
        alert(result.error || 'Ürün sepete eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      alert('Ürün sepete eklenirken hata oluştu')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    setIsUpdatingWishlist(true)
    try {
      if (isInWishlist) {
        // Wishlist'ten çıkar
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })
        if (response.ok) {
          setIsInWishlist(false)
        }
      } else {
        // Wishlist'e ekle
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })
        if (response.ok) {
          setIsInWishlist(true)
        }
      }
    } catch (error) {
      console.error('Wishlist işlemi başarısız:', error)
      alert('Daha sonra al işlemi başarısız oldu. Lütfen tekrar deneyin.')
    } finally {
      setIsUpdatingWishlist(false)
    }
  }

  const handleAddToFavorites = async () => {
    setIsUpdatingFavorites(true)
    try {
      if (isInFavorites) {
        // Favorilerden çıkar
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })
        if (response.ok) {
          setIsInFavorites(false)
        }
      } else {
        // Favorilere ekle
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })
        if (response.ok) {
          setIsInFavorites(true)
        }
      }
    } catch (error) {
      console.error('Favori işlemi başarısız:', error)
      alert('Favori işlemi başarısız oldu. Lütfen tekrar deneyin.')
    } finally {
      setIsUpdatingFavorites(false)
    }
  }

  const handleQuickBuy = () => {
    if (!selectedSize || !selectedColor) {
      alert('Lütfen beden ve renk seçiniz')
      return
    }
    
    // Redirect to checkout
    window.location.href = '/checkout'
  }

  return (
    <div className="space-y-4">
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart || isAddedToCart}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
          isAddedToCart
            ? 'bg-green-600 text-white'
            : 'bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50'
        }`}
      >
        {isAddingToCart ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Sepete Ekleniyor...</span>
          </>
        ) : isAddedToCart ? (
          <>
            <Check className="h-5 w-5" />
            <span>Sepete Eklendi!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>Sepete Ekle</span>
          </>
        )}
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="h-5 w-5" /> Ürün sepete eklendi!
        </div>
      )}

      {/* Quick Buy Button */}
      <button
        onClick={handleQuickBuy}
        className="w-full py-4 px-6 rounded-lg font-semibold text-lg bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <CreditCard className="h-5 w-5" />
        <span>Hızlı Satın Al</span>
      </button>

      {/* Wishlist Button */}
      <button
        onClick={handleAddToWishlist}
        disabled={isUpdatingWishlist}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
          isInWishlist
            ? 'bg-blue-50 text-blue-600 border border-blue-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        } ${isUpdatingWishlist ? 'opacity-50' : ''}`}
      >
        {isUpdatingWishlist ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        ) : (
          <Clock className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
        )}
        <span>
          {isUpdatingWishlist 
            ? 'İşleniyor...' 
            : isInWishlist 
              ? 'Daha Sonra Al Listesinden Çıkar' 
              : 'Daha Sonra Al'
          }
        </span>
      </button>

      {/* Favorites Button */}
      <button
        onClick={handleAddToFavorites}
        disabled={isUpdatingFavorites}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
          isInFavorites
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        } ${isUpdatingFavorites ? 'opacity-50' : ''}`}
      >
        {isUpdatingFavorites ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        ) : (
          <Heart className={`h-5 w-5 ${isInFavorites ? 'fill-current' : ''}`} />
        )}
        <span>
          {isUpdatingFavorites 
            ? 'İşleniyor...' 
            : isInFavorites 
              ? 'Favorilerden Çıkar' 
              : 'Favorilere Ekle'
          }
        </span>
      </button>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Toplam Fiyat:</span>
          <span className="font-semibold text-gray-900">₺{(product.price * quantity).toFixed(2)}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Güvenli Ödeme</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Hızlı Teslimat</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>30 Gün İade</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Ödeme Seçenekleri</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <input type="radio" name="payment" id="credit" defaultChecked />
            <label htmlFor="credit">Kredi Kartı</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="radio" name="payment" id="installment" />
            <label htmlFor="installment">Taksitli Ödeme</label>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Taksit seçenekleri için ödeme sayfasında detayları görebilirsiniz
        </p>
      </div>
    </div>
  )
}
