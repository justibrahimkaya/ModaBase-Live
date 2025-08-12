'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Globe,
  UserCheck
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  surname: string | null
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  provider: string | null
  emailVerified: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Kullanıcılar getirilemedi')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setError(error.message || 'Kullanıcılar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const name = user.name || ''
    const surname = user.surname || ''
    const email = user.email || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hiç giriş yapılmamış'
    
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800'
      case 'MODERATOR':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
      case 'USER':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'MODERATOR':
        return 'Moderatör'
      case 'USER':
        return 'Kullanıcı'
      default:
        return role
    }
  }

  const getProviderIcon = (provider: string | null) => {
    if (!provider) return null
    
    switch (provider) {
      case 'google':
        return <Globe className="h-3 w-3 text-red-500" />
      case 'facebook':
        return <Globe className="h-3 w-3 text-blue-500" />
      default:
        return <UserCheck className="h-3 w-3 text-gray-500" />
    }
  }

  const getProviderText = (provider: string | null) => {
    if (!provider) return 'Email'
    
    switch (provider) {
      case 'google':
        return 'Google'
      case 'facebook':
        return 'Facebook'
      default:
        return provider
    }
  }

  const getUserDisplayName = (user: User) => {
    if (user.name && user.surname) {
      return `${user.name} ${user.surname}`
    }
    if (user.name) {
      return user.name
    }
    if (user.surname) {
      return user.surname
    }
    return user.email.split('@')[0]
  }

  const getUserInitials = (user: User) => {
    if (user.name && user.surname) {
      return `${user.name[0]}${user.surname[0]}`
    }
    if (user.name) {
      return user.name[0]
    }
    if (user.surname) {
      return user.surname[0]
    }
    return user.email?.[0]?.toUpperCase() || '?'
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="h-16 w-16 mx-auto mb-2" />
            <p className="text-lg font-medium">Hata</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button 
            onClick={fetchUsers}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-lg text-gray-600 font-medium">Kullanıcı hesaplarını görüntüle ve yönet</p>
        </div>

        {/* Controls */}
        <div className="group relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">Tüm Roller</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATOR">Moderatör</option>
                  <option value="USER">Kullanıcı</option>
                </select>

                <button 
                  onClick={fetchUsers}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Yenile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-gray-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-white mr-3" />
                  <h3 className="text-xl font-semibold text-white">Kullanıcılar</h3>
                </div>
                <div className="text-orange-400 text-sm font-medium">
                  {filteredUsers.length} kullanıcı
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kullanıcı</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İletişim</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kayıt Türü</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Son Giriş</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-white">
                              {getUserInitials(user)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                            : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                        }`}>
                          {user.isActive ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                          {getProviderIcon(user.provider)}
                          <span className="ml-1">{getProviderText(user.provider)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(user.lastLoginAt)}
                          </div>
                        ) : (
                          'Hiç giriş yapılmamış'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Kullanıcı bulunamadı</p>
                <p className="text-gray-400 text-sm">Arama kriterlerinizi değiştirin veya veritabanını kontrol edin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
