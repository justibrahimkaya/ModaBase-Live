'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

// Mobil cihaz kontrolü
const isMobile = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
}

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  variant?: 'floating' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  businessName?: string
  isBusinessAdmin?: boolean
}

export default function WhatsAppButton({
  phoneNumber,
  message = '',
  variant = 'floating',
  size = 'md',
  className = '',
  businessName = '',
  isBusinessAdmin = false
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [whatsappNumbers, setWhatsappNumbers] = useState({
    support: phoneNumber,
    business: phoneNumber,
    admin: phoneNumber
  })

  // Mobil cihaz kontrolü
  useEffect(() => {
    setIsMobileDevice(isMobile())
  }, [])

  // WhatsApp numaralarını API'den al
  useEffect(() => {
    const fetchWhatsAppNumbers = async () => {
      try {
        const response = await fetch('/api/whatsapp')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setWhatsappNumbers(data.data)
          }
        }
      } catch (error) {
        console.error('WhatsApp numbers fetch error:', error)
      }
    }

    fetchWhatsAppNumbers()
  }, [])

  // Doğru numarayı seç
  const getPhoneNumber = () => {
    if (isBusinessAdmin) {
      return whatsappNumbers.admin
    }
    return whatsappNumbers.support
  }

  const getSizeClasses = () => {
    // Mobilde minimum 44px touch target
    if (isMobileDevice) {
      switch (size) {
        case 'sm':
          return 'w-12 h-12' // Mobilde minimum boyut
        case 'lg':
          return 'w-16 h-16'
        default:
          return 'w-14 h-14' // Mobilde orta boyut
      }
    }
    
    // Desktop boyutları
    switch (size) {
      case 'sm':
        return 'w-10 h-10'
      case 'lg':
        return 'w-16 h-16'
      default:
        return 'w-12 h-12'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-5 h-5'
      case 'lg':
        return 'w-8 h-8'
      default:
        return 'w-6 h-6'
    }
  }

  const handleClick = () => {
    const defaultMessage = isBusinessAdmin 
      ? `Merhaba, ModaBase işletme hesabım hakkında bilgi almak istiyorum.`
      : businessName 
        ? `Merhaba, ${businessName} mağazanızdan ürün hakkında bilgi almak istiyorum.`
        : 'Merhaba, ürün hakkında bilgi almak istiyorum.'

    const finalMessage = message || defaultMessage
    const encodedMessage = encodeURIComponent(finalMessage)
    const whatsappUrl = `https://wa.me/${getPhoneNumber()}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed z-50 ${className} ${isMobileDevice ? 'whatsapp-floating-mobile' : 'bottom-6 right-6'}`}>
        <button
          onClick={handleClick}
          onMouseEnter={() => !isMobileDevice && setIsHovered(true)}
          onMouseLeave={() => !isMobileDevice && setIsHovered(false)}
          className={`
            ${getSizeClasses()} 
            bg-green-500 ${!isMobileDevice ? 'hover:bg-green-600' : 'whatsapp-active-mobile'} 
            text-white rounded-full shadow-lg ${!isMobileDevice ? 'hover:shadow-xl' : 'active:shadow-xl'} 
            transition-all duration-300 ${!isMobileDevice ? 'transform hover:scale-110' : 'transform active:scale-95'}
            flex items-center justify-center
            group
            ${isMobileDevice ? 'whatsapp-button-mobile' : ''}
          `}
          title={isBusinessAdmin ? "ModaBase ile iletişime geç" : "İşletme ile iletişime geç"}
        >
          <MessageCircle className={getIconSize()} />
          
          {/* Tooltip - Sadece desktop'ta göster */}
          {isHovered && !isMobileDevice && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-90">
              {isBusinessAdmin ? "ModaBase Destek" : "WhatsApp ile İletişim"}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    )
  }

  // Inline variant
  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-green-500 ${!isMobileDevice ? 'hover:bg-green-600' : 'whatsapp-active-mobile'} 
        text-white rounded-lg shadow-md ${!isMobileDevice ? 'hover:shadow-lg' : 'active:shadow-lg'} 
        transition-all duration-300 ${!isMobileDevice ? 'transform hover:scale-105' : 'transform active:scale-95'}
        ${isMobileDevice ? 'whatsapp-button-mobile' : ''}
        ${className}
      `}
      title={isBusinessAdmin ? "ModaBase ile iletişime geç" : "İşletme ile iletişime geç"}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="font-medium">
        {isBusinessAdmin ? "ModaBase Destek" : "WhatsApp"}
      </span>
    </button>
  )
}
