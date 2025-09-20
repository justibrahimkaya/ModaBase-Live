'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  AlertTriangle, Package, TrendingUp, Clock, Plus, Edit, Search, 
  Download, RefreshCw, ChevronDown, ChevronUp, BarChart3, 
  Settings, Eye, AlertCircle,
  CheckCircle, XCircle, Activity, 
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  stock: number
  minStockLevel: number
  maxStockLevel?: number
  price: number
  categoryName: string
  categorySlug: string
  reservedStock: number
  createdAt: string
  updatedAt: string
}

interface StockMovement {
  id: string
  type: 'IN' | 'OUT' | 'RESERVED' | 'RELEASED'
  quantity: number
  description: string
  createdAt: string
  product: {
    id: string
    name: string
    category: {
      name: string
    }
  }
  order?: {
    id: string
    status: string
    trackingNumber: string
  }
}

interface StockAlert {
  lowStockProducts: Product[]
  outOfStockProducts: Product[]
  recentMovements: StockMovement[]
}

interface StockStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalStockValue: number
  averageStockLevel: number
  totalMovements: number
  criticalProducts: number
}

export default function StockAlertsPage() {
  const [alerts, setAlerts] = useState<StockAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'low-stock' | 'out-of-stock' | 'movements'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category' | 'date'>('stock')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [quickUpdateModalOpen, setQuickUpdateModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [updateQuantity, setUpdateQuantity] = useState('')
  const [updateType, setUpdateType] = useState<'add' | 'set'>('add')
  const [updateDescription, setUpdateDescription] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  
  // Report download handler
  const handleDownloadReport = async () => {
    try {
      const csvData = generateStockReport()
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `stok-raporu-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Report download error:', error)
      alert('Rapor indirilemedi!')
    }
  }

  // Generate CSV report data
  const generateStockReport = () => {
    if (!alerts) return ''
    
    const headers = ['Ürün Adı', 'Kategori', 'Mevcut Stok', 'Min Stok', 'Durum', 'Son Güncelleme']
    const allProducts = [...alerts.lowStockProducts, ...alerts.outOfStockProducts]
    
    const csvContent = [
      headers.join(','),
      ...allProducts.map(product => [
        `"${product.name}"`,
        `"${product.categoryName}"`,
        product.stock,
        product.minStockLevel,
        product.stock === 0 ? 'Stoksuz' : 'Düşük Stok',
        `"${new Date(product.updatedAt).toLocaleDateString('tr-TR')}"`
      ].join(','))
    ].join('\n')
    
    return csvContent
  }

  // Settings handler (placeholder)
  const handleSettings = () => {
    alert('Stok ayarları özelliği yakında eklenecek!')
  }

  // View product details
  const handleViewProduct = (product: Product) => {
    window.open(`/admin/products?search=${encodeURIComponent(product.name)}`, '_blank')
  }
  
  const [stats, setStats] = useState<StockStats>({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalStockValue: 0,
    averageStockLevel: 0,
    totalMovements: 0,
    criticalProducts: 0
  })

  useEffect(() => {
    console.log('🎯 Component mount - fetchAlerts başlatılıyor');
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Her 30 saniyede bir yenile
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log('🔄 alerts değişti:', alerts ? 'Veri var' : 'Veri yok');
    if (alerts) {
      console.log('📊 calculateStats çağrılıyor...');
      calculateStats()
      console.log('📁 extractCategories çağrılıyor...');
      extractCategories()
      console.log('✅ Stats ve categories güncellendi');
    }
  }, [alerts])

  const fetchAlerts = async () => {
    try {
      console.log('🚀 Stok uyarıları getiriliyor...');
      setRefreshing(true)
      
      // ✅ TIMEOUT: 30 saniye timeout ekle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye
      
      const response = await fetch('/api/admin/stock-alerts', {
        credentials: 'include',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId); // ✅ Başarılı ise timeout'u temizle
      
      console.log('📡 API yanıt:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Stok verileri alındı:', {
          lowStock: data.lowStockProducts?.length || 0,
          outOfStock: data.outOfStockProducts?.length || 0,
          movements: data.recentMovements?.length || 0
        });
        console.log('📋 Tam veri:', data);
        console.log('🔧 setAlerts çağrılıyor...');
        setAlerts(data)
        console.log('✅ setAlerts tamamlandı');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
        console.error('❌ API Hatası:', response.status, errorData);
        
        if (response.status === 401) {
          console.log('🔑 Authentication gerekli, login sayfasına yönlendiriliyor...');
          window.location.href = '/admin/login';
          return;
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Stok uyarıları fetch hatası:', error)
      alert(`Stok verileri yüklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = useCallback(() => {
    if (!alerts) return
    
    const allProducts = [...alerts.lowStockProducts, ...alerts.outOfStockProducts]
    const totalProducts = allProducts.length
    const lowStockCount = alerts.lowStockProducts.length
    const outOfStockCount = alerts.outOfStockProducts.length
    const totalStockValue = allProducts.reduce((sum, p) => sum + (p.stock * p.price), 0)
    const averageStockLevel = totalProducts > 0 ? allProducts.reduce((sum, p) => sum + p.stock, 0) / totalProducts : 0
    const criticalProducts = allProducts.filter(p => p.stock <= p.minStockLevel * 0.5).length
    
    setStats({
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
      averageStockLevel,
      totalMovements: alerts.recentMovements.length,
      criticalProducts
    })
  }, [alerts])

  const extractCategories = useCallback(() => {
    if (!alerts) return
    
    const allProducts = [...alerts.lowStockProducts, ...alerts.outOfStockProducts]
    const uniqueCategories = Array.from(new Set(allProducts.map(p => p.categoryName)))
    setCategories(uniqueCategories)
  }, [alerts])

  const filteredAndSortedProducts = useCallback((products: Product[]) => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || product.categoryName === filterCategory
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'stock':
          aValue = a.stock
          bValue = b.stock
          break
        case 'category':
          aValue = a.categoryName.toLowerCase()
          bValue = b.categoryName.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.updatedAt)
          bValue = new Date(b.updatedAt)
          break
        default:
          aValue = a.stock
          bValue = b.stock
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [searchTerm, filterCategory, sortBy, sortOrder])

  const handleQuickUpdate = async () => {
    if (!selectedProduct || !updateQuantity) return
    
    try {
      const quantity = parseInt(updateQuantity)
      const newStock = updateType === 'add' ? selectedProduct.stock + quantity : quantity
      
      // Gerçek API çağrısı yap
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: newStock,
          minStockLevel: selectedProduct.minStockLevel,
          maxStockLevel: selectedProduct.maxStockLevel,
          description: updateDescription || `Admin tarafından ${updateType === 'add' ? 'eklendi' : 'güncellendi'}: ${quantity} adet`
        }),
      })

      if (!response.ok) {
        throw new Error('Stok güncellenirken hata oluştu')
      }

      // Başarı mesajı
      alert('Stok başarıyla güncellendi!')
      
      // Sayfayı yenile
      await fetchAlerts()
      
      // Modal'ı kapat
      setQuickUpdateModalOpen(false)
      setSelectedProduct(null)
      setUpdateQuantity('')
      setUpdateDescription('')
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Stok güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    }
  }

  const getStockStatusColor = (product: Product) => {
    const percentage = (product.stock / product.minStockLevel) * 100
    if (product.stock === 0) return 'text-red-600 bg-red-50'
    if (percentage <= 50) return 'text-red-600 bg-red-50'
    if (percentage <= 100) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  const getStockStatusIcon = (product: Product) => {
    const percentage = (product.stock / product.minStockLevel) * 100
    if (product.stock === 0) return <XCircle className="w-4 h-4" />
    if (percentage <= 50) return <AlertCircle className="w-4 h-4" />
    if (percentage <= 100) return <AlertTriangle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'OUT': return <ArrowDownRight className="w-4 h-4 text-red-600" />
      case 'RESERVED': return <Clock className="w-4 h-4 text-orange-600" />
      case 'RELEASED': return <CheckCircle className="w-4 h-4 text-blue-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  console.log('🖥️ Render kontrol:', { loading, alerts: !!alerts });

  if (loading) {
    console.log('⏳ Loading state - yükleniyor gösteriliyor');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Stok verileri yükleniyor...</p>
          <p className="text-sm text-gray-500">Bu işlem birkaç saniye sürebilir</p>
        </div>
      </div>
    )
  }

  // ✅ Eğer veriler hala yüklenmemişse
  if (!alerts) {
    console.log('❌ Alerts null - hata ekranı gösteriliyor');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-16 h-16 text-orange-500" />
          <p className="text-gray-600">Stok verileri yüklenemedi</p>
          <button 
            onClick={fetchAlerts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ Normal render - ana sayfa gösteriliyor');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stok Uyarıları</h1>
          <p className="text-gray-600 mt-1">Stok durumu ve hareketleri takip edin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Yenileniyor...' : 'Yenile'}
          </button>
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Rapor İndir
          </button>
          <button 
            onClick={handleSettings}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Settings className="w-4 h-4" />
            Ayarlar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Toplam Ürün</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-blue-100 text-xs mt-1">Stok takibi yapılan</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Düşük Stok</p>
              <p className="text-2xl font-bold">{stats.lowStockCount}</p>
              <p className="text-orange-100 text-xs mt-1">Kritik seviyede</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Stoksuz</p>
              <p className="text-2xl font-bold">{stats.outOfStockCount}</p>
              <p className="text-red-100 text-xs mt-1">Acil tedarik gerekli</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Stok Değeri</p>
              <p className="text-2xl font-bold">₺{stats.totalStockValue.toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-1">Toplam envanter</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="min-w-[200px]">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="stock">Stok Miktarı</option>
              <option value="name">Ürün Adı</option>
              <option value="category">Kategori</option>
              <option value="date">Tarih</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Genel Bakış
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('low-stock')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'low-stock'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Düşük Stok ({stats.lowStockCount})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('out-of-stock')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'out-of-stock'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Stoksuz ({stats.outOfStockCount})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('movements')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'movements'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Hareketler ({stats.totalMovements})
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {selectedTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Stok Durumu Özeti</h2>
            
            {/* Critical Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Kritik Durum ({stats.criticalProducts})
                </h3>
                <div className="space-y-2">
                  {alerts?.outOfStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.categoryName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-semibold">Stok: {product.stock}</p>
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setQuickUpdateModalOpen(true)
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          title="Stok Güncelle"
                        >
                          Hızlı Güncelle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Düşük Stok ({stats.lowStockCount})
                </h3>
                <div className="space-y-2">
                  {alerts?.lowStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.categoryName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-600 font-semibold">Stok: {product.stock}</p>
                        <p className="text-xs text-gray-500">Min: {product.minStockLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Son Hareketler
              </h3>
              <div className="space-y-3">
                {alerts?.recentMovements.slice(0, 5).map(movement => (
                  <div key={movement.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getMovementIcon(movement.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{movement.product.name}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                          movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {movement.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{movement.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold ${
                        movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'low-stock' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Düşük Stok Ürünleri</h2>
              <span className="text-sm text-gray-500">
                {filteredAndSortedProducts(alerts?.lowStockProducts || []).length} ürün
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ürün</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mevcut Stok</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Min. Stok</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProducts(alerts?.lowStockProducts || []).map(product => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.slug}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {product.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-orange-600">{product.stock}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{product.minStockLevel}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStockStatusColor(product)}`}>
                          {getStockStatusIcon(product)}
                          Düşük Stok
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setQuickUpdateModalOpen(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Stok Güncelle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Ürünü Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'out-of-stock' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Stoksuz Ürünler</h2>
              <span className="text-sm text-gray-500">
                {filteredAndSortedProducts(alerts?.outOfStockProducts || []).length} ürün
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ürün</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Son Güncelleme</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProducts(alerts?.outOfStockProducts || []).map(product => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.slug}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {product.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(product.updatedAt).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          <XCircle className="w-4 h-4" />
                          Stoksuz
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setQuickUpdateModalOpen(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Stok Ekle"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Ürünü Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'movements' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Stok Hareketleri</h2>
              <span className="text-sm text-gray-500">
                Son 7 gün - {alerts?.recentMovements.length} hareket
              </span>
            </div>
            
            <div className="space-y-3">
              {alerts?.recentMovements.map(movement => (
                <div key={movement.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    {getMovementIcon(movement.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{movement.product.name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                        movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                        movement.type === 'RESERVED' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movement.type === 'IN' ? 'Giriş' :
                         movement.type === 'OUT' ? 'Çıkış' :
                         movement.type === 'RESERVED' ? 'Rezerve' : 'Serbest'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{movement.description}</p>
                    <p className="text-xs text-gray-500">{movement.product.category.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-semibold text-lg ${
                      movement.type === 'IN' ? 'text-green-600' : 
                      movement.type === 'OUT' ? 'text-red-600' : 
                      'text-orange-600'
                    }`}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(movement.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {movement.order && (
                      <p className="text-xs text-blue-600">
                        Sipariş: {movement.order.id.slice(-8)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Update Modal */}
      {quickUpdateModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Hızlı Stok Güncelle</h3>
              <p className="text-gray-600 mt-1">{selectedProduct.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Mevcut Stok</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedProduct.stock}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Min. Stok</p>
                  <p className="text-lg font-semibold text-orange-600">{selectedProduct.minStockLevel}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Güncelleme Tipi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUpdateType('add')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      updateType === 'add'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Ekle</span>
                  </button>
                  <button
                    onClick={() => setUpdateType('set')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      updateType === 'set'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Edit className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Belirle</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar
                </label>
                <input
                  type="number"
                  value={updateQuantity}
                  onChange={(e) => setUpdateQuantity(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Miktar girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Güncelleme açıklaması..."
                />
              </div>

              {updateQuantity && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Yeni Stok:</span> {' '}
                    {updateType === 'add' 
                      ? selectedProduct.stock + parseInt(updateQuantity)
                      : parseInt(updateQuantity)
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setQuickUpdateModalOpen(false)
                  setSelectedProduct(null)
                  setUpdateQuantity('')
                  setUpdateDescription('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleQuickUpdate}
                disabled={!updateQuantity}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
