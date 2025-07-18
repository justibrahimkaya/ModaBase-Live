'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, Search, Filter, Download, RefreshCw, 
  Eye, Calendar, TrendingUp, Clock, CheckCircle,
  XCircle, AlertCircle, Truck, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Users, DollarSign,
  ShoppingBag, Crown, Sparkles, Package, Play, Check
} from 'lucide-react'

interface Order {
  id: string
  user: { name: string; surname: string; email: string }
  address: { title: string; city: string; district: string }
  status: string
  total: number
  createdAt: string
  trackingNumber?: string
  shippingCompany?: string
}

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  avgOrderValue: number
  todayOrders: number
  weeklyGrowth: number
  monthlyGrowth: number
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    todayOrders: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Orders fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData: Order[]) => {
    const total = ordersData.length
    const pending = ordersData.filter(o => o.status === 'PENDING').length
    const completed = ordersData.filter(o => o.status === 'DELIVERED').length
    const revenue = ordersData.reduce((sum, o) => sum + o.total, 0)
    const avgValue = revenue / total || 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = ordersData.filter(o => new Date(o.createdAt) >= today).length
    
    setStats({
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      totalRevenue: revenue,
      avgOrderValue: avgValue,
      todayOrders: todayCount,
      weeklyGrowth: 12.5, // Mock data
      monthlyGrowth: 23.8 // Mock data
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        // Başarılı güncelleme
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
        calculateStats(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
      }
    } catch (error) {
      console.error('Status update error:', error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                         order.user?.surname?.toLowerCase().includes(search.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                         order.id.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = !statusFilter || order.status === statusFilter
    
    const matchesDate = !dateFilter || (() => {
      const orderDate = new Date(order.createdAt)
      const today = new Date()
      
      switch(dateFilter) {
        case 'today':
          return orderDate.toDateString() === today.toDateString()
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return orderDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return orderDate >= monthAgo
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING':
        return { 
          label: 'Beklemede', 
          color: 'from-yellow-500 to-orange-500',
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-700',
          icon: Clock,
          nextStatus: 'CONFIRMED',
          nextLabel: 'Onayla'
        }
      case 'CONFIRMED':
        return { 
          label: 'Onaylandı', 
          color: 'from-blue-500 to-indigo-500',
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          icon: CheckCircle,
          nextStatus: 'SHIPPED',
          nextLabel: 'Kargo Ver'
        }
      case 'SHIPPED':
        return { 
          label: 'Kargoda', 
          color: 'from-purple-500 to-pink-500',
          bg: 'bg-purple-50 border-purple-200',
          text: 'text-purple-700',
          icon: Truck,
          nextStatus: 'DELIVERED',
          nextLabel: 'Teslim Edildi'
        }
      case 'DELIVERED':
        return { 
          label: 'Teslim Edildi', 
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-700',
          icon: CheckCircle,
          nextStatus: null,
          nextLabel: 'Tamamlandı'
        }
      case 'CANCELLED':
        return { 
          label: 'İptal Edildi', 
          color: 'from-red-500 to-rose-500',
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          icon: XCircle,
          nextStatus: null,
          nextLabel: 'İptal Edildi'
        }
      default:
        return { 
          label: status, 
          color: 'from-gray-500 to-slate-500',
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          icon: AlertCircle,
          nextStatus: null,
          nextLabel: status
        }
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, color, isPositive = true }: {
    title: string
    value: string | number
    change?: string
    icon: any
    color: string
    isPositive?: boolean
  }) => (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">Siparişler yükleniyor...</p>
          <p className="text-sm text-gray-500">Lütfen bekleyiniz</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Sipariş Yönetimi
              </h1>
              <p className="text-gray-600 mt-1">Profesyonel sipariş takip ve yönetim sistemi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtreler
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg">
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Sipariş"
            value={stats.totalOrders}
            change={`+${stats.weeklyGrowth}%`}
            icon={ShoppingBag}
            color="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Bekleyen Siparişler"
            value={stats.pendingOrders}
            change={`+${stats.todayOrders} bugün`}
            icon={Clock}
            color="from-orange-500 to-red-600"
          />
          <StatCard
            title="Toplam Gelir"
            value={`₺${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
            change={`+${stats.monthlyGrowth}%`}
            icon={DollarSign}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Ortalama Sipariş"
            value={`₺${stats.avgOrderValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
            change={`+${stats.weeklyGrowth}%`}
            icon={TrendingUp}
            color="from-purple-500 to-pink-600"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="CONFIRMED">Onaylandı</option>
                  <option value="SHIPPED">Kargoda</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                  <option value="CANCELLED">İptal Edildi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Tüm Tarihler</option>
                  <option value="today">Bugün</option>
                  <option value="week">Son 7 Gün</option>
                  <option value="month">Son 30 Gün</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Sipariş no, müşteri, e-posta..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-gray-900">Sipariş Listesi</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {filteredOrders.length} sipariş
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Canlı Veriler</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hızlı İşlem
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş Bulunamadı</h3>
                        <p className="text-gray-500 text-sm">Henüz hiç sipariş bulunmamaktadır veya filtre kriterlerinize uygun sipariş yoktur.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                #{order.id.slice(-3)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">#{order.id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">ID: {order.id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.user?.name} {order.user?.surname}
                              </div>
                              <div className="text-sm text-gray-500">{order.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                ₺{order.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-gray-500">TL</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Hızlı İşlem */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {statusConfig.nextStatus && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, statusConfig.nextStatus!)
                              }}
                              disabled={updatingOrder === order.id}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                statusConfig.nextStatus === 'CONFIRMED' 
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                : statusConfig.nextStatus === 'SHIPPED'
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : statusConfig.nextStatus === 'DELIVERED'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                              } ${updatingOrder === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingOrder === order.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : statusConfig.nextStatus === 'CONFIRMED' ? (
                                <Check className="w-4 h-4" />
                              ) : statusConfig.nextStatus === 'SHIPPED' ? (
                                <Package className="w-4 h-4" />
                              ) : statusConfig.nextStatus === 'DELIVERED' ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              {statusConfig.nextLabel}
                            </button>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/admin/orders/${order.id}`)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Detay Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                              title="Daha Fazla"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{filteredOrders.length}</span> sipariş gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sayfa</span>
                  <select className="px-2 py-1 text-sm border border-gray-300 rounded bg-white">
                    <option>1</option>
                  </select>
                  <span className="text-sm text-gray-500">/ 1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
