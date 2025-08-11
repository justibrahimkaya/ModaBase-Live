'use client'

import { useState } from 'react'
import { User, LogOut, Sparkles, Crown, Bell } from 'lucide-react'

export default function ClientOnlyUserMenu({ user, onLogout }: { 
  user: any, 
  onLogout: () => void 
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = () => {
    setIsUserMenuOpen(false)
    onLogout()
  }

  return (
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
  )
} 