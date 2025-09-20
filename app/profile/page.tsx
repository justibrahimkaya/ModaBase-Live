'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Package, Settings, LogOut, ArrowRight, ShoppingCart, Heart, Clock, Edit, Shield, Star, Crown, Sparkles, Mail, Phone, Calendar, Gift } from 'lucide-react'
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        // Business hesabı ile profile sayfasına erişim engellendi
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Server-side'da oturumu sonlandır
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Başarılı çıkış sonrası ana sayfaya yönlendir
        window.location.href = '/';
      } else {
        console.error('Çıkış yapılırken hata oluştu');
      }
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
      // Hata durumunda bile ana sayfaya yönlendir
      window.location.href = '/';
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium">Profil yükleniyor...</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300"
                >
                  Giriş Sayfasına Dön
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+CjwvcGF0dGVybj4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPgo8L3N2Zz4=')] opacity-20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-full blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-25 animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-30 animate-pulse delay-3000"></div>
        </div>

        <div className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li><a href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</a></li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Profil</li>
              </ol>
            </nav>

            {/* Premium User Badge */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                <Crown className="w-5 h-5 mr-2" />
                <span>Premium Üye</span>
                <div className="ml-2 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-300 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sticky top-8">
                  {/* User Profile Header */}
                  <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                      <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
                      {profile?.name} {profile?.surname}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">{profile?.email}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Güvenilir Üye</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2">
                    <a
                      href="/profile"
                      className="group flex items-center justify-between p-4 text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Profil Bilgileri</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/profile/addresses"
                      className="group flex items-center justify-between p-4 text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Adres Yönetimi</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/profile/orders"
                      className="group flex items-center justify-between p-4 text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Sipariş Geçmişi</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/profile/cart-history"
                      className="group flex items-center justify-between p-4 text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Sepet Geçmişi</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/profile/favorites"
                      className="group flex items-center justify-between p-4 text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Favoriler</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/profile/wishlist"
                      className="group flex items-center justify-between p-4 text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Daha Sonra Al</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <a
                      href="/profile/settings"
                      className="group flex items-center justify-between p-4 text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:shadow-md hover:border-blue-300 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Hesap Ayarları</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <button
                      onClick={handleLogout}
                      className="group w-full flex items-center justify-between p-4 text-red-600 bg-white/50 backdrop-blur-sm rounded-xl border border-red-200 hover:bg-red-50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">Çıkış Yap</span>
                      </div>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                        Profil Bilgileri
                      </h1>
                      <p className="text-gray-600">Hesap bilgilerinizi görüntüleyin ve yönetin</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Personal Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span>Kişisel Bilgiler</span>
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>Güvenli</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <label className="text-sm font-medium text-gray-700">Ad</label>
                          </div>
                          <p className="text-gray-900 font-semibold">{profile?.name}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <label className="text-sm font-medium text-gray-700">Soyad</label>
                          </div>
                          <p className="text-gray-900 font-semibold">{profile?.surname}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="w-4 h-4 text-green-600" />
                            <label className="text-sm font-medium text-gray-700">E-posta</label>
                          </div>
                          <p className="text-gray-900 font-semibold">{profile?.email}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Phone className="w-4 h-4 text-orange-600" />
                            <label className="text-sm font-medium text-gray-700">Telefon</label>
                          </div>
                          <p className="text-gray-900 font-semibold">{profile?.phone || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          <span>Hesap Bilgileri</span>
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <Star className="w-4 h-4 fill-current" />
                          <span>Aktif</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <label className="text-sm font-medium text-gray-700">Üyelik Tarihi</label>
                          </div>
                          <p className="text-gray-900 font-semibold">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('tr-TR') : '-'}
                          </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <label className="text-sm font-medium text-gray-700">Son Güncelleme</label>
                          </div>
                          <p className="text-gray-900 font-semibold">
                            {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('tr-TR') : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <span>Hızlı İşlemler</span>
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                          href="/profile/edit"
                          className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                              <Edit className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Profili Düzenle</h4>
                            <p className="text-sm text-gray-600">Kişisel bilgileri güncelle</p>
                          </div>
                        </a>

                        <a
                          href="/profile/addresses"
                          className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Adresler</h4>
                            <p className="text-sm text-gray-600">Adres bilgilerini yönet</p>
                          </div>
                        </a>

                        <a
                          href="/profile/orders"
                          className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Siparişler</h4>
                            <p className="text-sm text-gray-600">Sipariş geçmişini görüntüle</p>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Premium Features */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <div className="flex items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                          <Gift className="w-5 h-5 text-yellow-600" />
                          <span>Premium Özellikler</span>
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Crown className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">Üyelik Durumu</span>
                          </div>
                          <p className="text-gray-900 font-semibold">Premium Üye</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">Puan Durumu</span>
                          </div>
                          <p className="text-gray-900 font-semibold">1,250 ModaPuan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
