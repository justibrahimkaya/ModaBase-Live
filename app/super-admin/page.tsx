'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Building2, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Sparkles,
  Crown,
  Globe
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalBusinesses: number
  pendingBusinesses: number
  approvedBusinesses: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  activeProducts: number
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
      console.error('Stats fetch error:', error)
      setError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
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
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-300',
      change: '+12%',
      changeType: 'up'
    },
    {
      title: 'Toplam İşletme',
      value: stats?.totalBusinesses || 0,
      icon: Building2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-300',
      change: '+8%',
      changeType: 'up'
    },
    {
      title: 'Bekleyen Onaylar',
      value: stats?.pendingBusinesses || 0,
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-300',
      change: stats?.pendingBusinesses ? 'Acil!' : 'Temiz',
      changeType: stats?.pendingBusinesses ? 'alert' : 'neutral'
    },
    {
      title: 'Onaylı İşletme',
      value: stats?.approvedBusinesses || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-300',
      change: '+15%',
      changeType: 'up'
    },
    {
      title: 'Toplam Sipariş',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-300',
      change: '+25%',
      changeType: 'up'
    },
    {
      title: 'Toplam Ciro',
      value: `₺${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-300',
      change: '+18%',
      changeType: 'up'
    },
    {
      title: 'Toplam Ürün',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      textColor: 'text-pink-300',
      change: '+10%',
      changeType: 'up'
    },
    {
      title: 'Aktif Ürün',
      value: stats?.activeProducts || 0,
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      textColor: 'text-cyan-300',
      change: '+7%',
      changeType: 'up'
    }
  ]

  const quickActions = [
    {
      title: 'İşletme Onayları',
      description: 'Bekleyen işletme başvurularını incele',
      href: '/super-admin/businesses',
      icon: Building2,
      color: 'from-emerald-500 to-green-600',
      count: stats?.pendingBusinesses || 0
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Sistem kullanıcılarını yönet',
      href: '/super-admin/users',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      count: stats?.totalUsers || 0
    },
    {
      title: 'Sistem Ayarları',
      description: 'Global sistem konfigürasyonu',
      href: '/super-admin/settings',
      icon: Activity,
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Sistem Durumu',
      description: 'Sunucu ve veritabanı durumu',
      href: '/super-admin/system',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Süper Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">ModaBase Sistem Yönetimi</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
          >
            <Globe className="h-4 w-4 mr-2" />
            Siteyi Görüntüle
          </button>
          
          <div className="text-right">
            <p className="text-sm text-gray-400">Son güncellenme</p>
            <p className="text-white text-sm font-medium">{new Date().toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                {action.count !== undefined && (
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
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Sistem Durumu</h2>
            <p className="text-gray-400">Gerçek zamanlı sistem bilgileri</p>
          </div>
          <Activity className="h-8 w-8 text-green-400 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 font-medium">Sunucu Durumu</p>
                <p className="text-white text-lg font-bold">Aktif</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 font-medium">Veritabanı</p>
                <p className="text-white text-lg font-bold">Bağlı</p>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 font-medium">Sistem Yükü</p>
                <p className="text-white text-lg font-bold">Düşük</p>
              </div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
