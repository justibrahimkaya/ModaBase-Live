'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Calendar,
  MoreVertical,
  Shield,
  Crown,
  User,
  AlertTriangle
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
}

export default function UserManagement() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Kullanıcılar getirilemedi')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err: any) {
      console.error('Kullanıcılar yüklenirken hata:', err)
      setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
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

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Aktif' : 'Pasif'
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

  const handleDelete = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setProcessingId(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
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
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId))

      alert('Kullanıcı başarıyla silindi!')
    } catch (err: any) {
      alert(err.message || 'Silme işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = [
    {
      name: 'Toplam Kullanıcı',
      value: users.length,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      name: 'Aktif Kullanıcı',
      value: users.filter(u => u.isActive).length,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      name: 'Site Adminleri',
      value: users.filter(u => u.role === 'ADMIN').length,
      icon: Crown,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      name: 'İşletme Adminleri',
      value: users.filter(u => u.role === 'BUSINESS_ADMIN').length,
      icon: Shield,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">Kullanıcılar yükleniyor...</p>
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
            onClick={fetchUsers}
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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Kullanıcı Yönetimi
              </h1>
              <p className="text-gray-400 mt-1">Tüm kullanıcıları yönetin ve denetleyin</p>
            </div>
          </div>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
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
                placeholder="İsim, soyisim veya e-posta ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tüm Roller</option>
              <option value="USER">Kullanıcı</option>
              <option value="BUSINESS_ADMIN">İşletme Admin</option>
              <option value="ADMIN">Site Admin</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
            
            <button className="flex items-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* User Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">
                    {user.name[0]}{user.surname[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{user.name} {user.surname}</h3>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Role & Status */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span className="ml-1">
                  {user.role === 'ADMIN' ? 'Site Admin' : 
                   user.role === 'BUSINESS_ADMIN' ? 'İşletme Admin' : 'Kullanıcı'}
                </span>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
                {getStatusIcon(user.isActive)}
                <span className="ml-1 capitalize">
                  {getStatusText(user.isActive)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                {user.phone || 'Telefon bilgisi yok'}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                Katılım: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                Son giriş: {formatDate(user.lastLoginAt)}
              </div>
              {user.provider && (
                <div className="flex items-center text-sm text-gray-400">
                  <Shield className="h-4 w-4 mr-2" />
                  Giriş: {user.provider}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button 
                onClick={() => router.push(`/super-admin/users/${user.id}`)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Görüntüle
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-all duration-200">
                <Edit className="h-4 w-4" />
              </button>
              {user.role !== 'ADMIN' && (
                <button 
                  onClick={() => handleDelete(user.id)}
                  disabled={processingId === user.id}
                  className="flex items-center justify-center px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === user.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Kullanıcı bulunamadı</h3>
          <p className="text-gray-400">Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      )}
    </div>
  )
}
