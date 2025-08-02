'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, Plus, Edit, Trash2, Key, Search, Filter,
  RefreshCw, Download, MoreHorizontal, CheckCircle, XCircle,
  Activity, Globe, Zap, Crown, Sparkles, Settings,
  ArrowUpRight, ArrowDownRight, Package, Clock, AlertCircle
} from 'lucide-react'

interface ShippingCompany {
  id: string
  name: string
  code: string
  apiUrl?: string
  apiKey?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ShippingStats {
  totalCompanies: number
  activeCompanies: number
  inactiveCompanies: number
  integratedApis: number
  monthlyShipments: number
  averageDeliveryTime: number
  successRate: number
  integrationRate: number
}

export default function ShippingPage() {
  const [companies, setCompanies] = useState<ShippingCompany[]>([])
  const [stats, setStats] = useState<ShippingStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    integratedApis: 0,
    monthlyShipments: 0,
    averageDeliveryTime: 0,
    successRate: 0,
    integrationRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    apiUrl: '',
    apiKey: ''
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/shipping-companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (companiesData: ShippingCompany[]) => {
    const total = companiesData.length
    const active = companiesData.filter(c => c.isActive).length
    const inactive = total - active
    const integrated = companiesData.filter(c => c.apiUrl).length
    const integrationRate = total > 0 ? (integrated / total) * 100 : 0
    
    setStats({
      totalCompanies: total,
      activeCompanies: active,
      inactiveCompanies: inactive,
      integratedApis: integrated,
      monthlyShipments: 1250, // Mock data
      averageDeliveryTime: 2.5, // Mock data
      successRate: 97.8, // Mock data
      integrationRate
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/shipping-companies', {
        method: editingCompany ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingCompany ? { ...formData, id: editingCompany.id } : formData)
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({ name: '', code: '', apiUrl: '', apiKey: '' })
        setEditingCompany(null)
        fetchCompanies()
      }
    } catch (error) {
      console.error('Error saving company:', error)
    }
  }

  const handleEdit = (company: ShippingCompany) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      code: company.code,
      apiUrl: company.apiUrl || '',
      apiKey: company.apiKey || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu kargo firmasını silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/shipping-companies/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchCompanies()
        }
      } catch (error) {
        console.error('Error deleting company:', error)
      }
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase()) ||
                         company.code.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && company.isActive) ||
                         (statusFilter === 'inactive' && !company.isActive) ||
                         (statusFilter === 'integrated' && company.apiUrl) ||
                         (statusFilter === 'notintegrated' && !company.apiUrl)
    
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (company: ShippingCompany) => {
    if (!company.isActive) {
      return {
        label: 'Pasif',
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: XCircle
      }
    }
    
    if (company.apiUrl) {
      return {
        label: 'API Entegre',
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-700',
        icon: CheckCircle
      }
    }
    
    return {
      label: 'Aktif',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: Activity
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
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600">Kargo firmaları yükleniyor...</p>
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
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Kargo Firmaları
              </h1>
              <p className="text-gray-600 mt-1">Kargo firmalarını yönetin ve API entegrasyonlarını ayarlayın</p>
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
              onClick={fetchCompanies}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg">
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
            <button 
              onClick={() => {
                setEditingCompany(null)
                setFormData({ name: '', code: '', apiUrl: '', apiKey: '' })
                setShowModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Yeni Firma
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Kargo Firması"
            value={stats.totalCompanies}
            change={`+${stats.activeCompanies} aktif`}
            icon={Truck}
            color="from-cyan-500 to-blue-600"
          />
          <StatCard
            title="API Entegrasyonu"
            value={stats.integratedApis}
            change={`%${stats.integrationRate.toFixed(1)} oran`}
            icon={Globe}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Aylık Gönderi"
            value={stats.monthlyShipments.toLocaleString()}
            change={`%${stats.successRate} başarı`}
            icon={Package}
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            title="Ortalama Teslimat"
            value={`${stats.averageDeliveryTime} gün`}
            change={`${stats.inactiveCompanies} pasif`}
            icon={Clock}
            color="from-orange-500 to-red-600"
            isPositive={false}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum Filtresi</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="active">Aktif Firmalar</option>
                  <option value="inactive">Pasif Firmalar</option>
                  <option value="integrated">API Entegre</option>
                  <option value="notintegrated">API Entegre Değil</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Firma adı, kod..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-gray-900">Kargo Firmaları</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {filteredCompanies.length} firma
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
                    Firma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    API Durumu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                          <Truck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Kargo Firması Bulunamadı</h3>
                        <p className="text-gray-500 text-sm mb-6">İlk kargo firmanızı ekleyerek başlayın.</p>
                        <button 
                          onClick={() => {
                            setEditingCompany(null)
                            setFormData({ name: '', code: '', apiUrl: '', apiKey: '' })
                            setShowModal(true)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                          İlk Firmanızı Ekleyin
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => {
                    const statusConfig = getStatusConfig(company)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <tr 
                        key={company.id} 
                        className="hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Truck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{company.name}</div>
                              <div className="text-xs text-gray-500">
                                {company.apiUrl ? 'API Entegre' : 'Manuel İşlem'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {company.code.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{company.code}</div>
                              <div className="text-xs text-gray-500">Kod</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {company.apiUrl ? (
                              <>
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <Globe className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-green-700">API Bağlı</div>
                                  <div className="text-xs text-gray-500">Otomatik</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                                  <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-500">API Yok</div>
                                  <div className="text-xs text-gray-400">Manuel</div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(company)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Test API connection
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                              title="API Test"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(company.id)
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
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
          
          {filteredCompanies.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Toplam <span className="font-medium">{filteredCompanies.length}</span> kargo firması gösteriliyor
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

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingCompany ? 'Kargo Firması Düzenle' : 'Yeni Kargo Firması'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingCompany ? 'Mevcut firma bilgilerini güncelleyin' : 'Yeni bir kargo firması ekleyin'}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Firma Adı *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                      placeholder="Örn: Aras Kargo"
                      required
                    />
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kod *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                      placeholder="aras"
                      required
                    />
                    <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="https://api.example.com"
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-500 mt-1">API entegrasyonu için gerekli URL</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Anahtarı
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                    placeholder="API anahtarınızı girin"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Güvenlik için şifrelenecektir</p>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCompany(null)
                    setFormData({ name: '', code: '', apiUrl: '', apiKey: '' })
                  }}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                >
                  {editingCompany ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
