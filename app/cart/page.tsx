'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartContext'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CartPage() {
  const { items, getTotal, getCount, removeItem, updateQuantity, clearCart } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const shippingCost = getTotal() > 150 ? 0 : 29.99
  const totalWithShipping = getTotal() + shippingCost

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return
    
    setIsApplyingCoupon(true)
    // Simulate API call
    setTimeout(() => {
      setIsApplyingCoupon(false)
      alert('Kupon kodu geçersiz')
    }, 1000)
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    // Redirect to checkout page
    window.location.href = '/checkout'
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
              <div className="space-x-4">
                <a href="/" className="btn-primary">
                  Alışverişe Başla
                </a>
                <a href="/product/1" className="btn-secondary">
                  Örnek Ürünü İncele
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Sepetim ({getCount()} ürün)</h1>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.size && `Beden: ${item.size}`}
                          {item.color && item.size && ' • '}
                          {item.color && `Renk: ${item.color}`}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(
                                item.product.id,
                                Math.max(1, item.quantity - 1),
                                {
                                  ...(item.size ? { size: item.size } : {}),
                                  ...(item.color ? { color: item.color } : {})
                                }
                              )}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                {
                                  ...(item.size ? { size: item.size } : {}),
                                  ...(item.color ? { color: item.color } : {})
                                }
                              )}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className="font-bold text-gray-900">
                                ₺{(item.product.price * item.quantity).toFixed(2)}
                              </span>
                              {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                <div className="text-sm text-gray-500 line-through">
                                  ₺{(item.product.originalPrice * item.quantity).toFixed(2)}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(
                                item.product.id,
                                {
                                  ...(item.size ? { size: item.size } : {}),
                                  ...(item.color ? { color: item.color } : {})
                                }
                              )}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => { clearCart(); alert('Sepetiniz temizlendi!'); }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 rounded px-4 py-2 transition"
                  >
                    Sepeti Temizle
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
                
                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İndirim Kuponu
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Kupon kodunuz"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isApplyingCoupon ? 'Uygulanıyor...' : 'Uygula'}
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam</span>
                    <span>₺{getTotal().toFixed(2)}</span>
                  </div>
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
                      <span>₺{totalWithShipping.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-lg py-3"
                >
                  Satın Al
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => window.history.back()}
                  className="w-full mt-3 flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Alışverişe Devam Et</span>
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
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
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
