'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bell, Package, Clock, Check, Trash2, ExternalLink } from 'lucide-react'

interface StockNotification {
  id: string
  productId: string
  isActive: boolean
  notifiedAt: string | null
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: string
    stock: number
    minStockLevel: number
    category: {
      name: string
    }
  }
}

export default function StockNotificationsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<StockNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchNotifications()
    }
  }, [status])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/stock-notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (notificationId: string, productId: string) => {
    setDeletingId(notificationId)
    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setDeletingId(null)
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

  const getStatusBadge = (notification: StockNotification) => {
    if (notification.notifiedAt) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Check className="w-4 h-4 mr-1" />
          Bildirim Gönderildi
        </span>
      )
    }
    if (notification.product.stock > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Package className="w-4 h-4 mr-1" />
          Stokta Var
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
        <Clock className="w-4 h-4 mr-1" />
        Bekliyor
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stok Bildirimlerim</h1>
              <p className="text-gray-600">Stokta olmayan ürünler için bildirim taleplerini yönetin</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Bildirim</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => !n.notifiedAt && n.product.stock === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gönderilen</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.notifiedAt).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz stok bildirimi yok</h3>
            <p className="text-gray-600 mb-6">Stokta olmayan ürünler için bildirim oluşturun</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Ürünleri Keşfet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const images = JSON.parse(notification.product.images || '[]')
              const mainImage = images[0] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'
              
              return (
                <div key={notification.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={mainImage}
                        alt={notification.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {notification.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.product.category.name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>₺{notification.product.price.toFixed(2)}</span>
                            <span>•</span>
                            <span>Stok: {notification.product.stock}</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(notification)}
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Oluşturulma:</span>{' '}
                          {formatDate(notification.createdAt)}
                          {notification.notifiedAt && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">Bildirim:</span>{' '}
                              {formatDate(notification.notifiedAt)}
                            </>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/product/${notification.product.id}`)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Görüntüle</span>
                          </button>
                          
                          {notification.isActive && (
                            <button
                              onClick={() => handleDelete(notification.id, notification.productId)}
                              disabled={deletingId === notification.id}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{deletingId === notification.id ? 'Siliniyor...' : 'Sil'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
 