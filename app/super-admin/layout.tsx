'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Building2,
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Crown,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Globe,
  Server,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface SuperAdminUser {
  id: string
  email: string
  name: string
  surname: string
  role: string
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [superAdmin, setSuperAdmin] = useState<SuperAdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  const isAuthPage = pathname === '/super-admin/login'

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 3
    
    const checkSuperAdminAuth = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!mounted) return
        
        if (response.ok) {
          const userData = await response.json()
          // Sadece site adminleri erişebilir
          if (userData.role === 'ADMIN') {
            setSuperAdmin(userData)
          } else {
            // İşletme adminleri veya diğer roller erişemez
            router.replace('/super-admin/login')
          }
        } else if (response.status === 401) {
          router.replace('/super-admin/login')
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        console.error('Super admin auth check failed:', error)
        if (mounted) {
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(checkSuperAdminAuth, 1000 * retryCount)
          } else {
            router.replace('/super-admin/login')
          }
        }
      } finally {
        if (mounted && (retryCount === 0 || retryCount >= maxRetries)) {
          setLoading(false)
        }
      }
    }
    
    checkSuperAdminAuth()
    
    return () => {
      mounted = false
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setSuperAdmin(null)
      router.replace('/super-admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.replace('/super-admin/login')
    }
  }

  const navigation = [
    {
      name: 'Süper Dashboard',
      href: '/super-admin',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      isActive: pathname === '/super-admin'
    },
    {
      name: 'İşletme Yönetimi',
      href: '/super-admin/businesses',
      icon: Building2,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      isActive: pathname.startsWith('/super-admin/businesses')
    },
    {
      name: 'Kullanıcı Yönetimi',
      href: '/super-admin/users',
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      isActive: pathname.startsWith('/super-admin/users')
    },
    {
      name: 'Sistem Ayarları',
      href: '/super-admin/settings',
      icon: Settings,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      isActive: pathname.startsWith('/super-admin/settings')
    },
    {
      name: 'Sistem Durumu',
      href: '/super-admin/system',
      icon: Server,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      isActive: pathname.startsWith('/super-admin/system')
    }
  ]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-red-600 to-pink-700 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mb-2">Süper Admin Paneli</p>
          <p className="text-gray-300">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  // Auth pages don't need the full layout
  if (isAuthPage) {
    return <>{children}</>
  }

  // User not authenticated or not super admin
  if (!superAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Yönlendiriliyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col">
          {/* Mobile Sidebar Content */}
          <div className="flex flex-col flex-grow bg-gradient-to-br from-red-900 via-pink-900 to-red-900 backdrop-blur-xl border-r border-white/10 shadow-2xl">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  <p className="text-xs text-gray-400">Süper Admin</p>
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
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                    item.isActive
                      ? 'bg-gradient-to-r from-red-500/20 to-pink-600/20 text-white border border-red-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 ${item.isActive ? 'bg-gradient-to-r ' + item.color : 'bg-white/10'}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.isActive && (
                    <ChevronRight className="h-4 w-4 ml-2 text-red-400" />
                  )}
                </a>
              ))}
            </nav>

            {/* Mobile User Info & Logout */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {superAdmin.name?.[0]}{superAdmin.surname?.[0]}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {superAdmin.name} {superAdmin.surname}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{superAdmin.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="px-2 py-0.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/40 rounded-full">
                      <span className="text-xs font-bold text-red-300">👑 Süper Admin</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* View Site Button - Mobile */}
              <button
                onClick={() => window.open('/', '_blank')}
                className="flex items-center w-full px-4 py-3 mb-3 text-sm font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 hover:text-blue-200 transition-all duration-200 touch-manipulation"
              >
                <div className="p-2 bg-blue-500/20 rounded mr-3">
                  <Globe className="h-4 w-4" />
                </div>
                <span className="flex-1">Siteyi Görüntüle</span>
                <ExternalLink className="h-4 w-4 opacity-60" />
              </button>
              
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-br from-red-900 via-pink-900 to-red-900 backdrop-blur-xl border-r border-white/10 shadow-2xl">
          {/* Desktop Header */}
          <div className="flex h-20 items-center justify-center px-6 border-b border-white/10">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Süper Admin
                </h1>
                <p className="text-sm text-gray-400">Sistem Yönetimi</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.isActive
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-600/20 text-white border border-red-500/30 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 ${item.isActive ? 'bg-gradient-to-r ' + item.color : 'bg-white/10'}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                {item.name}
                {item.isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto text-red-400" />
                )}
              </a>
            ))}
          </nav>

          {/* Desktop User Info */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {superAdmin.name?.[0]}{superAdmin.surname?.[0]}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {superAdmin.name} {superAdmin.surname}
                </p>
                <p className="text-xs text-gray-400">Süper Admin</p>
              </div>
            </div>
            
            {/* View Site Button - Desktop */}
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center w-full px-3 py-2 mb-3 text-sm font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 hover:text-blue-200 transition-all duration-200"
            >
              <div className="p-1.5 bg-blue-500/20 rounded mr-3">
                <Globe className="h-4 w-4" />
              </div>
              <span className="flex-1">Siteyi Görüntüle</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
            >
              <div className="p-1.5 bg-red-500/20 rounded mr-3">
                <LogOut className="h-4 w-4" />
              </div>
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-gradient-to-r from-red-900/90 to-pink-900/90 backdrop-blur-xl px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden touch-manipulation"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Kenar çubuğunu aç</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            Süper Admin Paneli
          </div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white">
                {superAdmin.name?.[0]}{superAdmin.surname?.[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
