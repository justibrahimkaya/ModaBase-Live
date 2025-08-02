'use client'

import { useState, useEffect } from 'react'
import { User, Save, ArrowLeft, Settings, Shield, Mail, Phone, Calendar, Edit3, CheckCircle, XCircle, Lock } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserProfile {
  id: string
  email: string
  name: string
  surname: string
  phone: string
  createdAt: string
  updatedAt: string
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: ''
  })
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // 🛡️ Business hesabı kontrolü
      const businessCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_business='))
      
      if (businessCookie) {
        // Business hesabı ile profile edit sayfasına erişim engellendi
        window.location.href = '/admin'
        return
      }

      const response = await fetch('/api/profile')
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Profil bilgileri alınamadı')
      }
      const data = await response.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        surname: data.surname || '',
        phone: data.phone || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    // 🛡️ Business hesabı kontrolü
    const businessCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_business='))
    
    if (businessCookie) {
      // Business hesabı ile profile update engellendi
      window.location.href = '/admin'
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Profil güncellenemedi')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setSuccess('Profil bilgileriniz başarıyla güncellendi.')
      
      // Success mesajını 3 saniye sonra temizle
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const getMembershipDuration = () => {
    if (!profile?.createdAt) return ''
    const now = new Date()
    const created = new Date(profile.createdAt)
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays < 30) return diffInDays + ' gün'
    if (diffInDays < 365) return Math.floor(diffInDays / 30) + ' ay'
    return Math.floor(diffInDays / 365) + ' yıl'
  }

  if (loading) {
    return (
      <div>
        <Header />
        
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzYzNzNGRiIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        <main className="relative min-h-screen pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-24">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 border border-white/20 shadow-2xl inline-block">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
                </div>
                <p className="mt-6 text-white/80 text-lg">Profil bilgileri yükleniyor...</p>
                <p className="mt-2 text-white/60 text-sm">Lütfen bekleyiniz</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzYzNzNGRiIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        {/* Floating Settings Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: (3 + Math.random() * 2) + 's'
              }}
            >
              <Settings className="w-4 h-4 text-blue-400/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(180deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <main className="relative min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li><a href="/" className="hover:text-white transition-colors">Ana Sayfa</a></li>
              <li>/</li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profil</a></li>
              <li>/</li>
              <li className="text-white">Ayarlar</li>
            </ol>
          </nav>

          {/* Back Button */}
          <div className="flex items-center space-x-4 mb-8">
            <a
              href="/profile"
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Profile Dön</span>
            </a>
          </div>

          {/* Main Content */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-8 border-b border-white/20">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Profil Ayarları</h1>
                  <p className="text-white/70">Kişisel bilgilerinizi güvenli şekilde güncelleyin</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Alerts */}
              {error && (
                <div className="mb-6 backdrop-blur-sm bg-red-500/20 border border-red-500/30 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 backdrop-blur-sm bg-green-500/20 border border-green-500/30 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-200 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Current Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/30 rounded-full">
                      <Mail className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">E-posta</p>
                      <p className="text-white font-medium truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-500/30 rounded-full">
                      <Calendar className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Üyelik Süresi</p>
                      <p className="text-white font-medium">{getMembershipDuration()}</p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-500/30 rounded-full">
                      <Shield className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Hesap Durumu</p>
                      <p className="text-white font-medium">Aktif</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-6">
                  <Edit3 className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Bilgileri Düzenle</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Ad *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 ${
                            focusedField === 'name' 
                              ? 'border-blue-400 bg-white/20 ring-2 ring-blue-400/50' 
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          placeholder="Adınızı girin"
                          required
                        />
                        <User className="absolute right-3 top-3 w-5 h-5 text-white/40" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Soyad *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                          onFocus={() => setFocusedField('surname')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 ${
                            focusedField === 'surname' 
                              ? 'border-blue-400 bg-white/20 ring-2 ring-blue-400/50' 
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          placeholder="Soyadınızı girin"
                          required
                        />
                        <User className="absolute right-3 top-3 w-5 h-5 text-white/40" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-2">
                        Telefon
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 ${
                            focusedField === 'phone' 
                              ? 'border-blue-400 bg-white/20 ring-2 ring-blue-400/50' 
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          placeholder="+90 5XX XXX XX XX"
                        />
                        <Phone className="absolute right-3 top-3 w-5 h-5 text-white/40" />
                      </div>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-blue-300 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-200 mb-1">Güvenlik Bilgisi</h4>
                        <p className="text-sm text-blue-200/80">
                          E-posta adresiniz güvenlik nedeniyle değiştirilemez. E-posta adresinizi değiştirmek istiyorsanız 
                          müşteri hizmetleri ile iletişime geçin.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                    <a
                      href="/profile"
                      className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30"
                    >
                      İptal
                    </a>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none min-w-[160px]"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Kaydediliyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Save className="w-4 h-4" />
                          <span>Değişiklikleri Kaydet</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
