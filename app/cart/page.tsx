'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartContext'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertTriangle, CheckCircle, Loader2, Package, Truck, Shield, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function CartPage() {
  const { items, getTotal, getCount, removeItem, updateQuantity, loading, getShippingCost } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const shippingCost = getShippingCost()
  const totalWithShipping = getTotal() + shippingCost - couponDiscount
  const finalTotal = Math.max(0, totalWithShipping)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setIsApplyingCoupon(true)
    setCouponError('')
    setCouponSuccess('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock coupon validation
      if (couponCode.toLowerCase() === 'indirim10') {
        const discount = Math.min(getTotal() * 0.1, 50) // %10 indirim, max 50TL
        setCouponDiscount(discount)
        setCouponSuccess('Kupon kodu başarıyla uygulandı!')
      } else {
        setCouponError('Geçersiz kupon kodu')
        setCouponDiscount(0)
      }
    } catch (error) {
      setCouponError('Kupon kodu uygulanırken hata oluştu')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number, options?: { size?: string; color?: string }) => {
    if (newQuantity < 1) return
    
    // Stok kontrolü (mock data)
    const maxStock = 10 // Gerçek uygulamada API'den gelecek
    if (newQuantity > maxStock) {
      alert(`Bu ürün için maksimum ${maxStock} adet sipariş verebilirsiniz.`)
      return
    }
    
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await updateQuantity(itemId, newQuantity, options)
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: string, options?: { size?: string; color?: string }) => {
    setRemovingItems(prev => new Set(prev).add(itemId))
    try {
      await removeItem(itemId, options)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    window.location.href = '/checkout'
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-600">Sepetiniz yükleniyor...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* ✅ Mobile-Optimized Empty Cart */}
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Sepetiniz Boş
                </h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                  Henüz sepetinizde ürün bulunmuyor. Alışverişe başlamak için ürünlerimizi inceleyin.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
                <a
                  href="/products"
                  className="btn-primary text-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
                >
                  Alışverişe Başla
                </a>
                <a
                  href="/products?discount=true"
                  className="btn-secondary text-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base"
                >
                  Fırsatları Gör
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* ✅ Mobile-First Cart Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 rounded-lg hover:bg-white transition-colors lg:hidden"
                  aria-label="Geri dön"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Sepetim
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {getCount()} ürün
                  </p>
                </div>
              </div>
              
              {/* Mobile Continue Shopping */}
              <a
                href="/products"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Alışverişe Devam
              </a>
            </div>

            {/* Mobile Continue Shopping */}
            <a
              href="/products"
              className="sm:hidden inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Alışverişe Devam
            </a>
          </div>

          {/* ✅ Mobile-Optimized Cart Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items - Mobile Full Width */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size || 'default'}-${item.color || 'default'}`} 
                     className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* ✅ Mobile-First Cart Item Layout */}
                  <div className="flex space-x-4">
                    {/* Product Image - Mobile Optimized */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details - Mobile Responsive */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between h-full">
                        {/* Product Info */}
                        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {item.product.name}
                          </h3>
                          
                          {/* Variants - Mobile Compact */}
                          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                            {item.size && (
                              <span className="bg-gray-100 px-2 py-1 rounded-md">
                                Beden: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-gray-100 px-2 py-1 rounded-md">
                                Renk: {item.color}
                              </span>
                            )}
                          </div>

                          {/* Price - Mobile Optimized */}
                          <div className="flex items-center space-x-2">
                            <span className="text-lg sm:text-xl font-bold text-purple-600">
                              ₺{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              (₺{item.product.price.toLocaleString()} × {item.quantity})
                            </span>
                          </div>
                        </div>

                        {/* Quantity and Actions - Mobile Stack */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between mt-3 sm:mt-0 sm:ml-4">
                          {/* Quantity Controls - Mobile Friendly */}
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, {
                                ...(item.size ? { size: item.size } : {}),
                                ...(item.color ? { color: item.color } : {})
                              })}
                              disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                              aria-label="Azalt"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            
                            <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-medium">
                              {updatingItems.has(item.id) ? '...' : item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, {
                                ...(item.size ? { size: item.size } : {}),
                                ...(item.color ? { color: item.color } : {})
                              })}
                              disabled={updatingItems.has(item.id)}
                              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                              aria-label="Artır"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>

                          {/* Remove Button - Mobile Friendly */}
                          <button
                            onClick={() => handleRemoveItem(item.id, {
                              ...(item.size ? { size: item.size } : {}),
                              ...(item.color ? { color: item.color } : {})
                            })}
                            disabled={removingItems.has(item.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                            aria-label="Ürünü kaldır"
                          >
                            {removingItems.has(item.id) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 sticky top-24">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
                
                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İndirim Kuponu
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Kupon kodunuz"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm whitespace-nowrap"
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Uygula'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <div className="text-red-600 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {couponError}
                      </div>
                    )}
                    {couponSuccess && (
                      <div className="text-green-600 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {couponSuccess}
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="text-green-600 text-xs">
                        {couponDiscount.toFixed(2)} TL indirim uygulandı
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam</span>
                    <span>₺{getTotal().toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>İndirim</span>
                      <span>-₺{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Kargo</span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'Ücretsiz' : `₺${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="text-xs text-gray-500">
                      ₺2500 üzeri alışverişlerde ücretsiz kargo
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Toplam</span>
                      <span>₺{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-lg py-3 mb-3"
                >
                  Satın Al
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => window.history.back()}
                  className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Alışverişe Devam Et</span>
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span>Güvenli Ödeme</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-3 h-3 text-blue-500" />
                      <span>Hızlı Teslimat</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3 text-orange-500" />
                      <span>30 Gün İade</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3 text-purple-500" />
                      <span>Kolay Değişim</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
