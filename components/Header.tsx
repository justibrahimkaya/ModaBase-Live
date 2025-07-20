'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, User, Menu, X, LogOut, Sparkles, Crown, Bell } from 'lucide-react'
import { useCart } from './CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [adminLoading, setAdminLoading] = useState(true)

  const { getCount } = useCart()

  useEffect(() => {
    checkUserAuth()
    
    // Admin kontrolünü sadece admin sayfalarında yap
    const path = window.location.pathname
    if (path.includes('/admin') || path.includes('/super-admin') || path === '/') {
      checkAdminAuth()
    }
    
    // Sayfa geçişlerinde de kontrol et
    const handleFocus = () => {
      checkUserAuth()
      const currentPath = window.location.pathname
      if (currentPath.includes('/admin') || currentPath.includes('/super-admin') || currentPath === '/') {
        checkAdminAuth()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const checkUserAuth = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    }
  }

  const checkAdminAuth = async () => {
    try {
      setAdminLoading(true)
      const response = await fetch('/api/admin/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const adminData = await response.json()
        setAdminInfo(adminData)
      } else {
        setAdminInfo(null)
      }
    } catch (error) {
      setAdminInfo(null)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setAdminInfo(null)
      setIsUserMenuOpen(false)
      window.location.href = '/'
    } catch (error) {
      setUser(null)
      setAdminInfo(null)
      setIsUserMenuOpen(false)
      window.location.href = '/'
    }
  }

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  return (
    <>
      {/* Floating Header - Mobile optimized */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-2xl mobile-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo - Mobile optimized */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    ModaBase
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Ücretsiz Üyelik</p>
                </div>
                {/* Mobile logo text */}
                <div className="block sm:hidden">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    ModaBase
                  </h1>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {[
                { name: 'Ana Sayfa', href: '/', gradient: 'from-blue-500 to-purple-600' },
                { name: 'Kadın', href: '/products?search=kadın', gradient: 'from-pink-500 to-rose-600' },
                { name: 'Erkek', href: '/products?search=erkek', gradient: 'from-cyan-500 to-blue-600' },
                { name: 'Çocuk', href: '/products?search=çocuk', gradient: 'from-yellow-500 to-orange-600' },
                { name: 'Aksesuar', href: '/products?search=aksesuar', gradient: 'from-purple-500 to-pink-600' },
                { name: 'İndirimler', href: '/products?discount=true', gradient: 'from-red-500 to-pink-600' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-white transition-all duration-300 group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <span className="relative z-10">{item.name}</span>
                </a>
              ))}
              
              {/* Business Admin Panel - IN NAVIGATION */}
              {!adminLoading && adminInfo && adminInfo.role === 'BUSINESS_ADMIN' && (
                <div className="border-l border-gray-300 ml-4 pl-4">
                  <a
                    href="/admin"
                    className="relative px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span>🏪</span>
                      <span>İŞLETME PANELİM</span>
                    </span>
                  </a>
                </div>
              )}
            </nav>



            {/* Right side actions - Mobile optimized */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Site Admin ONLY - Desktop only */}
              {!adminLoading && adminInfo && (adminInfo.role === 'ADMIN' || adminInfo.role === 'SITE_ADMIN') && (
                <div className="hidden lg:block mr-2">
                  <a
                    href="/super-admin"
                    className="group relative px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 border-2 border-red-300 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-600 hover:to-pink-600 shadow-lg"
                    title="Site Yöneticisi Dashboard"
                  >
                    <div className="relative z-10 flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-red-700 group-hover:text-white transition-colors">
                          🚀 MODABASE
                        </span>
                        <span className="text-xs text-red-600 group-hover:text-red-200 transition-colors">
                          {adminInfo.name || adminInfo.email}
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              )}
              
              {/* Admin Loading Indicator */}
              {adminLoading && (
                <div className="hidden lg:block mr-2">
                  <div className="animate-pulse">
                    <div className="w-32 h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              )}
              
              {/* Separate Admin Login Buttons - Desktop */}
              {!adminLoading && !adminInfo && (
                <div className="hidden lg:flex items-center space-x-2 mr-2">
                  {/* Site Admin Login */}
                  <a
                    href="/super-admin/login"
                    className="group relative px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 border border-red-200 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white"
                    title="Site Yöneticisi Girişi"
                  >
                    <span className="relative z-10 flex items-center space-x-1 text-sm font-semibold">
                      <Crown className="h-4 w-4" />
                      <span>ModaBase</span>
                    </span>
                  </a>
                  
                  {/* Business Admin Login */}
                  <a
                    href="/admin/business-login"
                    className="group relative px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 border border-green-200 bg-green-50 hover:bg-green-600 text-green-700 hover:text-white"
                    title="İşletme Girişi"
                  >
                    <span className="relative z-10 flex items-center space-x-1 text-sm font-semibold">
                      <span>🏪</span>
                      <span>İşletme Girişi</span>
                    </span>
                  </a>
                </div>
              )}

              {/* User Menu - Mobile optimized */}
              <div className="relative user-menu">
                <button 
                  className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/30 group"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="Kullanıcı menüsü"
                >
                  {user ? (
                    <div className="flex items-center space-x-2">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-white font-bold">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  ) : (
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-gray-900" />
                  )}
                </button>

                {/* User dropdown - Mobile optimized */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name} {user.surname}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <User className="h-4 w-4 mr-3" />
                          Profilim
                        </a>
                        <a href="/profile/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Bell className="h-4 w-4 mr-3" />
                          Siparişlerim
                        </a>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Çıkış Yap
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          Giriş Yap
                        </a>
                        <a href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          Kayıt Ol
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Cart - Mobile optimized */}
              <div className="relative">
                <button 
                  className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/30 group"
                  onClick={() => window.location.href = '/cart'}
                  aria-label="Sepet"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-gray-900" />
                  {getCount() > 0 && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      {getCount()}
                    </div>
                  )}
                </button>
              </div>
              
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/30 group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menü"
              >
                {isMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-gray-900" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:text-gray-900" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Improved overflow handling */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-white/20 backdrop-blur-xl bg-white/90 mobile-safe-bottom">
              <div className="px-4 py-4 space-y-2 max-h-screen overflow-y-auto">


                {/* Mobile Navigation Links */}
                {[
                  { name: 'Ana Sayfa', href: '/', gradient: 'from-blue-500 to-purple-600' },
                  { name: 'Kadın', href: '/products?search=kadın', gradient: 'from-pink-500 to-rose-600' },
                  { name: 'Erkek', href: '/products?search=erkek', gradient: 'from-cyan-500 to-blue-600' },
                  { name: 'Çocuk', href: '/products?search=çocuk', gradient: 'from-yellow-500 to-orange-600' },
                  { name: 'Aksesuar', href: '/products?search=aksesuar', gradient: 'from-purple-500 to-pink-600' },
                  { name: 'İndirimler', href: '/products?discount=true', gradient: 'from-red-500 to-pink-600' },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-white transition-all duration-300 relative group overflow-hidden"
                    style={{ minHeight: '48px' }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`}></div>
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <span className="relative z-10 flex items-center h-full">{item.name}</span>
                  </a>
                ))}
                
                {/* Site Admin ONLY - Mobile */}
                {!adminLoading && adminInfo && (adminInfo.role === 'ADMIN' || adminInfo.role === 'SITE_ADMIN') && (
                  <div className="mt-4 pt-4 border-t-2 border-red-200">
                    <a
                      href="/super-admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden bg-gradient-to-r from-red-500/10 to-pink-500/10 border-2 border-red-300"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="relative z-10 flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-red-700 group-hover:text-white transition-colors text-base">
                            🚀 MODABASE
                          </div>
                          <div className="text-xs text-red-600 group-hover:text-red-200 transition-colors">
                            {adminInfo.name || adminInfo.email} • Tam Yetki
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                {/* Business Admin ONLY - Mobile */}
                {!adminLoading && adminInfo && adminInfo.role === 'BUSINESS_ADMIN' && (
                  <div className="mt-4 pt-4 border-t-2 border-green-200">
                    <a
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-2 border-emerald-300"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="relative z-10 flex items-center space-x-3 w-full">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">🏪</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-emerald-700 group-hover:text-white transition-colors text-base">
                            İŞLETME PANELİM
                          </div>
                          <div className="text-xs text-emerald-600 group-hover:text-emerald-200 transition-colors">
                            {adminInfo.name || adminInfo.email} • Mağaza Yönetimi
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                {/* Separate Admin Login Buttons - Mobile */}
                {!adminLoading && !adminInfo && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Site Admin Login - Mobile */}
                    <a
                      href="/super-admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="relative z-10 flex items-center space-x-3 w-full">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            ModaBase Girişi
                          </div>
                          <div className="text-xs opacity-75">
                            Tüm sistemi yönetmek için
                          </div>
                        </div>
                      </div>
                    </a>
                    
                    {/* Business Admin Login - Mobile */}
                    <a
                      href="/admin/business-login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border border-green-200"
                      style={{ minHeight: '48px' }}
                    >
                      <div className="relative z-10 flex items-center space-x-3 w-full">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🏪</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            İşletme Girişi
                          </div>
                          <div className="text-xs opacity-75">
                            Mağazanızı yönetmek için
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}


    </>
  )
}
