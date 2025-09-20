'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {  
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  User,
  Shield,
  Crown,
  Activity,
  FileText
} from 'lucide-react'

interface User {
  id: string
  name: string
  surname: string
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN' | 'BUSINESS_ADMIN'
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  provider: string | null
  emailVerified: boolean | null
  image: string | null
  adminStatus: string | null
  appliedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  businessInfo: string | null
}

export default function UserDetail() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchUserDetail()
    }
  }, [userId])

  const fetchUserDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Kullanıcı bilgileri getirilemedi')
      }
      const data = await response.json()
      setUser(data)
    } catch (err: any) {
      setError(err.message || 'Kullanıcı yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setProcessingId(user.id)
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Silme işlemi başarısız')
      }

      await response.json()
      alert('Kullanıcı başarıyla silindi!')
      router.push('/super-admin/users')
    } catch (err: any) {
      alert(err.message || 'Silme işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'BUSINESS_ADMIN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'USER': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-4 w-4" />
      case 'BUSINESS_ADMIN': return <Shield className="h-4 w-4" />
      case 'USER': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-4 w-4" />
      : <XCircle className="h-4 w-4" />
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hiç giriş yapmamış'
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-white mb-2">Hata oluştu</p>
          <p className="text-gray-400 mb-4">{error || 'Kullanıcı bulunamadı'}</p>
          <button 
            onClick={() => router.push('/super-admin/users')}
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
            onClick={() => router.push('/super-admin/users')}
            className="flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              {user.image ? (
                <img src={user.image} alt="Profile" className="w-12 h-12 rounded-2xl object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user.name[0]}{user.surname[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {user.name} {user.surname}
              </h1>
              <p className="text-gray-400 mt-1">Kullanıcı Detayları</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200">
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </button>
          
          {user.role !== 'ADMIN' && (
            <button 
              onClick={handleDelete}
              disabled={processingId === user.id}
              className="flex items-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === user.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Sil
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="ml-2">
                {user.role === 'ADMIN' ? 'Site Admin' : 
                 user.role === 'BUSINESS_ADMIN' ? 'İşletme Admin' : 'Kullanıcı'}
              </span>
            </div>
            
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(user.isActive)}`}>
              {getStatusIcon(user.isActive)}
              <span className="ml-2 capitalize">
                {user.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <Activity className="h-4 w-4 mr-2" />
              {user.emailVerified ? 'E-posta Doğrulandı' : 'E-posta Doğrulanmadı'}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-400">Kayıt Tarihi</p>
            <p className="text-white font-medium">
              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>

      {/* User Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Temel Bilgiler
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Ad Soyad</label>
              <p className="text-white font-medium">{user.name} {user.surname}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">E-posta</label>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">Telefon</label>
              <p className="text-white font-medium">{user.phone || 'Telefon bilgisi yok'}</p>
            </div>
            
            {user.image && (
              <div>
                <label className="text-sm font-medium text-gray-400">Profil Resmi</label>
                <div className="mt-2">
                  <img src={user.image} alt="Profile" className="w-16 h-16 rounded-lg object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Hesap Bilgileri
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Rol</label>
              <div className="flex items-center mt-1">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  <span className="ml-1">
                    {user.role === 'ADMIN' ? 'Site Admin' : 
                     user.role === 'BUSINESS_ADMIN' ? 'İşletme Admin' : 'Kullanıcı'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">Durum</label>
              <div className="flex items-center mt-1">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
                  {getStatusIcon(user.isActive)}
                  <span className="ml-1 capitalize">
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">E-posta Doğrulama</label>
              <p className="text-white font-medium">
                {user.emailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
              </p>
            </div>
            
            {user.provider && (
              <div>
                <label className="text-sm font-medium text-gray-400">Giriş Yöntemi</label>
                <p className="text-white font-medium capitalize">{user.provider}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Aktivite Bilgileri
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Kayıt Tarihi</label>
              <p className="text-white font-medium">
                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">Son Güncelleme</label>
              <p className="text-white font-medium">
                {new Date(user.updatedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-400">Son Giriş</label>
              <p className="text-white font-medium">
                {formatDate(user.lastLoginAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Application Information */}
        {(user.adminStatus || user.appliedAt) && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Admin Başvuru Bilgileri
            </h3>
            
            <div className="space-y-4">
              {user.adminStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Başvuru Durumu</label>
                  <p className="text-white font-medium capitalize">{user.adminStatus}</p>
                </div>
              )}
              
              {user.appliedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Başvuru Tarihi</label>
                  <p className="text-white font-medium">
                    {new Date(user.appliedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              
              {user.approvedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Onay Tarihi</label>
                  <p className="text-white font-medium">
                    {new Date(user.approvedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              
              {user.rejectedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Red Tarihi</label>
                  <p className="text-white font-medium">
                    {new Date(user.rejectedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              
              {user.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Red Nedeni</label>
                  <p className="text-white">{user.rejectionReason}</p>
                </div>
              )}
              
              {user.businessInfo && (
                <div>
                  <label className="text-sm font-medium text-gray-400">İşletme Bilgileri</label>
                  <p className="text-white text-sm">{user.businessInfo}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 