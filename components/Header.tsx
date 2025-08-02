'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, User, Menu, LogOut, Sparkles, Crown, Bell } from 'lucide-react'
import { useCart } from './CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [adminLoading, setAdminLoading] = useState(true)
  const [showCartCount, setShowCartCount] = useState(false) // ✅ Cart badge kontrolü
  const [isHydrated, setIsHydrated] = useState(false) // 🔧 SSR hydration fix

  const { getCount } = useCart()

  useEffect(() => {
    // Client-side kontrolü ekle - SSR safety
    if (typeof window === 'undefined') return
    
    // 🔧 Hydration complete - SSR safe olduğunu işaretle
    setIsHydrated(true)
    
    // ✅ Cart badge'ini hydration sonrası göster
    setShowCartCount(true)
    

    
    // Admin kontrolünü sadece gerekli sayfalarında yap
    try {
      const path = window?.location?.pathname || ''
      if (path.includes('/admin') || path.includes('/super-admin') || path === '/') {
        checkAdminAuth()
      }
    } catch (error) {
      // Silence any window access errors during SSR
      console.log('SSR: Window access skipped')
    }
    
    // Initial auth check - admin info yüklendikten sonra yap
    const timer = setTimeout(() => {
      // AdminInfo yüklenme durumunu kontrol et
      if (adminLoading) {
        // Hâlâ yükleniyor, biraz daha bekle
        setTimeout(checkUserAuth, 300)
      } else {
        checkUserAuth()
      }
    }, 500) // Daha uzun delay
    
    // Sayfa focus event listener
    const handleFocus = () => {
      if (typeof window === 'undefined') return
      
      // 🛡️ Business hesabı varsa focus event'inde auth check yapma
      const allCookies = document.cookie
      const hasBusinessSession = allCookies.includes('session_business=') && 
                                 allCookies.indexOf('session_business=') !== -1
      
      if (!hasBusinessSession) {
        // Sadece normal kullanıcılar için auth check yap
        console.log('🔄 Focus event: Normal kullanıcı için auth check')
        checkUserAuth()
      } else {
        console.log('🔄 Focus event: Business kullanıcı, auth check atlandı')
      }
      
      try {
        const currentPath = window?.location?.pathname || ''
        if (currentPath.includes('/admin') || currentPath.includes('/super-admin') || currentPath === '/') {
          checkAdminAuth()
        }
      } catch (error) {
        // Silence window access errors
      }
    }
    
    // Event listener ekleme - güvenli
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('focus', handleFocus)
    }
    
    // Her durumda timer cleanup
    return () => {
      clearTimeout(timer) // Timer cleanup
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [])  // Sadece mount'ta bir kez çalış

          const checkUserAuth = async () => {
      try {
        // 🛡️ DETAYLI ADMIN INFO CHECK
        console.log('🔍 Admin durumu:', { 
          adminInfo: !!adminInfo, 
          adminLoading, 
          adminId: adminInfo?.id 
        })
        
        if (adminInfo && adminInfo.id) {
          console.log('🏢 Admin info tespit edildi, business hesabı - /api/profile çağrısı atlandı')
          setUser(null)
          return
        }
        
        if (adminLoading) {
          console.log('⏳ Admin bilgisi hâlâ yükleniyor, /api/profile çağrısı geciktirildi')
          return
        }

        // 🛡️ SSR-SAFE: Browser check
        if (typeof window === 'undefined') return
        
        // 🛡️ Sadece normal kullanıcılar için profile çağrısı yap
        console.log('✅ Normal kullanıcı tespit edildi, /api/profile çağrısı yapılacak')
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
        // 401 (Unauthorized) normal durum - kullanıcı giriş yapmamış
        setUser(null)
      }
    } catch (error) {
      // Network hatalarında sadece user'ı null yap, console'da hata gösterme
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
      {/* Header - Ultra Professional Mobile Optimization */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 px-3 sm:px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menüyü aç/kapat"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            
            {/* Logo - Mobile Optimized */}
            <div className="flex-shrink-0">
              <a href="/" className="block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ModaBase
                </h1>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <a href="/" className="nav-link">Ana Sayfa</a>
              <a href="/products" className="nav-link">Ürünler</a>
              <a href="/blog" className="nav-link">Blog</a>
              <a href="#" className="nav-link">Kampanyalar</a>
              <a href="#" className="nav-link">İletişim</a>
            </nav>

            {/* Right Side Actions - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Admin Panel Links - Desktop Only */}
              {!adminLoading && !adminInfo && (
                <div className="hidden lg:flex items-center space-x-2">
                  <a
                    href="/super-admin/login"
                    className="admin-link admin-link-site"
                    title="Site Yöneticisi Girişi"
                  >
                    <Crown className="h-4 w-4" />
                    <span>ModaBase</span>
                  </a>
                  <a
                    href="/admin/business-login"
                    className="admin-link admin-link-business"
                    title="İşletme Girişi"
                  >
                    <span>🏪</span>
                    <span>İşletme</span>
                  </a>
                </div>
              )}

              {/* Admin Info - Mobile Optimized */}
              {adminInfo && (
                <div className="hidden sm:block">
                  <a href={adminInfo.role === 'SITE_ADMIN' ? '/super-admin' : '/admin'} 
                     className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      {adminInfo.role === 'SITE_ADMIN' ? (
                        <Crown className="h-3 w-3 text-white" />
                      ) : (
                        <span className="text-xs text-white">🏪</span>
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium text-green-800">
                        {adminInfo.role === 'SITE_ADMIN' ? 'Site Admin' : adminInfo.businessName || 'İşletme'}
                      </div>
                      <div className="text-xs text-green-600">{adminInfo.email}</div>
                    </div>
                  </a>
                </div>
              )}

              {/* Cart Button - Mobile Optimized */}
              <a
                href="/cart"
                className="relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 touch-manipulation group"
                aria-label="Sepet"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                {showCartCount && getCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {getCount()}
                  </span>
                )}
              </a>

                              {/* User Menu - REACT OFFICIAL FIX - useEffect pattern */}
                {!adminInfo && isHydrated && (
                  <div className="relative user-menu">
                <button 
                  className="relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 hover:from-gray-100 hover:to-slate-100 transition-all duration-300 touch-manipulation group"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="Kullanıcı menüsü"
                >
                  {user ? (
                    <div className="flex items-center space-x-2">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-white font-bold">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-gray-900 max-w-20 truncate">
                        {user.name}
                      </span>
                    </div>
                  ) : (
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-gray-900" />
                  )}
                </button>

                {/* User Dropdown - Mobile Optimized */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name} {user.surname}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <a href="/profile" className="mobile-menu-item">
                          <User className="h-4 w-4" />
                          Profilim
                        </a>
                        <a href="/profile/orders" className="mobile-menu-item">
                          <Bell className="h-4 w-4" />
                          Siparişlerim
                        </a>
                        <a href="/profile/favorites" className="mobile-menu-item">
                          <Sparkles className="h-4 w-4" />
                          Favorilerim
                        </a>
                        <button 
                          onClick={handleLogout}
                          className="mobile-menu-item text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Çıkış Yap
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/login" className="mobile-menu-item">
                          <User className="h-4 w-4" />
                          Giriş Yap
                        </a>
                        <a href="/register" className="mobile-menu-item">
                          <Crown className="h-4 w-4" />
                          Kayıt Ol
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-xl border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <a href="/" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                Ana Sayfa
              </a>
              <a href="/products" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                Ürünler
              </a>
              <a href="/blog" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                Blog
              </a>
              <a href="#" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                Kampanyalar
              </a>
              <a href="#" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                İletişim
              </a>
              
              {/* Mobile Admin Links */}
              {!adminLoading && !adminInfo && (
                <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                  <a href="/super-admin/login" className="mobile-nav-item text-red-600" onClick={() => setIsMenuOpen(false)}>
                    <Crown className="h-4 w-4" />
                    Site Admin
                  </a>
                  <a href="/admin/business-login" className="mobile-nav-item text-green-600" onClick={() => setIsMenuOpen(false)}>
                    <span>🏪</span>
                    İşletme Girişi
                  </a>
                </div>
              )}
              
              {adminInfo && (
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <a href={adminInfo.role === 'SITE_ADMIN' ? '/super-admin' : '/admin'} 
                     className="mobile-nav-item text-green-600" 
                     onClick={() => setIsMenuOpen(false)}>
                    {adminInfo.role === 'SITE_ADMIN' ? (
                      <Crown className="h-4 w-4" />
                    ) : (
                      <span>🏪</span>
                    )}
                    {adminInfo.role === 'SITE_ADMIN' ? 'Site Admin Panel' : `${adminInfo.businessName || 'İşletme'} Panel`}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}
