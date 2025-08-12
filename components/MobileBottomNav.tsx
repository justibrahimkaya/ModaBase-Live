'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Search, 
  ShoppingBag, 
  Heart, 
  User,
  Sparkles
} from 'lucide-react'
import { useCart } from './CartContext'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { getCount } = useCart()
  const [cartCount, setCartCount] = useState(0)
  const [showCartBadge, setShowCartBadge] = useState(false) // ✅ Badge kontrolü

  useEffect(() => {
    // ✅ Client-side mount sonrası cart badge'ini göster
    setShowCartBadge(true)
    setCartCount(getCount())
  }, [getCount])

  // Admin/backend sayfalarında gösterme
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    return null
  }

  const navItems = [
    {
      id: 'home',
      label: 'Ana Sayfa',
      icon: Home,
      href: '/',
      isActive: pathname === '/'
    },
    {
      id: 'search',
      label: 'Keşfet',
      icon: Search,
      href: '/products',
      isActive: pathname === '/products'
    },
    {
      id: 'cart',
      label: 'Sepet',
      icon: ShoppingBag,
      href: '/cart',
      isActive: pathname === '/cart',
      badge: showCartBadge && cartCount > 0 ? cartCount : undefined // ✅ Hydration-safe badge
    },
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: Heart,
      href: '/favorites',
      isActive: pathname === '/favorites'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      href: '/profile',
      isActive: pathname.startsWith('/profile') || pathname === '/login'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-50 pb-safe">
      {/* Gradient Shadow */}
      <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
      
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.id}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 touch-manipulation
                ${item.isActive 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }
              `}
            >
              {/* Badge for cart */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
              
              {/* Icon */}
              <Icon className={`w-6 h-6 mb-1 ${item.isActive ? 'text-white' : ''}`} />
              
              {/* Label */}
              <span className={`text-xs font-medium leading-none ${item.isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {item.isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </a>
          )
        })}
      </div>
      
      {/* Special offer banner (occasional) */}
      <div className="absolute -top-8 left-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-3 rounded-full text-center opacity-90 pointer-events-none">
        <Sparkles className="w-3 h-3 inline mr-1" />
        2500₺+ Ücretsiz Kargo!
      </div>
    </nav>
  )
} 