'use client'

import { useState, useEffect } from 'react'
import { 
  Server, 
  Database,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  Users,
  ShoppingCart,
  Package,
  Building2,
  Monitor
} from 'lucide-react'

interface SystemMetrics {
  uptime: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIn: string
  networkOut: string
  activeConnections: number
  responseTime: number
}

interface ServiceStatus {
  name: string
  status: 'online' | 'warning' | 'offline'
  responseTime: number
  uptime: number
  lastCheck: string
}

interface SystemInfo {
  os: string
  nodeVersion: string
  nextVersion: string
  postgresVersion: string
  uptime: string
  totalMemory: string
  freeMemory: string
}

interface BusinessStats {
  activeUsers: number
  dailyOrders: number
  totalProducts: number
  activeBusinesses: number
  pendingBusinesses: number
  rejectedBusinesses: number
  totalUsers: number
  totalBusinesses: number
  totalOrders: number
}

interface SystemData {
  metrics: SystemMetrics
  services: ServiceStatus[]
  systemInfo: SystemInfo
  businessStats: BusinessStats
}

export default function SystemStatus() {
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchSystemData()
  }, [])

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/system', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Sistem durumu getirilemedi')
      }

      const data = await response.json()
      setSystemData(data)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('Sistem durumu yüklenirken hata:', err)
      setError(err.message || 'Sistem durumu yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchSystemData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'offline': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'offline': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'from-green-500 to-emerald-600'
    if (usage < 80) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">Sistem durumu yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-2">Hata oluştu</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchSystemData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!systemData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-white">Sistem verisi bulunamadı</p>
        </div>
      </div>
    )
  }

  const { metrics, services, systemInfo, businessStats } = systemData

  const performanceMetrics = [
    {
      name: 'CPU Kullanımı',
      value: metrics.cpuUsage,
      unit: '%',
      icon: Cpu,
      color: getUsageColor(metrics.cpuUsage)
    },
    {
      name: 'RAM Kullanımı',
      value: metrics.memoryUsage,
      unit: '%',
      icon: MemoryStick,
      color: getUsageColor(metrics.memoryUsage)
    },
    {
      name: 'Disk Kullanımı',
      value: metrics.diskUsage,
      unit: '%',
      icon: HardDrive,
      color: getUsageColor(metrics.diskUsage)
    },
    {
      name: 'Yanıt Süresi',
      value: metrics.responseTime,
      unit: 'ms',
      icon: Activity,
      color: 'from-blue-500 to-cyan-600'
    }
  ]

  const businessStatsDisplay = [
    {
      name: 'Aktif Kullanıcı',
      value: businessStats.activeUsers.toLocaleString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Günlük Sipariş',
      value: businessStats.dailyOrders.toString(),
      change: '+8%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Toplam Ürün',
      value: businessStats.totalProducts.toLocaleString(),
      change: '+3%',
      trend: 'up' as const,
      icon: Package,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Aktif İşletme',
      value: businessStats.activeBusinesses.toString(),
      change: '-2%',
      trend: 'down' as const,
      icon: Building2,
      color: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Sistem Durumu
              </h1>
              <p className="text-gray-400 mt-1">Sistem performansını ve servis durumunu izleyin</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm">
            <p className="text-gray-400">Son güncelleme</p>
            <p className="text-white">{lastUpdate.toLocaleTimeString('tr-TR')}</p>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Yenileniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl mr-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sistem Çalışıyor</h2>
              <p className="text-green-400">Tüm kritik sistemler normal çalışıyor</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-green-400 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Uptime: {metrics.uptime}</span>
            </div>
            <div className="flex items-center text-green-400">
              <Activity className="h-4 w-4 mr-2" />
              <span className="text-sm">{metrics.activeConnections} aktif bağlantı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} shadow-lg`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{metric.value}{metric.unit}</p>
                <p className="text-sm text-gray-400">{metric.name}</p>
              </div>
            </div>
            
            {metric.unit === '%' && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Network className="h-6 w-6 text-blue-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Ağ Trafiği</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-gray-400">İndirme</span>
              </div>
              <span className="text-white font-semibold">{metrics.networkIn} MB/s</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-gray-400">Yükleme</span>
              </div>
              <span className="text-white font-semibold">{metrics.networkOut} MB/s</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Monitor className="h-6 w-6 text-purple-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Sistem Bilgileri</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">İşletim Sistemi:</span>
              <span className="text-white">{systemInfo.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node.js:</span>
              <span className="text-white">{systemInfo.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next.js:</span>
              <span className="text-white">{systemInfo.nextVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PostgreSQL:</span>
              <span className="text-white">{systemInfo.postgresVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">Servis Durumları</h3>
          <button className="flex items-center px-3 py-2 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
            <Eye className="h-4 w-4 mr-2" />
            Detayları Gör
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{service.name}</h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="ml-1 capitalize">{service.status}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Yanıt Süresi:</span>
                  <span className="text-white">{service.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Uptime:</span>
                  <span className="text-white">{service.uptime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Son Kontrol:</span>
                  <span className="text-white">{new Date(service.lastCheck).toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Metrics */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-2xl font-semibold text-white mb-6">İş Metrikleri</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessStatsDisplay.map((stat) => (
            <div
              key={stat.name}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Hızlı İşlemler</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all duration-200">
            <Download className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Log İndir</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-200">
            <Database className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">DB Yedekle</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-all duration-200">
            <RefreshCw className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Cache Temizle</span>
          </button>
          
          <button className="flex flex-col items-center p-4 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 transition-all duration-200">
            <Calendar className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Raporlar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
