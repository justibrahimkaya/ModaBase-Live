'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  AlertTriangle,
  Check,
  X
} from 'lucide-react'

interface Business {
  id: string
  businessName: string
  email: string
  phone: string
  address: string
  businessType: string
  city: string
  district: string | null
  adminStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
}

export default function BusinessManagement() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/businesses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('İşletmeler getirilemedi')
      }
      const data = await response.json()
      setBusinesses(data)
    } catch (err: any) {
      setError(err.message || 'İşletmeler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (businessId: string) => {
    try {
      setProcessingId(businessId)
      const response = await fetch('/api/admin/business-applications/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId: businessId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Onaylama işlemi başarısız')
      }

      await response.json()
      
      // Update local state
      setBusinesses(prev => prev.map(business => 
        business.id === businessId 
          ? { ...business, adminStatus: 'APPROVED', approvedAt: new Date().toISOString() }
          : business
      ))

      alert('İşletme başarıyla onaylandı!')
    } catch (err: any) {
      alert(err.message || 'Onaylama işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (businessId: string, reason: string) => {
    try {
      setProcessingId(businessId)
      const response = await fetch('/api/admin/business-applications/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId: businessId, reason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Red işlemi başarısız')
      }

      await response.json()
      
      // Update local state
      setBusinesses(prev => prev.map(business => 
        business.id === businessId 
          ? { ...business, adminStatus: 'REJECTED', rejectedAt: new Date().toISOString() }
          : business
      ))

      alert('İşletme başvurusu reddedildi!')
      setShowRejectModal(false)
      setSelectedBusiness(null)
      setRejectReason('')
    } catch (err: any) {
      alert(err.message || 'Red işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (business: Business) => {
    setSelectedBusiness(business)
    setShowRejectModal(true)
  }

  const handleDelete = async (businessId: string) => {
    if (!confirm('Bu işletmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setProcessingId(businessId)
      const response = await fetch('/api/admin/businesses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme işlemi başarısız')
      }

      await response.json()
      
      // Update local state
      setBusinesses(prev => prev.filter(business => business.id !== businessId))

      alert('İşletme başarıyla silindi!')
    } catch (err: any) {
      alert(err.message || 'Silme işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || business.adminStatus === statusFilter.toUpperCase()
    return matchesSearch && matchesStatus
  })

  const stats = [
    {
      name: 'Toplam İşletme',
      value: businesses.length,
      icon: Building2,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      name: 'Onaylı İşletme',
      value: businesses.filter(b => b.adminStatus === 'APPROVED').length,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      name: 'Bekleyen Başvuru',
      value: businesses.filter(b => b.adminStatus === 'PENDING').length,
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      name: 'Reddedilen',
      value: businesses.filter(b => b.adminStatus === 'REJECTED').length,
      icon: XCircle,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">İşletmeler yükleniyor...</p>
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
            onClick={fetchBusinesses}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                İşletme Yönetimi
              </h1>
              <p className="text-gray-400 mt-1">Tüm işletmeleri yönetin ve denetleyin</p>
            </div>
          </div>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Yeni İşletme
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} ${stat.bgColor} backdrop-blur-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="İşletme adı veya e-posta ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="APPROVED">Onaylı</option>
              <option value="PENDING">Beklemede</option>
              <option value="REJECTED">Reddedilen</option>
            </select>
            
            <button className="flex items-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBusinesses.map((business) => (
          <div
            key={business.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Business Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{business.businessName}</h3>
                  <p className="text-sm text-gray-400">{business.businessType}</p>
                </div>
              </div>
              
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(business.adminStatus)} mb-4`}>
              {getStatusIcon(business.adminStatus)}
              <span className="ml-1 capitalize">{business.adminStatus === 'APPROVED' ? 'Onaylı' : business.adminStatus === 'PENDING' ? 'Beklemede' : 'Reddedilen'}</span>
            </div>

            {/* Business Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {business.email}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                {business.phone}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                {business.address}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(business.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button 
                onClick={() => router.push(`/super-admin/businesses/${business.id}`)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Görüntüle
              </button>
              
              {/* Show approve/reject buttons only for pending businesses */}
              {business.adminStatus === 'PENDING' && (
                <>
                  <button 
                    onClick={() => handleApprove(business.id)}
                    disabled={processingId === business.id}
                    className="flex items-center justify-center px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === business.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => openRejectModal(business)}
                    disabled={processingId === business.id}
                    className="flex items-center justify-center px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
              
              <button className="flex items-center justify-center px-3 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-all duration-200">
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(business.id)}
                disabled={processingId === business.id}
                className="flex items-center justify-center px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === business.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">İşletme bulunamadı</h3>
          <p className="text-gray-400">Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">İşletme Başvurusunu Reddet</h3>
            <p className="text-gray-400 mb-4">
              <strong>{selectedBusiness.businessName}</strong> işletmesinin başvurusunu reddetmek üzeresiniz.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Red Nedeni *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Red nedenini belirtin..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedBusiness(null)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleReject(selectedBusiness.id, rejectReason)}
                disabled={!rejectReason.trim() || processingId === selectedBusiness.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedBusiness.id ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
