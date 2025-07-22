'use client'

import { useState, useEffect } from 'react'
import { Package, Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle, X, AlertTriangle, RefreshCw, Shield, Star, Sparkles, ChevronDown, ChevronUp, ShoppingBag, Gift } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  size?: string
  color?: string
  product: {
    id: string
    name: string
    images: string
  }
}

interface Order {
  id: string
  status: string
  total: number
  discount?: number
  shippingCost?: number
  shippingMethod?: string
  paymentMethod?: string
  note?: string
  createdAt: string
  updatedAt: string
  canCancel?: boolean
  canReturn?: boolean
  canExchange?: boolean
  cancelReason?: string
  returnReason?: string
  exchangeReason?: string
  cancelRequestedAt?: string
  returnRequestedAt?: string
  exchangeRequestedAt?: string
  items: OrderItem[]
  address?: {
    id: string
    title: string
    name: string
    surname: string
    city: string
    district: string
    address: string
  }
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { 
        text: 'Beklemede', 
        color: 'text-yellow-800', 
        bg: 'bg-yellow-100 border border-yellow-200', 
        icon: Clock,
        gradient: 'from-yellow-500 to-orange-600'
      }
    case 'AWAITING_PAYMENT':
      return { 
        text: 'Ödeme Bekleniyor', 
        color: 'text-orange-800', 
        bg: 'bg-orange-100 border border-orange-200', 
        icon: Clock,
        gradient: 'from-orange-500 to-red-600'
      }
    case 'PAID':
      return { 
        text: 'Ödendi', 
        color: 'text-green-800', 
        bg: 'bg-green-100 border border-green-200', 
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-600'
      }
    case 'CONFIRMED':
      return { 
        text: 'Onaylandı', 
        color: 'text-blue-800', 
        bg: 'bg-blue-100 border border-blue-200', 
        icon: CheckCircle,
        gradient: 'from-blue-500 to-purple-600'
      }
    case 'SHIPPED':
      return { 
        text: 'Kargoda', 
        color: 'text-purple-800', 
        bg: 'bg-purple-100 border border-purple-200', 
        icon: Truck,
        gradient: 'from-purple-500 to-pink-600'
      }
    case 'DELIVERED':
      return { 
        text: 'Teslim Edildi', 
        color: 'text-green-800', 
        bg: 'bg-green-100 border border-green-200', 
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-600'
      }
    case 'FAILED':
      return { 
        text: 'Ödeme Başarısız', 
        color: 'text-red-800', 
        bg: 'bg-red-100 border border-red-200', 
        icon: XCircle,
        gradient: 'from-red-500 to-pink-600'
      }
    case 'CANCELLED':
      return { 
        text: 'İptal Edildi', 
        color: 'text-red-800', 
        bg: 'bg-red-100 border border-red-200', 
        icon: XCircle,
        gradient: 'from-red-500 to-pink-600'
      }
    default:
      return { 
        text: 'Bilinmiyor', 
        color: 'text-gray-800', 
        bg: 'bg-gray-100 border border-gray-200', 
        icon: AlertTriangle,
        gradient: 'from-gray-500 to-slate-600'
      }
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [exchangeReason, setExchangeReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Siparişler alınamadı')
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async () => {
    if (!selectedOrder || !cancelReason.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      })

      if (!response.ok) {
        throw new Error('İptal talebi gönderilemedi')
      }

      await fetchOrders()
      setShowCancelModal(false)
      setCancelReason('')
      setSelectedOrder(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReturnRequest = async () => {
    if (!selectedOrder || !returnReason.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason })
      })

      if (!response.ok) {
        throw new Error('İade talebi gönderilemedi')
      }

      await fetchOrders()
      setShowReturnModal(false)
      setReturnReason('')
      setSelectedOrder(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExchangeRequest = async () => {
    if (!selectedOrder || !exchangeReason.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: exchangeReason })
      })

      if (!response.ok) {
        throw new Error('Değişim talebi gönderilemedi')
      }

      await fetchOrders()
      setShowExchangeModal(false)
      setExchangeReason('')
      setSelectedOrder(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium">Siparişler yükleniyor...</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-25 animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse delay-3000"></div>
        </div>

        <div className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
                <li>/</li>
                <li><a href="/profile" className="hover:text-blue-600 transition-colors">Profil</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Sipariş Geçmişi</li>
              </ol>
            </nav>

            {/* Premium Feature Badge */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <Package className="w-5 h-5 mr-2" />
                <span>Premium Sipariş Takibi</span>
                <div className="ml-2 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-300 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    Sipariş Geçmişi
                  </h1>
                  <p className="text-gray-600">Tüm siparişlerinizi takip edin ve yönetin</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-500">Güvenli Takip Sistemi</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-200 p-6 animate-shake">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Hata Oluştu</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                const isExpanded = expandedOrders.has(order.id)

                return (
                  <div
                    key={order.id}
                    className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${statusInfo.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Sipariş #{order.id.slice(-8)}
                          </h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm font-semibold text-gray-900">
                              <span>•</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-4 py-2 rounded-xl ${statusInfo.bg} flex items-center space-x-2 shadow-sm`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-semibold ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        
                        {/* Durum Açıklaması */}
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            {order.status === 'PENDING' && '⏳ Siparişiniz onay bekliyor. Ödeme onaylandıktan sonra hazırlanmaya başlanacak.'}
                            {order.status === 'AWAITING_PAYMENT' && '💰 Havale ödemesi bekleniyor. Lütfen belirtilen hesaba ödeme yapın ve dekont gönderin.'}
                            {order.status === 'PAID' && '✅ Ödemeniz alındı. Siparişiniz hazırlanmaya başlanacak.'}
                            {order.status === 'CONFIRMED' && '✅ Siparişiniz onaylandı. Hazırlanmaya başlanacak.'}
                            {order.status === 'SHIPPED' && '🚚 Siparişiniz kargoya verildi. Takip numarası ile takip edebilirsiniz.'}
                            {order.status === 'DELIVERED' && '🎉 Siparişiniz başarıyla teslim edildi. İyi alışverişler!'}
                            {order.status === 'FAILED' && '❌ Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.'}
                            {order.status === 'CANCELLED' && '🚫 Siparişiniz iptal edildi. Detaylar için müşteri hizmetleri ile iletişime geçin.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                            <span>Sipariş Kalemleri ({order.items.length} ürün)</span>
                          </h4>
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <span className="text-sm font-medium">
                              {isExpanded ? 'Gizle' : 'Detayları Gör'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Items Grid */}
                        <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-2'}`}>
                          {(isExpanded ? order.items : order.items.slice(0, 3)).map((item) => {
                            const images = JSON.parse(item.product.images || '[]')
                            const image = images[0] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'
                            
                            return (
                              <div key={item.id} className={`bg-white/80 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 ${isExpanded ? 'flex items-center space-x-4' : 'flex flex-col items-center text-center'}`}>
                                <img
                                  src={image}
                                  alt={item.product.name}
                                  className={`object-cover rounded-lg ${isExpanded ? 'w-16 h-16' : 'w-full h-20'}`}
                                />
                                <div className={`${isExpanded ? 'flex-1' : 'mt-2'}`}>
                                  <h5 className={`font-medium text-gray-900 ${isExpanded ? 'text-base' : 'text-sm truncate'}`}>
                                    {item.product.name}
                                  </h5>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                      {item.quantity} adet
                                      {item.size && ` • ${item.size}`}
                                      {item.color && ` • ${item.color}`}
                                    </p>
                                    {isExpanded && (
                                      <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          
                          {!isExpanded && order.items.length > 3 && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
                              <Gift className="w-8 h-8 text-gray-400 mb-1" />
                              <span className="text-sm font-medium text-gray-600">
                                +{order.items.length - 3} daha
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Details - Expanded */}
                    {isExpanded && (
                      <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Package className="w-5 h-5 text-green-600" />
                          <span>Sipariş Detayları</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-700">Toplam Tutar</span>
                            </div>
                            <p className="text-gray-900 font-bold text-lg">{formatPrice(order.total)}</p>
                          </div>
                          
                          {order.address && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Teslimat Adresi</span>
                              </div>
                              <p className="text-gray-900 font-semibold">{order.address.title}</p>
                              <p className="text-sm text-gray-600">{order.address.name} {order.address.surname}</p>
                            </div>
                          )}
                          
                          {order.shippingMethod && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <Truck className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Kargo</span>
                              </div>
                              <p className="text-gray-900 font-semibold">{order.shippingMethod}</p>
                            </div>
                          )}
                          
                          {order.paymentMethod && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <CreditCard className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-gray-700">Ödeme Yöntemi</span>
                              </div>
                              <p className="text-gray-900 font-semibold">{order.paymentMethod}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {order.shippingMethod && (
                          <div className="flex items-center space-x-1">
                            <Truck className="w-4 h-4" />
                            <span>{order.shippingMethod}</span>
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-4 h-4" />
                            <span>{order.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* İptal Butonu */}
                        {order.canCancel && ['PENDING', 'CONFIRMED'].includes(order.status) && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowCancelModal(true)
                            }}
                            className="group relative overflow-hidden bg-white border-2 border-red-300 text-red-600 font-semibold py-2 px-4 rounded-xl hover:bg-red-50 hover:border-red-400 focus:ring-4 focus:ring-red-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4" />
                              <span>İptal Et</span>
                            </div>
                          </button>
                        )}
                        
                        {/* İade Butonu */}
                        {order.canReturn && order.status === 'DELIVERED' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowReturnModal(true)
                            }}
                            className="group relative overflow-hidden bg-white border-2 border-blue-300 text-blue-600 font-semibold py-2 px-4 rounded-xl hover:bg-blue-50 hover:border-blue-400 focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="w-4 h-4" />
                              <span>İade Et</span>
                            </div>
                          </button>
                        )}
                        
                        {/* Değişim Butonu */}
                        {order.canExchange && order.status === 'DELIVERED' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowExchangeModal(true)
                            }}
                            className="group relative overflow-hidden bg-white border-2 border-purple-300 text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 hover:border-purple-400 focus:ring-4 focus:ring-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center space-x-2">
                              <RefreshCw className="w-4 h-4" />
                              <span>Değişim</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.note && (
                      <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Sipariş Notu:</p>
                            <p className="text-sm text-yellow-700 mt-1">{order.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-12 max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz siparişiniz yok</h3>
                  <p className="text-gray-600 mb-8">İlk siparişinizi vererek alışverişe başlayın ve premium deneyimin keyfini çıkarın.</p>
                  <a
                    href="/"
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] inline-block"
                  >
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-5 h-5" />
                      <span>Alışverişe Başlayın</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* İptal Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md transform animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sipariş İptal Talebi</h3>
              </div>
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Sipariş #{selectedOrder.id.slice(-8)}</strong> için iptal talebi oluşturuyorsunuz.
              </p>
            </div>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="İptal nedeninizi detaylı bir şekilde belirtin..."
              className="w-full p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
              rows={4}
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                İptal
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={isSubmitting || !cancelReason.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* İade Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md transform animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sipariş İade Talebi</h3>
              </div>
              <button 
                onClick={() => setShowReturnModal(false)} 
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Sipariş #{selectedOrder.id.slice(-8)}</strong> için iade talebi oluşturuyorsunuz.
              </p>
            </div>
            
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="İade nedeninizi ve ürün durumunu detaylı bir şekilde belirtin..."
              className="w-full p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              rows={4}
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                İptal
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={isSubmitting || !returnReason.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Değişim Modal */}
      {showExchangeModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md transform animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sipariş Değişim Talebi</h3>
              </div>
              <button 
                onClick={() => setShowExchangeModal(false)} 
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Sipariş #{selectedOrder.id.slice(-8)}</strong> için değişim talebi oluşturuyorsunuz.
              </p>
            </div>
            
            <textarea
              value={exchangeReason}
              onChange={(e) => setExchangeReason(e.target.value)}
              placeholder="Değişim nedeninizi ve istediğiniz yeni ürün bilgilerini detaylı bir şekilde belirtin..."
              className="w-full p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              rows={4}
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExchangeModal(false)}
                className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                İptal
              </button>
              <button
                onClick={handleExchangeRequest}
                disabled={isSubmitting || !exchangeReason.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        @keyframes slideIn {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
