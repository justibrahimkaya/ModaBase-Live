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
  total: number
  status: string
  createdAt: string
  paymentMethod?: string
  shippingMethod?: string
  shippingCost?: number
  trackingNumber?: string
  shippingCompany?: string
  invoiceType?: string
  tcKimlikNo?: string
  vergiNo?: string
  vergiDairesi?: string
  unvan?: string
  guestName?: string
  guestSurname?: string
  guestEmail?: string
  guestPhone?: string
  user?: {
    id: string
    name: string
    surname: string
    email: string
    phone?: string
    createdAt: string
  }
  address?: {
    id: string
    title: string
    city: string
    district: string
    neighborhood: string
    address: string
  }
  items?: Array<{
    id: string
    productId: string
    quantity: number
    price: number
    product?: {
      name: string
    }
  }>
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
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [orderToReject, setOrderToReject] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [dropdownOrderId, setDropdownOrderId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOrderId(null)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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

  const updateOrderStatus = async (orderId: string, newStatus: string, reason?: string) => {
    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          reason: reason || '',
          action: newStatus === 'REJECTED' ? 'reject' : 'approve'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
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
        
        // Başarı mesajı göster
        if (result.success) {
          alert(result.message)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Sipariş güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Sipariş güncellenirken hata oluştu')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const rejectOrder = (orderId: string) => {
    setOrderToReject(orderId)
    setShowRejectModal(true)
  }

  const confirmReject = async () => {
    if (!orderToReject || !rejectReason.trim()) return
    
    setIsRejecting(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderToReject}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'REJECTED',
          rejectionReason: rejectReason.trim()
        })
      })

      if (response.ok) {
        await fetchOrders()
        setShowRejectModal(false)
        setOrderToReject('')
        setRejectReason('')
      } else {
        console.error('Sipariş reddetme hatası')
      }
    } catch (error) {
      console.error('Sipariş reddetme hatası:', error)
    } finally {
      setIsRejecting(false)
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
      case 'PENDING_APPROVAL':
        return { 
          label: 'Onay Bekliyor', 
          color: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          icon: Clock,
          nextStatus: 'CONFIRMED',
          nextLabel: 'Onayla'
        }
      case 'INVOICE_PENDING':
        return { 
          label: 'Fatura Beklemede', 
          color: 'from-purple-500 to-indigo-500',
          bg: 'bg-purple-50 border-purple-200',
          text: 'text-purple-700',
          icon: AlertCircle,
          nextStatus: 'CONFIRMED',
          nextLabel: 'Onayla'
        }
      case 'AWAITING_PAYMENT':
        return { 
          label: 'Ödeme Bekleniyor', 
          color: 'from-orange-500 to-red-500',
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-700',
          icon: Clock,
          nextStatus: 'PAID',
          nextLabel: 'Ödeme Onayla'
        }
      case 'PAID':
        return { 
          label: 'Ödendi', 
          color: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-700',
          icon: CheckCircle,
          nextStatus: 'CONFIRMED',
          nextLabel: 'Siparişi Onayla'
        }
      case 'CONFIRMED':
        return { 
          label: 'Onaylandı', 
          color: 'from-blue-500 to-indigo-500',
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          icon: CheckCircle,
          nextStatus: 'SHIPPED',
          nextLabel: 'Kargoya Ver'
        }
      case 'REJECTED':
        return { 
          label: 'Reddedildi', 
          color: 'from-red-500 to-pink-500',
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          icon: XCircle,
          nextStatus: null,
          nextLabel: null
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
      case 'FAILED':
        return { 
          label: 'Ödeme Başarısız', 
          color: 'from-red-500 to-rose-500',
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          icon: XCircle,
          nextStatus: null,
          nextLabel: 'Başarısız'
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

  const getNextStatus = (currentStatus: string) => {
    const config = getStatusConfig(currentStatus)
    return config.nextStatus || currentStatus
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

  const OrderCard = ({ order }: { order: Order }) => {
    const statusConfig = getStatusConfig(order.status)
    
    // Müşteri bilgilerini güvenli şekilde al
    const customerName = order.user ? `${order.user.name} ${order.user.surname}` : 
                        order.guestName && order.guestSurname ? `${order.guestName} ${order.guestSurname}` : 
                        'Misafir Müşteri'
    
    const customerEmail = order.user?.email || order.guestEmail || 'E-posta yok'
    
    // Adres bilgilerini güvenli şekilde al
    const addressInfo = order.address ? `${order.address.city}, ${order.address.district}` : 
                       'Adres bilgisi yok'
    
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:scale-105 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm mb-1">
              Sipariş #{order.id.slice(-8)}
            </h3>
            <p className="text-gray-300 text-xs">
              {customerName}
            </p>
            <p className="text-gray-400 text-xs">{customerEmail}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-gray-300">
            <Calendar className="w-3 h-3 mr-2" />
            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
          </div>
          <div className="flex items-center text-xs text-gray-300">
            <Truck className="w-3 h-3 mr-2" />
            {addressInfo}
          </div>
          {order.trackingNumber && (
            <div className="flex items-center text-xs text-gray-300">
              <Package className="w-3 h-3 mr-2" />
              {order.trackingNumber}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-white">
            ₺{order.total.toFixed(2)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/orders/${order.id}`)}
              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {/* Reddetme butonu - Tüm durumlar için erişilebilir (REJECTED hariç) */}
            {order.status !== 'REJECTED' && (
              <button
                onClick={() => rejectOrder(order.id)}
                disabled={updatingOrder === order.id}
                className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                title="Siparişi Reddet"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
            
            {/* Onay/İleri butonları */}
            {(order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT') && (
              <button
                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                disabled={updatingOrder === order.id}
                className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                title="Siparişi Onayla"
              >
                {updatingOrder === order.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
            )}
            
            {/* Diğer durumlar için ileri butonu */}
            {order.status !== 'PENDING' && order.status !== 'AWAITING_PAYMENT' && order.status !== 'REJECTED' && getStatusConfig(order.status).nextStatus && (
              <button
                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                disabled={updatingOrder === order.id}
                className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                title={getStatusConfig(order.status).nextLabel || 'İleri'}
              >
                {updatingOrder === order.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

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
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Sipariş Yönetimi
              </h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Profesyonel sipariş takip ve yönetim sistemi</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 lg:py-2 rounded-xl transition-all duration-200 text-sm lg:text-base touch-manipulation ${
                showFilters 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtreler</span>
              <span className="sm:hidden">Filtre</span>
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-3 lg:py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200 text-sm lg:text-base touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Yenile</span>
              <span className="sm:hidden">Yenile</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 lg:py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg text-sm lg:text-base touch-manipulation">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Dışa Aktar</span>
              <span className="sm:hidden">Export</span>
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
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base lg:text-sm"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="PENDING">Beklemede</option>
                  <option value="PENDING_APPROVAL">Onay Bekliyor</option>
                  <option value="INVOICE_PENDING">Fatura Beklemede</option>
                  <option value="AWAITING_PAYMENT">Ödeme Bekleniyor</option>
                  <option value="PAID">Ödendi</option>
                  <option value="CONFIRMED">Onaylandı</option>
                  <option value="SHIPPED">Kargoda</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                  <option value="REJECTED">Reddedildi</option>
                  <option value="FAILED">Ödeme Başarısız</option>
                  <option value="CANCELLED">İptal Edildi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base lg:text-sm"
                >
                  <option value="">Tüm Tarihler</option>
                  <option value="today">Bugün</option>
                  <option value="week">Son 7 Gün</option>
                  <option value="month">Son 30 Gün</option>
                </select>
              </div>
              
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Sipariş no, müşteri, e-posta..."
                    className="w-full pl-10 pr-4 py-3 lg:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base lg:text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-4 lg:h-4" />
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
          
          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş Bulunamadı</h3>
                <p className="text-gray-500 text-sm">Henüz hiç sipariş bulunmamaktadır veya filtre kriterlerinize uygun sipariş yoktur.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
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
                            <div 
                              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedCustomer(order)
                                setShowCustomerModal(true)
                              }}
                              title="Müşteri Detaylarını Görüntüle"
                            >
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {order.user?.name} {order.user?.surname}
                                </span>
                                {(order.invoiceType && (order.tcKimlikNo || order.vergiNo)) && (
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    📄 Fatura
                                  </span>
                                )}
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
                            {/* Reddetme butonu - REJECTED durumu hariç tüm durumlar için */}
                            {order.status !== 'REJECTED' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  rejectOrder(order.id)
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Siparişi Reddet"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            
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
                            
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDropdownOrderId(dropdownOrderId === order.id ? null : order.id)
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                title="Daha Fazla"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              
                              {dropdownOrderId === order.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedCustomer(order)
                                        setShowCustomerModal(true)
                                        setDropdownOrderId(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      👤 Müşteri Bilgileri
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(`/admin/orders/${order.id}`)
                                        setDropdownOrderId(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      📋 Sipariş Detayı
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigator.clipboard.writeText(order.id)
                                        setDropdownOrderId(null)
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      📋 ID Kopyala
                                    </button>
                                    {order.status !== 'REJECTED' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          rejectOrder(order.id)
                                          setDropdownOrderId(null)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                      >
                                        ❌ Siparişi Reddet
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
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

      {/* Reddetme Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Siparişi Reddet</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Bu siparişi reddetme nedeninizi yazın:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Reddetme nedeni..."
              />
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setOrderToReject(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim() || isRejecting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isRejecting ? 'Reddediliyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Müşteri Detayları Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Müşteri Bilgileri</h3>
                  <p className="text-sm text-gray-500">#{selectedCustomer.id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCustomerModal(false)
                  setSelectedCustomer(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temel Bilgiler */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  👤 Temel Bilgiler
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Ad:</span> {selectedCustomer.user?.name || selectedCustomer.guestName || '-'}</div>
                  <div><span className="font-medium">Soyad:</span> {selectedCustomer.user?.surname || selectedCustomer.guestSurname || '-'}</div>
                  <div><span className="font-medium">E-posta:</span> {selectedCustomer.user?.email || selectedCustomer.guestEmail || '-'}</div>
                  <div><span className="font-medium">Telefon:</span> {selectedCustomer.user?.phone || selectedCustomer.guestPhone || '-'}</div>
                  <div><span className="font-medium">Kayıt Tarihi:</span> {selectedCustomer.user ? new Date(selectedCustomer.user.createdAt).toLocaleDateString('tr-TR') : 'Misafir'}</div>
                </div>
              </div>

              {/* Fatura Bilgileri */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📄 Fatura Bilgileri
                </h4>
                {selectedCustomer.invoiceType ? (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Fatura Tipi:</span> {selectedCustomer.invoiceType === 'BIREYSEL' ? 'Bireysel' : 'Kurumsal'}</div>
                    {selectedCustomer.invoiceType === 'BIREYSEL' ? (
                      <div><span className="font-medium">TC Kimlik:</span> {selectedCustomer.tcKimlikNo || '-'}</div>
                    ) : (
                      <>
                        <div><span className="font-medium">Vergi No:</span> {selectedCustomer.vergiNo || '-'}</div>
                        <div><span className="font-medium">Vergi Dairesi:</span> {selectedCustomer.vergiDairesi || '-'}</div>
                        <div><span className="font-medium">Unvan:</span> {selectedCustomer.unvan || '-'}</div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Fatura bilgisi yok</p>
                )}
              </div>

              {/* Sipariş Bilgileri */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  🛒 Sipariş Bilgileri
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Sipariş ID:</span> #{selectedCustomer.id.slice(-8)}</div>
                  <div><span className="font-medium">Toplam Tutar:</span> ₺{selectedCustomer.total.toFixed(2)}</div>
                  <div><span className="font-medium">Ödeme Yöntemi:</span> {selectedCustomer.paymentMethod || '-'}</div>
                  <div><span className="font-medium">Kargo Yöntemi:</span> {selectedCustomer.shippingMethod || '-'}</div>
                  <div><span className="font-medium">Tarih:</span> {new Date(selectedCustomer.createdAt).toLocaleString('tr-TR')}</div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📍 Teslimat Adresi
                </h4>
                {selectedCustomer.address ? (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Başlık:</span> {selectedCustomer.address.title || '-'}</div>
                    <div><span className="font-medium">İl:</span> {selectedCustomer.address.city || '-'}</div>
                    <div><span className="font-medium">İlçe:</span> {selectedCustomer.address.district || '-'}</div>
                    <div><span className="font-medium">Mahalle:</span> {selectedCustomer.address.neighborhood || '-'}</div>
                    <div><span className="font-medium">Adres:</span> {selectedCustomer.address.address || '-'}</div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Adres bilgisi yok</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => router.push(`/admin/orders/${selectedCustomer.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Sipariş Detayına Git
              </button>
              <button
                onClick={() => {
                  setShowCustomerModal(false)
                  setSelectedCustomer(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
