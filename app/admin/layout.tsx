'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  FolderOpen,
  AlertTriangle,
  Truck,
  FileText,
  Crown,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Globe,
  MessageSquare
} from 'lucide-react'
import WhatsAppButton from '@/components/WhatsAppButton'
import { useRouter, usePathname } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  surname: string
  role: string
  businessName?: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Login ve register sayfaları için layout kullanma
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register' || pathname === '/admin/business-login'



  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 2 // Retry sayısını azalttım
    
    const checkAuth = async () => {
      try {
        console.log('🔍 Auth kontrol ediliyor...');
        console.log('🍪 Mevcut cookie\'ler:', document.cookie);
        
        // Cache kontrolü ekle
        const response = await fetch('/api/admin/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache', // Cache'i devre dışı bırak
          },
        })
        
        console.log('📡 Profile API yanıt:', response.status, response.statusText);
        
        if (!mounted) return
        
        if (response.ok) {
          const userData = await response.json()
          console.log('✅ Kullanıcı verisi alındı:', userData);
          setAdminUser(userData)
        } else if (response.status === 401) {
          console.log('❌ 401 Authentication failed, login\'e yönlendiriliyor...');
          // Authentication failed, redirect to login
          router.replace('/admin/business-login')
        } else if (response.status === 429) {
          // Rate limited, wait and retry
          console.warn('⚠️ Rate limited, waiting...')
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(checkAuth, 2000 * retryCount) // Daha uzun bekleme
          } else {
            console.log('❌ Rate limit max retry, login\'e yönlendiriliyor...');
            router.replace('/admin/business-login')
          }
        } else {
          // Server error, retry
          console.error('❌ Server error:', response.status);
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        if (mounted) {
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`🔄 Auth retry ${retryCount}/${maxRetries} in ${1000 * retryCount}ms`);
            setTimeout(checkAuth, 1000 * retryCount) // Exponential backoff
          } else {
            console.log('❌ Max retry reached, login\'e yönlendiriliyor...');
            router.replace('/admin/business-login')
          }
        }
      } finally {
        if (mounted && (retryCount === 0 || retryCount >= maxRetries)) {
          console.log('🏁 Auth check tamamlandı, loading false');
          setLoading(false)
        }
      }
    }
    
    // İlk yüklemede hemen çalıştır
    checkAuth()
    
    return () => {
      mounted = false
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setAdminUser(null)
      router.replace('/admin/business-login')
    } catch (error) {
      console.error('Logout error:', error)
      router.replace('/admin/business-login')
    }
  }

  // 🎭 Müşteri görünümü toggle function'ı  
  const handleSiteView = async () => {
    // Müşteri olarak görüntüle modunu aç
    document.cookie = 'viewing_as_customer=true; path=/; max-age=86400; SameSite=Lax'
    
    // Kısa delay sonra ana sayfaya yönlendir
    await new Promise(resolve => setTimeout(resolve, 100))
    window.location.replace('/?customer_view=true')
  }



  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      isActive: pathname === '/admin',
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      name: 'Siparişler',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      isActive: pathname.startsWith('/admin/orders'),
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      name: 'Ürünler',
      href: '/admin/products',
      icon: Package,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      isActive: pathname.startsWith('/admin/products'),
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      name: 'Kategoriler',
      href: '/admin/categories',
      icon: FolderOpen,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      isActive: pathname.startsWith('/admin/categories'),
      roles: ['SITE_ADMIN']
    },
    {
      name: 'Mesajlar',
      href: '/admin/messages',
      icon: MessageSquare,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      isActive: pathname.startsWith('/admin/messages'),
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      name: 'İşletme Kategorileri',
      href: '/admin/categories/business',
      icon: FolderOpen,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      isActive: pathname.startsWith('/admin/categories/business'),
      roles: ['BUSINESS_ADMIN']
    },
    {
      name: 'Stok Uyarıları',
      href: '/admin/stock-alerts',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      isActive: pathname.startsWith('/admin/stock-alerts'),
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      name: 'Kargo Firmaları',
      href: '/admin/shipping',
      icon: Truck,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      isActive: pathname.startsWith('/admin/shipping'),
      roles: ['SITE_ADMIN']
    },
    {
      name: 'E-Faturalar',
      href: '/admin/invoices',
      icon: FileText,
      color: 'from-teal-500 to-emerald-600',
      bgColor: 'bg-teal-50',
      isActive: pathname.startsWith('/admin/invoices'),
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    },
    {
      name: 'Kullanıcılar',
      href: '/admin/users',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      isActive: pathname.startsWith('/admin/users'),
      roles: ['SITE_ADMIN']
    },
    {
      name: 'Ayarlar',
      href: '/admin/settings',
      icon: Settings,
      color: 'from-slate-500 to-gray-600',
      bgColor: 'bg-slate-50',
      isActive: pathname.startsWith('/admin/settings'),
      roles: ['SITE_ADMIN', 'BUSINESS_ADMIN']
    }
  ]

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(adminUser?.role || '')
  )

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Auth pages don't need the full layout
  if (isAuthPage) {
    return <>{children}</>
  }

  // User not authenticated
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col">
          {/* Mobile Sidebar Content */}
          <div className="flex flex-col flex-grow bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 backdrop-blur-xl border-r border-white/10 shadow-2xl">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-1.5 w-1.5 text-white" />
                  </div>
                </div>
                <div className="ml-2">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    ModaBase
                  </h1>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 touch-manipulation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
              {filteredNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                    item.isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-purple-600/20 text-white border border-orange-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${item.isActive ? 'bg-gradient-to-r ' + item.color : 'bg-white/10'}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.isActive && (
                    <ChevronRight className="h-4 w-4 ml-2 text-orange-400" />
                  )}
                </a>
              ))}
            </nav>

            {/* Mobile User Info & Logout */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {adminUser.name?.[0]}{adminUser.surname?.[0]}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {adminUser.name} {adminUser.surname}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{adminUser.email}</p>
                  {adminUser.role === 'BUSINESS_ADMIN' && adminUser.businessName && (
                    <p className="text-xs text-blue-300 truncate">{adminUser.businessName}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 touch-manipulation"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow relative">
          {/* Ultra Modern Background with Glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl m-3"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/5 rounded-3xl m-3"></div>
          
          {/* Advanced Floating Elements */}
          <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
          
          <div className="relative z-10 flex flex-col flex-grow bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl m-3 shadow-2xl shadow-purple-900/50">
            {/* Ultra Modern Header */}
            <div className="flex h-16 items-center px-6 border-b border-white/20">
              <div className="flex items-center">
                <div className="relative group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300 transform group-hover:scale-110">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                    <Sparkles className="h-2.5 w-2.5 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    ModaBase
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Ultra Professional User Info */}
            <div className="px-6 py-4 border-b border-white/20">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 group-hover:border-white/30 transition-all duration-300 shadow-xl">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/30 transform group-hover:scale-105 transition-all duration-300">
                        <span className="text-sm font-bold text-white">
                          {adminUser.name?.[0]}{adminUser.surname?.[0]}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white/30 shadow-lg">
                        <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent truncate">
                        {adminUser.name} {adminUser.surname}
                      </p>
                      <p className="text-xs text-gray-300 mb-1 font-medium truncate">{adminUser.email}</p>
                      {adminUser.role === 'BUSINESS_ADMIN' && adminUser.businessName && (
                        <p className="text-xs text-blue-300 mb-1 font-medium truncate">{adminUser.businessName}</p>
                      )}
                      <div className="flex items-center">
                        <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-400/40 rounded-full backdrop-blur-sm">
                          <span className="text-xs font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                            {adminUser.role === 'SITE_ADMIN' ? '👑 Super Admin' : '🏢 İşletme Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ultra Modern Navigation */}
            <nav className="flex-1 space-y-3 px-6 py-6 overflow-y-auto">
              {filteredNavigation.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-500 hover:scale-105 ${
                    item.isActive
                      ? `bg-gradient-to-r ${item.color.replace('from-', 'from-').replace('to-', 'to-')}/20 text-white border border-white/30 shadow-2xl transform scale-105`
                      : 'text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-xl'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: `translateY(${index * 2}px)`
                  }}
                >
                  {/* Background Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl blur-lg transition-all duration-500 ${
                    item.isActive 
                      ? `bg-gradient-to-r ${item.color}/30 opacity-60` 
                      : 'bg-white/5 opacity-0 group-hover:opacity-30'
                  }`}></div>
                  
                  {/* Icon Container */}
                  <div className={`relative p-3 rounded-xl mr-4 transition-all duration-500 group-hover:scale-110 ${
                    item.isActive 
                      ? `bg-gradient-to-r ${item.color} shadow-2xl ring-2 ring-white/30` 
                      : 'bg-white/15 group-hover:bg-white/25 shadow-lg'
                  }`}>
                    <item.icon className="h-5 w-5" />
                    {item.isActive && (
                      <div className="absolute inset-0 bg-white/30 rounded-xl animate-pulse"></div>
                    )}
                    {!item.isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    )}
                  </div>
                  
                  {/* Text */}
                  <span className={`flex-1 relative z-10 ${
                    item.isActive 
                      ? 'bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent'
                      : 'group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text group-hover:text-transparent'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Active Indicator */}
                  {item.isActive && (
                    <div className="flex items-center relative z-10">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-2 animate-pulse shadow-lg"></div>
                      <ChevronRight className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                  
                  {/* Hover Arrow */}
                  {!item.isActive && (
                    <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-white transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  )}
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform -skew-x-12 group-hover:animate-shimmer"></div>
                </a>
              ))}
            </nav>

            {/* Ultra Professional Logout */}
            <div className="p-6 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="group relative flex items-center w-full px-4 py-4 text-sm font-bold text-red-300 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 border border-red-400/30 rounded-2xl hover:bg-gradient-to-r hover:from-red-500/20 hover:via-pink-500/20 hover:to-red-500/20 hover:text-red-200 hover:scale-105 hover:shadow-2xl transition-all duration-500 shadow-xl backdrop-blur-sm"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                
                {/* Icon Container */}
                <div className="relative p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl mr-4 group-hover:bg-gradient-to-r group-hover:from-red-500/30 group-hover:to-pink-500/30 group-hover:scale-110 transition-all duration-500 shadow-lg ring-2 ring-red-400/20">
                  <LogOut className="h-5 w-5" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </div>
                
                {/* Text */}
                <span className="flex-1 relative z-10 bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent group-hover:from-red-200 group-hover:to-pink-200">
                  Güvenli Çıkış
                </span>
                
                {/* Status Indicator */}
                <div className="flex items-center relative z-10">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse shadow-lg mr-2"></div>
                  <ChevronRight className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
                </div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000 transform -skew-x-12 group-hover:animate-shimmer"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-86">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/20 bg-white/80 backdrop-blur-xl px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-3 lg:gap-x-6">
              {/* View Site Button */}
              <button
                onClick={handleSiteView}
                className="group relative flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 touch-manipulation"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center">
                  <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md mr-2 shadow-sm">
                    <Globe className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="hidden sm:block mr-1">Siteyi Görüntüle</span>
                  <span className="sm:hidden">Site</span>
                  <ExternalLink className="h-3 w-3 ml-1 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </button>

              <div className="hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {adminUser.name} {adminUser.surname}
                    </p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-white">
                      {adminUser.name?.[0]}{adminUser.surname?.[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* WhatsApp Support Button for Business Admins */}
      {adminUser?.role === 'BUSINESS_ADMIN' && (
        <WhatsAppButton
          phoneNumber="905555555555"
          variant="floating"
          size="lg"
          isBusinessAdmin={true}
          className="bottom-6 right-6"
        />
      )}

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .border-3 {
          border-width: 3px;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out;
        }
      `}</style>
    </div>
  )
}
