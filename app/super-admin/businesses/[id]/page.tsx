'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Building2, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Check,
  X,
  User,
  Globe,
  FileText,
  Shield,
  Activity
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
  contactName?: string
  contactSurname?: string
  taxNumber?: string
  website?: string
  rejectionReason?: string
}

export default function BusinessDetail() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.id as string
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (businessId) {
      fetchBusinessDetail()
    }
  }, [businessId])

  const fetchBusinessDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('İşletme bilgileri getirilemedi')
      }
      const data = await response.json()
      setBusiness(data)
    } catch (err: any) {
      setError(err.message || 'İşletme yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!business) return
    
    try {
      setProcessingId(business.id)
      const response = await fetch('/api/admin/business-applications/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId: business.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Onaylama işlemi başarısız')
      }

      await response.json()
      
      // Update local state
      setBusiness(prev => prev ? {
        ...prev,
        adminStatus: 'APPROVED',
        approvedAt: new Date().toISOString()
      } : null)

      alert('İşletme başarıyla onaylandı!')
    } catch (err: any) {
      alert(err.message || 'Onaylama işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (reason: string) => {
    if (!business) return
    
    try {
      setProcessingId(business.id)
      const response = await fetch('/api/admin/business-applications/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId: business.id, reason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Red işlemi başarısız')
      }

      await response.json()
      
      // Update local state
      setBusiness(prev => prev ? {
        ...prev,
        adminStatus: 'REJECTED',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      } : null)

      alert('İşletme başvurusu reddedildi!')
      setShowRejectModal(false)
      setRejectReason('')
    } catch (err: any) {
      alert(err.message || 'Red işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async () => {
    if (!business) return
    
    if (!confirm('Bu işletmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setProcessingId(business.id)
      const response = await fetch('/api/admin/businesses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId: business.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme işlemi başarısız')
      }

      await response.json()
      alert('İşletme başarıyla silindi!')
      router.push('/super-admin/businesses')
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

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">İşletme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-2">Hata oluştu</p>
          <p className="text-gray-400 mb-4">{error || 'İşletme bulunamadı'}</p>
          <button 
            onClick={() => router.push('/super-admin/businesses')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/super-admin/businesses')}
            className="flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {business.businessName}
              </h1>
              <p className="text-gray-400 mt-1">İşletme Detayları</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {business.adminStatus === 'PENDING' && (
            <>
              <button 
                onClick={handleApprove}
                disabled={processingId === business.id}
                className="flex items-center px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === business.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Onayla
              </button>
              <button 
                onClick={() => setShowRejectModal(true)}
                disabled={processingId === business.id}
                className="flex items-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4 mr-2" />
                Reddet
              </button>
            </>
          )}
          
          <button className="flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={processingId === business.id}
            className="flex items-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingId === business.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Sil
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(business.adminStatus)}`}>
              {getStatusIcon(business.adminStatus)}
              <span className="ml-2 capitalize">
                {business.adminStatus === 'APPROVED' ? 'Onaylı' : 
                 business.adminStatus === 'PENDING' ? 'Beklemede' : 'Reddedilen'}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <Activity className="h-4 w-4 mr-2" />
              {business.isActive ? 'Aktif' : 'Pasif'}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-400">Kayıt Tarihi</p>
            <p className="text-white font-medium">
              {new Date(business.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>

      {/* Business Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Temel Bilgiler
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">İşletme Adı</label>
              <p className="text-white font-medium">{business.businessName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">İşletme Türü</label>
              <p className="text-white font-medium capitalize">{business.businessType}</p>
            </div>
            
            {business.contactName && (
              <div>
                <label className="text-sm font-medium text-gray-400">İletişim Kişisi</label>
                <p className="text-white font-medium">
                  {business.contactName} {business.contactSurname}
                </p>
              </div>
            )}
            
                         {business.taxNumber && (
               <div>
                 <label className="text-sm font-medium text-gray-400">Vergi Numarası</label>
                 <p className="text-white font-medium">{business.taxNumber}</p>
               </div>
             )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            İletişim Bilgileri
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <Mail className="h-4 w-4 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">E-posta</p>
                <p className="font-medium">{business.email}</p>
              </div>
            </div>
            
            <div className="flex items-center text-white">
              <Phone className="h-4 w-4 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Telefon</p>
                <p className="font-medium">{business.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center text-white">
              <MapPin className="h-4 w-4 mr-3 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Adres</p>
                <p className="font-medium">{business.address}</p>
              </div>
            </div>
            
            {business.website && (
              <div className="flex items-center text-white">
                <Globe className="h-4 w-4 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <p className="font-medium">{business.website}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Konum Bilgileri
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Şehir</label>
              <p className="text-white font-medium">{business.city}</p>
            </div>
            
            {business.district && (
              <div>
                <label className="text-sm font-medium text-gray-400">İlçe</label>
                <p className="text-white font-medium">{business.district}</p>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Sistem Bilgileri
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Kayıt Tarihi</label>
              <p className="text-white font-medium">
                {new Date(business.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            
            {business.lastLoginAt && (
              <div>
                <label className="text-sm font-medium text-gray-400">Son Giriş</label>
                <p className="text-white font-medium">
                  {new Date(business.lastLoginAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
            
            {business.approvedAt && (
              <div>
                <label className="text-sm font-medium text-gray-400">Onay Tarihi</label>
                <p className="text-white font-medium">
                  {new Date(business.approvedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
            
            {business.rejectedAt && (
              <div>
                <label className="text-sm font-medium text-gray-400">Red Tarihi</label>
                <p className="text-white font-medium">
                  {new Date(business.rejectedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            )}
            
            {business.rejectionReason && (
              <div>
                <label className="text-sm font-medium text-gray-400">Red Nedeni</label>
                <p className="text-white">{business.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">İşletme Başvurusunu Reddet</h3>
            <p className="text-gray-400 mb-4">
              <strong>{business.businessName}</strong> işletmesinin başvurusunu reddetmek üzeresiniz.
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
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleReject(rejectReason)}
                disabled={!rejectReason.trim() || processingId === business.id}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === business.id ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 