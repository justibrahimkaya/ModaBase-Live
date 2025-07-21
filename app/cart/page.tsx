'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartContext'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertTriangle, CheckCircle, Loader2, Package, Truck, Shield, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function CartPage() {
  const { items, getTotal, getCount, removeItem, updateQuantity, clearCart, loading } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const shippingCost = getTotal() > 150 ? 0 : 29.99
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
        <main className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-lg text-gray-600">Sepetiniz yükleniyor...</p>
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
        <main className="min-h-screen bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
              <p className="text-lg text-gray-600 mb-8">
                Henüz sepetinize ürün eklemediniz. Alışverişe başlayın ve favori ürünlerinizi keşfedin!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/" className="btn-primary">
                  Alışverişe Başla
                </a>
                <a href="/products" className="btn-secondary">
                  Tüm Ürünleri Gör
                </a>
              </div>
              
              {/* Önerilen Ürünler */}
              <div className="mt-16">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Önerilen Ürünler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Mock önerilen ürünler */}
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                      <h3 className="font-medium text-gray-900 mb-2">Önerilen Ürün {i}</h3>
                      <p className="text-gray-500 text-sm mb-2">₺99.99</p>
                      <button className="w-full btn-primary text-sm py-2">
                        Sepete Ekle
                      </button>
                    </div>
                  ))}
                </div>
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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><a href="/" className="hover:text-primary-600">Ana Sayfa</a></li>
              <li>/</li>
              <li className="text-gray-900">Sepetim</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Sepetim ({getCount()} ürün)</h1>
                  <button
                    onClick={() => { 
                      if (confirm('Sepetinizi temizlemek istediğinizden emin misiniz?')) {
                        clearCart()
                      }
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 rounded px-3 py-2 transition"
                  >
                    Sepeti Temizle
                  </button>
                </div>
                
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const isUpdating = updatingItems.has(item.product.id)
                    const isRemoving = removingItems.has(item.product.id)
                    const stockStatus = item.quantity >= 10 ? 'low' : 'ok' // Mock stok kontrolü
                    
                    return (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-lg">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 640px) 80px, 96px"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 text-sm lg:text-base">{item.product.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.size && `Beden: ${item.size}`}
                            {item.color && item.size && ' • '}
                            {item.color && `Renk: ${item.color}`}
                          </p>
                          
                          {/* Stock Warning */}
                          {stockStatus === 'low' && (
                            <div className="flex items-center gap-1 text-orange-600 text-xs mb-2">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stok kritik seviyede</span>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateQuantity(
                                  item.product.id,
                                  Math.max(1, item.quantity - 1),
                                  {
                                    ...(item.size ? { size: item.size } : {}),
                                    ...(item.color ? { color: item.color } : {})
                                  }
                                )}
                                disabled={isUpdating || isRemoving}
                                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Minus className="h-4 w-4" />
                                )}
                              </button>
                              <span className="w-12 text-center font-medium text-sm lg:text-base">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                  {
                                    ...(item.size ? { size: item.size } : {}),
                                    ...(item.color ? { color: item.color } : {})
                                  }
                                )}
                                disabled={isUpdating || isRemoving || item.quantity >= 10}
                                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            
                            {/* Price and Remove */}
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <span className="font-bold text-gray-900 text-sm lg:text-base">
                                  ₺{(item.product.price * item.quantity).toFixed(2)}
                                </span>
                                {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ₺{(item.product.originalPrice * item.quantity).toFixed(2)}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveItem(
                                  item.product.id,
                                  {
                                    ...(item.size ? { size: item.size } : {}),
                                    ...(item.color ? { color: item.color } : {})
                                  }
                                )}
                                disabled={isRemoving}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {isRemoving ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
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
                      ₺150 üzeri alışverişlerde ücretsiz kargo
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
