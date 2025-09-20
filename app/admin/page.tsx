'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity,
  ArrowUpRight,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Crown,
  FileText,
  Eye,
  FolderOpen,
  Truck,
  Search
} from 'lucide-react'
import SEODashboard from '@/components/SEODashboard'
import SEOEditModal from '@/components/SEOEditModal'
import AIBlogGenerator from '@/components/AIBlogGenerator'

interface DashboardStats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: any[]
  userRole?: string
}

interface QuickAction {
  title: string
  description: string
  href: string
  icon: any
  color: string
  count?: number
  isSEOWidget?: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSEOWidget, setShowSEOWidget] = useState(false)
  const [seoModalOpen, setSeoModalOpen] = useState(false)
  const [seoModalData, setSeoModalData] = useState<{
    pageType: string
    pageId?: string | undefined
    initialData?: any
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error('İstatistikler yüklenemedi')
      }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Toplam Sipariş',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-300',
      change: '+12%',
      changeType: 'up'
    },
    {
      title: 'Toplam Ürün',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-300',
      change: '+8%',
      changeType: 'up'
    },
    ...(stats?.userRole === 'ADMIN' ? [{
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-300',
      change: '+24%',
      changeType: 'up'
    }] : []),
    {
      title: 'Toplam Gelir',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-300',
      change: '+15%',
      changeType: 'up'
    },
    {
      title: 'Bekleyen Siparişler',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-300',
      change: stats?.pendingOrders ? 'Acil!' : 'Temiz',
      changeType: stats?.pendingOrders ? 'alert' : 'neutral'
    },
    {
      title: 'Düşük Stok',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-300',
      change: stats?.lowStockProducts ? 'Dikkat!' : 'İyi',
      changeType: stats?.lowStockProducts ? 'alert' : 'neutral'
    }
  ]

  const quickActions: QuickAction[] = [
    {
      title: 'Siparişleri Yönet',
      description: 'Sipariş durumlarını güncelle ve takip et',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-green-600',
      count: stats?.pendingOrders || 0
    },
    {
      title: 'Ürünleri Yönet',
      description: 'Ürün ekle, düzenle ve stok yönet',
      href: '/admin/products',
      icon: Package,
      color: 'from-purple-500 to-violet-600',
      count: stats?.lowStockProducts || 0
    },
    {
      title: 'Stok Uyarıları',
      description: 'Düşük stok seviyelerini kontrol et',
      href: '/admin/stock-alerts',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-600',
      count: stats?.lowStockProducts || 0
    },
    {
      title: 'SEO Yönetimi',
      description: 'Arama motoru optimizasyonu',
      href: '#',
      icon: Search,
      color: 'from-purple-500 to-indigo-600',
      isSEOWidget: true
    },
    {
      title: 'E-Faturalar',
      description: 'Fatura yönetimi ve raporlama',
      href: '/admin/invoices',
      icon: FileText,
      color: 'from-teal-500 to-emerald-600'
    },
    {
      title: 'Ayarlar',
      description: 'Sistem konfigürasyonu',
      href: '/admin/settings',
      icon: Activity,
      color: 'from-slate-500 to-gray-600'
    },
    // Admin-only actions
    ...(stats?.userRole === 'ADMIN' ? [
      {
        title: 'Kategoriler',
        description: 'Ürün kategorilerini yönet',
        href: '/admin/categories',
        icon: FolderOpen,
        color: 'from-orange-500 to-red-600'
      },
      {
        title: 'Kargo Firmaları',
        description: 'Kargo firma ayarları',
        href: '/admin/shipping',
        icon: Truck,
        color: 'from-cyan-500 to-blue-600'
      },
      {
        title: 'Kullanıcı Yönetimi',
        description: 'Sistem kullanıcılarını yönet',
        href: '/admin/users',
        icon: Users,
        color: 'from-pink-500 to-rose-600'
      }
    ] : [])
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                {stats?.userRole === 'ADMIN' ? (
                  <Crown className="h-6 w-6 text-white" />
                ) : (
                  <ShoppingBag className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {stats?.userRole === 'ADMIN' ? 'ModaBase Dashboard' : 'İşletme Paneli'}
              </h1>
              <p className="text-gray-400 mt-1">
                {stats?.userRole === 'ADMIN' ? 'Admin Paneli - Genel Bakış' : 'İşletme Yönetimi - Genel Bakış'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-400">Son güncellenme</p>
            <p className="text-white text-sm font-medium">{new Date().toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${stats?.userRole === 'ADMIN' ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-6`}>
        {statCards.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} ${stat.borderColor} border rounded-2xl p-6 backdrop-blur-sm hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                {stat.changeType === 'up' && (
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                )}
                {stat.changeType === 'down' && (
                  <div className="flex items-center text-red-400 text-sm">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                )}
                {stat.changeType === 'alert' && (
                  <div className="flex items-center text-orange-400 text-sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                )}
                {stat.changeType === 'neutral' && (
                  <div className="text-gray-400 text-sm">
                    {stat.change}
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-gray-300 text-sm font-medium mb-2">{stat.title}</h3>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Hızlı Erişim</h2>
            <p className="text-gray-400">Sık kullanılan yönetim araçları</p>
          </div>
          <BarChart3 className="h-8 w-8 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {quickActions.map((action, index) => (
            action.isSEOWidget ? (
              <div
                key={index}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => setShowSEOWidget(!showSEOWidget)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  {action.count !== undefined && action.count > 0 && (
                    <div className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-1 rounded-full">
                      {action.count}
                    </div>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-gray-200 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                  {action.description}
                </p>
              </div>
            ) : (
              <a
                key={index}
                href={action.href}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  {action.count !== undefined && action.count > 0 && (
                    <div className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-1 rounded-full">
                      {action.count}
                    </div>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-gray-200 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                  {action.description}
                </p>
              </a>
            )
          ))}
        </div>
      </div>

      {/* SEO Widget */}
              {showSEOWidget && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <SEODashboard
              onEditSEO={(pageType, pageId) => {
                setSeoModalData({ pageType, pageId: pageId || undefined })
                setSeoModalOpen(true)
              }}
            />
          </div>
        )}

        {/* AI Blog Generator */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <AIBlogGenerator />
        </div>

      {/* Recent Orders */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Son Siparişler</h2>
            <p className="text-gray-400">En güncel sipariş hareketleri</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-green-400 animate-pulse" />
            <a 
              href="/admin/orders"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center transition-colors"
            >
              Tümünü Gör <ArrowUpRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
        
        <div className="overflow-hidden">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">#{order.id.slice(-8)}</p>
                        <p className="text-gray-400 text-sm">{order.user?.name} {order.user?.surname}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-bold">{formatPrice(order.total)}</p>
                        <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                        order.status === 'AWAITING_PAYMENT' ? 'bg-orange-500/20 text-orange-300' :
                        order.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                        order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-300' :
                        order.status === 'SHIPPED' ? 'bg-purple-500/20 text-purple-300' :
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-300' :
                        order.status === 'FAILED' ? 'bg-red-500/20 text-red-300' :
                        order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {order.status === 'PENDING' ? 'Beklemede' :
                         order.status === 'AWAITING_PAYMENT' ? 'Ödeme Bekleniyor' :
                         order.status === 'PAID' ? 'Ödendi' :
                         order.status === 'CONFIRMED' ? 'Onaylandı' :
                         order.status === 'SHIPPED' ? 'Kargoda' :
                         order.status === 'DELIVERED' ? 'Teslim Edildi' :
                         order.status === 'FAILED' ? 'Başarısız' :
                         order.status === 'CANCELLED' ? 'İptal Edildi' : order.status}
                      </div>
                      
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Henüz sipariş bulunmamaktadır</p>
              <p className="text-gray-500 text-sm">İlk siparişiniz geldiğinde burada görünecektir</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Sistem Durumu</h2>
            <p className="text-gray-400">İşletme paneli durumu</p>
          </div>
          <Activity className="h-8 w-8 text-green-400 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 font-medium">Panel Durumu</p>
                <p className="text-white text-lg font-bold">Aktif</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 font-medium">Sipariş Sistemi</p>
                <p className="text-white text-lg font-bold">Çalışıyor</p>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 font-medium">Stok Takibi</p>
                <p className="text-white text-lg font-bold">Güncel</p>
              </div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Edit Modal */}
      {seoModalData && (
        <SEOEditModal
          isOpen={seoModalOpen}
          onClose={() => {
            setSeoModalOpen(false)
            setSeoModalData(null)
          }}
          pageType={seoModalData.pageType}
          pageId={seoModalData.pageId}
          initialData={seoModalData.initialData}
        />
      )}
    </div>
  )
}
