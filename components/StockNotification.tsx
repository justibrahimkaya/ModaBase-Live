'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, Mail, Check, X, AlertCircle, Info } from 'lucide-react'

interface StockNotificationProps {
  productId: string
  productName: string
  currentStock: number
  isVisible?: boolean
}

export default function StockNotification({ 
  productId, 
  productName, 
  currentStock, 
  isVisible = true 
}: StockNotificationProps) {
  const { data: session } = useSession()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  useEffect(() => {
    if (session?.user && currentStock === 0) {
      checkSubscriptionStatus()
    }
  }, [session, productId, currentStock])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stock-notifications')
      if (response.ok) {
        const notifications = await response.json()
        const isSubscribed = notifications.some((n: any) => n.productId === productId)
        setIsSubscribed(isSubscribed)
      }
    } catch (error) {
      console.error('Subscription status check error:', error)
    }
  }

  const handleSubscribe = async () => {
    if (!session?.user && !guestEmail) {
      setShowEmailInput(true)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          guestEmail: session?.user ? undefined : guestEmail
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setMessage('Stok bildirimi oluşturuldu! Ürün stoka girdiğinde size haber vereceğiz.')
        setMessageType('success')
        setShowEmailInput(false)
        setGuestEmail('')
      } else {
        setMessage(data.error || 'Bir hata oluştu')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(false)
        setMessage('Stok bildirimi iptal edildi')
        setMessageType('info')
      } else {
        setMessage(data.error || 'Bir hata oluştu')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Bağlantı hatası oluştu')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = () => {
    if (!guestEmail || !guestEmail.includes('@')) {
      setMessage('Geçerli bir email adresi girin')
      setMessageType('error')
      return
    }
    handleSubscribe()
  }

  // Stok varsa veya görünür değilse hiçbir şey gösterme
  if (!isVisible || currentStock > 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Ana Bildirim Kartı */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bu ürün şu anda stokta yok
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>{productName}</strong> stoka girdiğinde size haber verelim
            </p>

            {/* Kayıtlı Kullanıcı */}
            {session?.user ? (
              <div className="flex items-center space-x-3">
                {!isSubscribed ? (
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Bell className="w-5 h-5" />
                    <span>{isLoading ? 'Kaydediliyor...' : 'Stok Bildirimi Oluştur'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Bildirim Aktif</span>
                    </div>
                    <button
                      onClick={handleUnsubscribe}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>{isLoading ? 'İptal ediliyor...' : 'İptal Et'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Misafir Kullanıcı */
              <div className="space-y-3">
                {!showEmailInput ? (
                  <button
                    onClick={() => setShowEmailInput(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5" />
                    <span>E-posta ile Bildirim Al</span>
                  </button>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <input
                          type="email"
                          placeholder="E-posta adresiniz"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                        />
                      </div>
                      <button
                        onClick={handleEmailSubmit}
                        disabled={isLoading || !guestEmail}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isLoading ? 'Gönderiliyor...' : 'Gönder'}
                      </button>
                      <button
                        onClick={() => {
                          setShowEmailInput(false)
                          setGuestEmail('')
                          setMessage('')
                        }}
                        className="text-gray-500 hover:text-gray-700 p-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mesaj Gösterimi */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          messageType === 'success' ? 'bg-green-50 border border-green-200' :
          messageType === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex-shrink-0">
            {messageType === 'success' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : messageType === 'error' ? (
              <X className="w-5 h-5 text-red-600" />
            ) : (
              <Info className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <p className={`text-sm font-medium ${
            messageType === 'success' ? 'text-green-800' :
            messageType === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Bilgi Notu */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Stok Bildirimi Nasıl Çalışır?</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Ürün stoka girdiğinde size anında email gönderilir</li>
              <li>• Bildirim sadece bir kez gönderilir</li>
              <li>• İstediğiniz zaman bildirimi iptal edebilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
 